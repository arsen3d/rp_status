#!/bin/bash
# Script to update the ArgoCD application with the latest commit hash
# Usage: ./update-argocd-commit.sh

set -e

# Repository details
REPO_OWNER="arsen3d"
REPO_NAME="rp_status"
BRANCH="main"  # or your default branch

# Get the latest commit hash from GitHub
echo "Fetching latest commit from GitHub..."
LATEST_COMMIT=$(curl -s https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/commits/$BRANCH | grep -m 1 "sha" | cut -d '"' -f 4)

if [ -z "$LATEST_COMMIT" ]; then
    echo "Failed to fetch latest commit hash. Using timestamp instead."
    LATEST_COMMIT="timestamp-$(date +%s)"
fi

echo "Latest commit: $LATEST_COMMIT"

# Create a patch for the application to use the new commit hash
echo "Updating ArgoCD application to use commit: $LATEST_COMMIT"

# First approach: Update the application's targetRevision
kubectl patch application rp-status -n argocd --type=merge -p "{\"spec\":{\"source\":{\"targetRevision\":\"$LATEST_COMMIT\"}}}"

# Second approach: Update the configmap with the git commit hash
kubectl patch configmap build-info -n lilypad --type=merge -p "{\"data\":{\"git_commit\":\"$LATEST_COMMIT\"}}"

# Force a refresh of the ArgoCD application
echo "Forcing ArgoCD to refresh the application..."
kubectl patch application rp-status -n argocd --type=json -p="[{\"op\":\"replace\",\"path\":\"/metadata/annotations/argocd.argoproj.io~1refresh\",\"value\":\"$(date +%s)\"}]"

echo "Done! ArgoCD should now sync to commit $LATEST_COMMIT"
echo "Monitor the sync status in the ArgoCD UI or with: argocd app get rp-status"
