#!/bin/bash
# Script to make host registry accessible to minikube

# Get host IP address
HOST_IP=$(hostname -I | awk '{print $1}')
REGISTRY_PORT=5000

echo "======================================"
echo "Setting up host registry accessible to minikube"
echo "Host IP: ${HOST_IP}"
echo "======================================"

# Check if registry is already running, if not start it
if ! docker ps | grep -q "registry:2"; then
    echo "Starting Docker registry on host..."
    # Stop and remove any existing registry container
    docker stop registry || true
    docker rm registry || true
    
    # Start the registry with insecure settings and bind to all interfaces
    docker run -d -p ${REGISTRY_PORT}:5000 \
      --name registry \
      --restart=always \
      -e REGISTRY_HTTP_ADDR=0.0.0.0:5000 \
      -e REGISTRY_STORAGE_DELETE_ENABLED=true \
      registry:2
else
    echo "Registry already running. Making sure it's accessible on all interfaces..."
    # Check if the registry is properly exposed
    if ! docker inspect registry | grep -q '"HostIp": "0.0.0.0"'; then
        echo "Registry needs to be reconfigured to bind to all interfaces..."
        docker stop registry
        docker rm registry
        docker run -d -p ${REGISTRY_PORT}:5000 \
          --name registry \
          --restart=always \
          -e REGISTRY_HTTP_ADDR=0.0.0.0:5000 \
          -e REGISTRY_STORAGE_DELETE_ENABLED=true \
          registry:2
    fi
fi

# Pull base images (if not already pulled)
echo "Checking base images..."
docker pull node:20-alpine || echo "Failed to pull node:20-alpine, continuing..."
docker pull nginx:alpine || echo "Failed to pull nginx:alpine, continuing..."

# Tag for host registry with IP
echo "Tagging images for host registry..."
docker tag node:20-alpine ${HOST_IP}:${REGISTRY_PORT}/node:20-alpine
docker tag nginx:alpine ${HOST_IP}:${REGISTRY_PORT}/nginx:alpine

# Push to host registry
echo "Pushing images to host registry..."
docker push ${HOST_IP}:${REGISTRY_PORT}/node:20-alpine
docker push ${HOST_IP}:${REGISTRY_PORT}/nginx:alpine

# Update the Dockerfile to use the host IP instead of localhost
echo "Updating Dockerfile to use host IP..."
sed -i "s|FROM localhost:5000/|FROM ${HOST_IP}:${REGISTRY_PORT}/|g" /root/rp_status/Dockerfile

# Configure minikube to allow insecure registry (if minikube is running)
if command -v minikube &> /dev/null && minikube status | grep -q "Running"; then
    echo "Configuring minikube to use insecure registry..."
    
    # Check if minikube already has the registry configured
    if ! minikube ssh -- grep -q "${HOST_IP}:${REGISTRY_PORT}" /etc/containers/registries.conf 2>/dev/null; then
        # Add insecure registry to minikube
        minikube ssh -- "sudo mkdir -p /etc/containers && echo '[registries.insecure]' | sudo tee -a /etc/containers/registries.conf && echo 'registries = [\"${HOST_IP}:${REGISTRY_PORT}\"]' | sudo tee -a /etc/containers/registries.conf"
        
        # Update Docker daemon in minikube
        minikube ssh -- "echo '{\"insecure-registries\": [\"${HOST_IP}:${REGISTRY_PORT}\"]}' | sudo tee /etc/docker/daemon.json"
        
        # Restart Docker in minikube
        minikube ssh -- "sudo systemctl restart docker"
    else
        echo "Minikube already configured for insecure registry ${HOST_IP}:${REGISTRY_PORT}"
    fi
else
    echo "Minikube not detected or not running. Skipping minikube configuration."
fi

echo "======================================"
echo "Setup complete!"
echo "Your Dockerfile has been updated to use ${HOST_IP}:${REGISTRY_PORT} instead of localhost:5000"
echo "To test, you can run: minikube ssh -- docker pull ${HOST_IP}:${REGISTRY_PORT}/node:20-alpine"
echo "======================================"
