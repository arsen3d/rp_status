#!/bin/bash
# Script to force redeploy of rp-dashboard

echo "Forcing redeployment of rp-dashboard..."

# Update the ConfigMap with a new timestamp to trigger a change
TIMESTAMP=$(date +%s)
kubectl patch configmap build-info -n lilypad --type=json -p='[{"op": "replace", "path": "/data/timestamp", "value": "'"$TIMESTAMP"'"}]'

# Add a timestamp to the deployment
kubectl patch deployment rp-dashboard -n lilypad --type=json -p='[{"op": "replace", "path": "/metadata/annotations/force-redeploy", "value": "'"$TIMESTAMP"'"}]'

# Force a rollout restart
kubectl rollout restart deployment rp-dashboard -n lilypad

echo "Monitoring rollout status..."
kubectl rollout status deployment rp-dashboard -n lilypad

echo "Redeployment complete!"
