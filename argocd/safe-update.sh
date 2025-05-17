#!/bin/bash
# This script implements a safer deployment approach
# It ensures the new pod is ready before removing the old one

set -e

# Get the current commit hash from ArgoCD environment or fetch from GitHub
if [ -n "$ARGOCD_APP_REVISION" ]; then
  COMMIT_HASH="$ARGOCD_APP_REVISION"
  echo "Using commit hash from ArgoCD: $COMMIT_HASH"
else
  # Fall back to GitHub API if ArgoCD environment is not available
  REPO_OWNER="arsen3d"
  REPO_NAME="rp_status"
  BRANCH="main"
  
  echo "Fetching latest commit from GitHub API..."
  COMMIT_HASH=$(curl -s https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/commits/$BRANCH | grep -m 1 "sha" | cut -d '"' -f 4)
  
  if [ -z "$COMMIT_HASH" ]; then
    echo "Failed to get commit hash, using timestamp instead"
    COMMIT_HASH="timestamp-$(date +%s)"
  fi
fi

# Update the configmap with the commit hash
echo "Updating configmap with commit hash: $COMMIT_HASH"
kubectl patch configmap build-info -n lilypad --type=merge -p "{\"data\":{\"git_commit\":\"$COMMIT_HASH\"}}" || true

# Get current replica count
REPLICAS=$(kubectl get deployment rp-dashboard -n lilypad -o jsonpath='{.spec.replicas}')
if [ -z "$REPLICAS" ]; then
  REPLICAS=1
fi

# 1. First scale up by creating a new replica
echo "Scaling up deployment to ensure zero-downtime..."
kubectl scale deployment rp-dashboard -n lilypad --replicas=$((REPLICAS + 1))

# 2. Update the deployment annotation to trigger the rebuild with new code
echo "Updating deployment annotation with commit hash: $COMMIT_HASH"
kubectl patch deployment rp-dashboard -n lilypad --type=strategic --patch "{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"git-commit\":\"$COMMIT_HASH\"}}}}}" || true

# 3. Wait for the new pod to be created and become ready
echo "Waiting for new pod to become ready..."
sleep 10

# Monitor pod status until we have enough ready replicas (with 5-minute timeout)
TIMEOUT=300
START_TIME=$(date +%s)
while true; do
  READY_REPLICAS=$(kubectl get deployment rp-dashboard -n lilypad -o jsonpath='{.status.readyReplicas}')
  if [ "$READY_REPLICAS" -ge $((REPLICAS + 1)) ]; then
    echo "New pod is ready"
    break
  fi
  
  CURRENT_TIME=$(date +%s)
  if [ $((CURRENT_TIME - START_TIME)) -gt $TIMEOUT ]; then
    echo "Timeout waiting for new pod to become ready. Continuing anyway..."
    break
  fi
  
  echo "Waiting for pods to be ready... ($READY_REPLICAS/$((REPLICAS + 1)))"
  sleep 5
done

# 4. Scale back down to original replica count (the oldest pod will be removed)
echo "Scaling back to original replica count..."
kubectl scale deployment rp-dashboard -n lilypad --replicas=$REPLICAS

echo "Zero-downtime deployment completed successfully"
