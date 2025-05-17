#!/bin/bash
# Script to update the deployment file with actual commit hash instead of placeholders
# This script fixes the issue where new commits don't trigger deployment updates

set -e

# Repository details
REPO_OWNER="arsen3d"
REPO_NAME="rp_status"
BRANCH="main"

# Get the latest commit hash from GitHub
echo "Fetching latest commit from GitHub..."
LATEST_COMMIT=$(curl -s https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/commits/$BRANCH | grep -m 1 "sha" | cut -d '"' -f 4)

if [ -z "$LATEST_COMMIT" ]; then
    echo "Failed to fetch latest commit hash. Exiting."
    exit 1
fi

echo "Latest commit: $LATEST_COMMIT"
CLEAN_COMMIT=$(echo $LATEST_COMMIT | cut -c 1-8)
echo "Clean commit (short): $CLEAN_COMMIT"

# Update the commit in our configmap
echo "Updating ConfigMap with commit hash..."
kubectl get configmap build-info -n lilypad 2>/dev/null || kubectl create configmap build-info -n lilypad
kubectl patch configmap build-info -n lilypad --type=merge -p "{\"data\":{\"git_commit\":\"$LATEST_COMMIT\",\"clean_commit\":\"$CLEAN_COMMIT\"}}"

# Update the deployment to use the proper commit hash instead of placeholders
echo "Updating deployment annotations..."
kubectl get deployment rp-dashboard -n lilypad 2>/dev/null && (
    # Update git-commit and revision annotations in Deployment metadata
    kubectl patch deployment rp-dashboard -n lilypad --type=strategic --patch "{\"metadata\":{\"annotations\":{\"git-commit\":\"$LATEST_COMMIT\",\"revision\":\"$CLEAN_COMMIT\"}}}"
    
    # Update git-commit and kubectl.kubernetes.io/restartedAt annotations in Pod Template
    kubectl patch deployment rp-dashboard -n lilypad --type=strategic --patch "{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"git-commit\":\"$LATEST_COMMIT\",\"kubectl.kubernetes.io/restartedAt\":\"$(date -u +%FT%TZ)\"},\"labels\":{\"revision\":\"$CLEAN_COMMIT\"}}}}}"
    
    # Force a rollout with explicit new hash
    echo "Forcing deployment restart..."
    kubectl rollout restart deployment rp-dashboard -n lilypad
    kubectl rollout status deployment rp-dashboard -n lilypad
) || echo "Deployment not found - no updates applied"

# Update ApplicationSet or Application if needed
kubectl get application rp-status -n argocd 2>/dev/null && (
    echo "Updating ArgoCD application to use commit: $LATEST_COMMIT"
    kubectl patch application rp-status -n argocd --type=merge -p "{\"spec\":{\"source\":{\"targetRevision\":\"$LATEST_COMMIT\"}}}"
    
    # Force a refresh of the ArgoCD application
    echo "Forcing ArgoCD to refresh the application..."
    kubectl patch application rp-status -n argocd --type=json -p="[{\"op\":\"replace\",\"path\":\"/metadata/annotations/argocd.argoproj.io~1refresh\",\"value\":\"hard\"}]"
) || echo "ArgoCD application not found - no updates applied"

echo "Done! The deployment should now use commit $LATEST_COMMIT"
echo "Check the pod status with: kubectl get pods -n lilypad"
