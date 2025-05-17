#!/bin/bash
# Script to manually build and push the image without relying on Tekton

IMAGE_NAME="rp_status-rp-dashboard"
APP_REGISTRY_IP="10.104.93.56:5000"

echo "======================================"
echo "Building and pushing image manually"
echo "======================================"

# Build the image
echo "Building Docker image..."
cd /root/rp_status
docker build -t ${IMAGE_NAME}:latest -f Dockerfile .

# Tag the image with app-registry IP
echo "Tagging image with registry IP..."
docker tag ${IMAGE_NAME}:latest ${APP_REGISTRY_IP}/${IMAGE_NAME}:latest

# Push to the registry (with insecure flag)
echo "Pushing image to registry..."
docker push --insecure-registry ${APP_REGISTRY_IP}/${IMAGE_NAME}:latest

# Update the deployment to use the image
echo "Updating deployment to use the pushed image..."
kubectl patch deployment rp-dashboard -n lilypad \
  --patch "{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"rp-dashboard\",\"image\":\"${APP_REGISTRY_IP}/${IMAGE_NAME}:latest\"}]}}}}" \
  --type=merge

# Restart the deployment
echo "Restarting deployment to use the new image..."
kubectl rollout restart deployment rp-dashboard -n lilypad

# Check the deployment status
echo "Checking deployment status..."
kubectl rollout status deployment rp-dashboard -n lilypad --timeout=60s

echo "Deployment complete!"
