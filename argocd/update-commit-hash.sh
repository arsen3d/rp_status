#!/bin/bash
# Script to fetch the latest commit hash from GitHub and use it to force redeployment

# Repository details
REPO_OWNER="arsen3d"
REPO_NAME="rp_status"
BRANCH="main"  # or your default branch

# Get the latest commit hash from GitHub
LATEST_COMMIT=$(curl -s https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/commits/$BRANCH | grep -m 1 "sha" | cut -d '"' -f 4)

if [ -z "$LATEST_COMMIT" ]; then
    echo "Failed to fetch latest commit hash. Using timestamp instead."
    LATEST_COMMIT="timestamp-$(date +%s)"
fi

echo "Latest commit: $LATEST_COMMIT"

# Update the configmap with the latest commit hash
kubectl patch configmap build-info -n lilypad --type=merge -p "{\"data\":{\"git_commit\":\"$LATEST_COMMIT\"}}"

# Update the deployment to use the new commit hash
kubectl patch deployment rp-dashboard -n lilypad --type=strategic --patch "{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"git-commit\":\"$LATEST_COMMIT\"}}}}}"

echo "Updated deployment with latest commit hash: $LATEST_COMMIT"
