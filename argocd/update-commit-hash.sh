#!/bin/bash
# This script is run by ArgoCD before syncing the application
# It updates the configmap with the current commit hash and ensures zero-downtime deploys

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

CURRENT_TIMESTAMP="$(date -u +%FT%TZ)"

# Clean the commit hash to ensure it's a valid Kubernetes label
# Only allow alphanumeric characters, '-', '_', or '.'
CLEAN_COMMIT_HASH=$(echo "$COMMIT_HASH" | tr -cd 'a-zA-Z0-9-_.')

# Update the configmap with the commit hash and timestamp
echo "Updating configmap with commit hash: $CLEAN_COMMIT_HASH and timestamp: $CURRENT_TIMESTAMP"
kubectl patch configmap build-info -n lilypad --type=merge -p "{\"data\":{\"git_commit\":\"$CLEAN_COMMIT_HASH\",\"current_timestamp\":\"$CURRENT_TIMESTAMP\"}}" || true

# Apply the pod disruption budget first
echo "Ensuring PodDisruptionBudget is in place..."
cat <<EOF | kubectl apply -f -
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: rp-dashboard-pdb
  namespace: lilypad
  annotations:
    argocd.argoproj.io/sync-wave: "-1"
spec:
  maxUnavailable: 0
  selector:
    matchLabels:
      app: rp-dashboard
EOF

# Patch deployment to use a controlled rollout strategy
echo "Patching deployment to use proper rollout strategy"
kubectl patch deployment rp-dashboard -n lilypad --type=merge -p '{
  "spec": {
    "strategy": {
      "type": "RollingUpdate",
      "rollingUpdate": {
        "maxUnavailable": 0,
        "maxSurge": 1
      }
    },
    "minReadySeconds": 30
  }
}' || true

# Update the deployment with new revision label to trigger rolling update
echo "Updating deployment with new revision label: $CLEAN_COMMIT_HASH"
kubectl patch deployment rp-dashboard -n lilypad --type=strategic --patch "{
  \"spec\": {
    \"template\": {
      \"metadata\": {
        \"labels\": {
          \"revision\": \"$CLEAN_COMMIT_HASH\"
        },
        \"annotations\": {
          \"git-commit\": \"$CLEAN_COMMIT_HASH\",
          \"kubectl.kubernetes.io/restartedAt\": \"$CURRENT_TIMESTAMP\"
        }
      }
    }
  }
}" || true

echo "Update complete! ArgoCD will now manage the rollout with zero downtime."
exit 0
