#!/bin/bash
# This script will force the rp-dashboard deployment to redeploy,
# even if no code changes have been made

# Generate a timestamp
TIMESTAMP=$(date +%s)

echo "====================================="
echo "  Forcing redeployment of rp-dashboard"
echo "====================================="

# Update the metadata annotations with a new timestamp
echo "Adding timestamp annotation to force redeployment..."
kubectl patch deployment rp-dashboard -n lilypad --type=strategic --patch "{\"metadata\":{\"annotations\":{\"force-redeploy\":\"${TIMESTAMP}\"}}}"

# Also update the pod template annotations to force a rollout
echo "Updating pod template annotations..."
kubectl patch deployment rp-dashboard -n lilypad --type=strategic --patch "{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"kubectl.kubernetes.io/restartedAt\":\"$(date -u +%FT%TZ)\"}}}}}"

# Explicitly restart the deployment
echo "Restarting deployment..."
kubectl rollout restart deployment rp-dashboard -n lilypad

# Wait for the rollout to complete
echo "Waiting for rollout to complete..."
kubectl rollout status deployment rp-dashboard -n lilypad

echo ""
echo "Deployment has been successfully restarted!"
echo "Check the status with: kubectl get pods -n lilypad"
