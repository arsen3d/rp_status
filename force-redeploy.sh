#!/bin/bash
# This script will force the rp-dashboard deployment to redeploy,
# even if no code changes have been made

# Generate a timestamp
TIMESTAMP=$(date +%s)

echo "====================================="
echo "  Forcing redeployment of rp-dashboard"
echo "====================================="

# Check if we should fetch the latest commit from GitHub
if [ "$1" == "--github" ] || [ "$1" == "-g" ]; then
    echo "Fetching latest commit from GitHub..."
    
    # Repository details
    REPO_OWNER="arsen3d"
    REPO_NAME="rp_status"
    BRANCH="main"  # or your default branch

    # Get the latest commit hash from GitHub
    LATEST_COMMIT=$(curl -s https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/commits/$BRANCH | grep -m 1 "sha" | cut -d '"' -f 4)

    if [ -z "$LATEST_COMMIT" ]; then
        echo "Failed to fetch latest commit hash. Using timestamp instead."
        LATEST_COMMIT="timestamp-$TIMESTAMP"
    fi

    echo "Latest commit: $LATEST_COMMIT"
    
    # Update the commit in our configmap
    kubectl patch configmap build-info -n lilypad --type=merge -p "{\"data\":{\"git_commit\":\"$LATEST_COMMIT\"}}"
    
    # Update the deployment to use the new commit hash
    kubectl patch deployment rp-dashboard -n lilypad --type=strategic --patch "{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"git-commit\":\"$LATEST_COMMIT\"}}}}}"
else
    # Update the metadata annotations with a new timestamp
    echo "Adding timestamp annotation to force redeployment..."
    kubectl patch deployment rp-dashboard -n lilypad --type=strategic --patch "{\"metadata\":{\"annotations\":{\"force-redeploy\":\"${TIMESTAMP}\"}}}"

    # Also update the pod template annotations to force a rollout
    echo "Updating pod template annotations..."
    kubectl patch deployment rp-dashboard -n lilypad --type=strategic --patch "{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"kubectl.kubernetes.io/restartedAt\":\"$(date -u +%FT%TZ)\"}}}}}"
fi

# Explicitly restart the deployment
echo "Restarting deployment..."
kubectl rollout restart deployment rp-dashboard -n lilypad

# Wait for the rollout to complete
echo "Waiting for rollout to complete..."
kubectl rollout status deployment rp-dashboard -n lilypad

echo ""
echo "Deployment has been successfully restarted!"
echo "Check the status with: kubectl get pods -n lilypad"
