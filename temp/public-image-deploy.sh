#!/bin/bash
# Script to update the deployment to use a public image instead of trying to build locally

echo "======================================"
echo "Updating deployment to use public image"
echo "======================================"

# Update the deployment to use a public Nginx image
echo "Updating deployment..."
kubectl patch deployment rp-dashboard -n lilypad \
  --patch '{"spec":{"template":{"spec":{"containers":[{"name":"rp-dashboard","image":"nginx:alpine"}]}}}}' \
  --type=merge

# Restart the deployment
echo "Restarting deployment..."
kubectl rollout restart deployment rp-dashboard -n lilypad

# Check the deployment status
echo "Checking deployment status..."
kubectl rollout status deployment rp-dashboard -n lilypad --timeout=60s

echo "Deployment complete! Check the status with:"
echo "kubectl get pods -n lilypad -l app=rp-dashboard"
