#!/bin/bash
# Script to make host registry accessible to minikube - improved version

# Get host IP address
HOST_IP=$(hostname -I | awk '{print $1}')
REGISTRY_PORT=5000

echo "======================================"
echo "Setting up host registry accessible to minikube"
echo "Host IP: ${HOST_IP}"
echo "======================================"

# Stop any existing registry container
docker stop registry || true
docker rm registry || true

# Start the registry with HTTP (not HTTPS) and bind to all interfaces
echo "Starting Docker registry on host with HTTP..."
docker run -d -p ${REGISTRY_PORT}:5000 \
  --name registry \
  --restart=always \
  -e REGISTRY_HTTP_ADDR=0.0.0.0:5000 \
  -e REGISTRY_STORAGE_DELETE_ENABLED=true \
  -v registry-data:/var/lib/registry \
  registry:2

# Create a configuration for Docker to trust this insecure registry
echo "Configuring Docker daemon to use insecure registry..."
echo '{
  "insecure-registries": ["'${HOST_IP}':'${REGISTRY_PORT}'"]
}' | sudo tee /etc/docker/daemon.json

# Restart Docker daemon to apply changes
sudo systemctl restart docker

# Pull base images (if not already pulled)
echo "Pulling base images..."
docker pull node:20-alpine || echo "Failed to pull node:20-alpine, continuing..."
docker pull nginx:alpine || echo "Failed to pull nginx:alpine, continuing..."

# Tag for host registry with IP
echo "Tagging images for host registry..."
docker tag node:20-alpine ${HOST_IP}:${REGISTRY_PORT}/node:20-alpine
docker tag nginx:alpine ${HOST_IP}:${REGISTRY_PORT}/nginx:alpine

# Give Docker a moment to reconnect after restart
sleep 3

# Push to host registry
echo "Pushing images to host registry..."
docker push ${HOST_IP}:${REGISTRY_PORT}/node:20-alpine
docker push ${HOST_IP}:${REGISTRY_PORT}/nginx:alpine

# Update the Dockerfile to use the host IP instead of localhost
echo "Updating Dockerfile to use host IP..."
sed -i "s|FROM localhost:5000/|FROM ${HOST_IP}:${REGISTRY_PORT}/|g" /root/rp_status/Dockerfile

# Configure minikube to allow insecure registry
if command -v minikube &> /dev/null && minikube status | grep -q "Running"; then
    echo "Adding insecure registry to minikube..."
    
    # Stop minikube
    minikube stop
    
    # Start minikube with insecure registry flag
    minikube start --insecure-registry="${HOST_IP}:${REGISTRY_PORT}"
    
    # Verify configuration
    minikube ssh -- 'grep -q insecure /etc/docker/daemon.json && echo "Registry configured in minikube"'
else
    echo "Minikube not detected or not running."
fi

echo "======================================"
echo "Setup complete!"
echo "Your Dockerfile has been updated to use ${HOST_IP}:${REGISTRY_PORT} instead of localhost:5000"
echo "To test, you can run: minikube ssh -- docker pull ${HOST_IP}:${REGISTRY_PORT}/node:20-alpine"
echo "======================================"
