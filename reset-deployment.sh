#!/bin/bash
# This script will reset the deployment by deleting it and applying a clean version

# Delete the existing deployment
kubectl delete deployment rp-dashboard -n lilypad

# Apply a clean deployment
kubectl apply -f /root/rp_status/reset-deployment.yaml

# Verify the deployment
kubectl get deployment rp-dashboard -n lilypad

echo "Deployment has been reset with proper selector"
