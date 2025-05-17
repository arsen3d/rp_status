#!/bin/bash
# Script to configure minikube to use a host insecure registry

IMAGE_NAME="rp_status-rp-dashboard"
HOST_IP=$(hostname -I | awk '{print $1}')
REGISTRY_PORT=5000

echo "======================================"
echo "Setting up host registry accessible to minikube"
echo "Host IP: ${HOST_IP}"
echo "======================================"

# Start a registry on the host if not running
if ! docker ps | grep -q "registry:2"; then
    echo "Starting Docker registry on host..."
    docker run -d -p ${REGISTRY_PORT}:5000 --restart=always --name registry registry:2
else
    echo "Registry already running"
fi

# Build the image
echo "Building Docker image..."
cd /root/rp_status
docker build -t ${IMAGE_NAME}:latest -f Dockerfile .

# Tag for host registry
echo "Tagging image for host registry..."
docker tag ${IMAGE_NAME}:latest ${HOST_IP}:${REGISTRY_PORT}/${IMAGE_NAME}:latest

# Push to host registry
echo "Pushing image to host registry..."
docker push ${HOST_IP}:${REGISTRY_PORT}/${IMAGE_NAME}:latest

# Update the deployment
echo "Updating deployment to use host registry image..."
kubectl patch deployment rp-dashboard -n lilypad \
  --patch "{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"rp-dashboard\",\"image\":\"${HOST_IP}:${REGISTRY_PORT}/${IMAGE_NAME}:latest\"}]}}}}" \
  --type=merge

# Restart the deployment
echo "Restarting deployment..."
kubectl rollout restart deployment rp-dashboard -n lilypad

# Check the deployment status
echo "Checking deployment status..."
kubectl rollout status deployment rp-dashboard -n lilypad --timeout=60s

echo "Deployment complete! Check the status with:"
echo "kubectl get pods -n lilypad -l app=rp-dashboard"
