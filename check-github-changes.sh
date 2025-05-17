#!/bin/bash
# Script to check if the GitHub commit hash has changed and force a redeploy if it has
# This can be run manually or as a cron job

set -e

# Repository details
REPO_OWNER="arsen3d"
REPO_NAME="rp_status"
BRANCH="main"  # or your default branch

# File to store the last known commit hash
COMMIT_FILE="/tmp/last_github_commit.txt"

# Get the latest commit hash from GitHub
echo "Fetching latest commit from GitHub..."
LATEST_COMMIT=$(curl -s https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/commits/$BRANCH | grep -m 1 "sha" | cut -d '"' -f 4)

if [ -z "$LATEST_COMMIT" ]; then
    echo "Failed to fetch latest commit hash. Exiting."
    exit 1
fi

echo "Latest commit: $LATEST_COMMIT"

# Check if we have a stored commit hash
if [ -f "$COMMIT_FILE" ]; then
    STORED_COMMIT=$(cat "$COMMIT_FILE")
    echo "Previously deployed commit: $STORED_COMMIT"
    
    if [ "$LATEST_COMMIT" = "$STORED_COMMIT" ]; then
        echo "No changes detected. Commit hash is still $LATEST_COMMIT"
        exit 0
    fi
    
    echo "New commit detected! Triggering redeploy..."
else
    echo "No previous commit hash found. This appears to be the first run."
    echo "Triggering initial deployment..."
fi

# Update the commit in our configmap
kubectl patch configmap build-info -n lilypad --type=merge -p "{\"data\":{\"git_commit\":\"$LATEST_COMMIT\"}}"

# Update the deployment to use the new commit hash
kubectl patch deployment rp-dashboard -n lilypad --type=strategic --patch "{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"git-commit\":\"$LATEST_COMMIT\"}}}}}"

# Force a rollout
kubectl rollout restart deployment rp-dashboard -n lilypad

# Wait for the rollout to complete
kubectl rollout status deployment rp-dashboard -n lilypad

# Save the new commit hash
echo "$LATEST_COMMIT" > "$COMMIT_FILE"
echo "Deployment updated to commit $LATEST_COMMIT"
