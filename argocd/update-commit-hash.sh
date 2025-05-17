#!/bin/bash
# This script is run by ArgoCD before syncing the application
# It updates the configmap with the current commit hash

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

# Update the deployment annotation to force a redeploy
echo "Updating deployment annotation with commit hash: $COMMIT_HASH"
kubectl patch deployment rp-dashboard -n lilypad --type=strategic --patch "{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"git-commit\":\"$COMMIT_HASH\"}}}}}" || true

echo "Commit hash updated successfully"
