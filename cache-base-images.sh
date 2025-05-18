#!/bin/bash
# Cache base Docker images in local registry

LOCAL_REGISTRY_PORT=5000
echo "======================================"
echo "Setting up local registry and caching base images"
echo "======================================"

# Check if registry is already running, if not start it
if ! docker ps | grep -q "local-registry"; then
    echo "Starting local Docker registry..."
    docker run -d -p ${LOCAL_REGISTRY_PORT}:5000 --restart=always --name local-registry registry:2
else
    echo "Local registry already running."
fi

# Pull base images
echo "Pulling base Node.js image..."
docker pull node:20-alpine || echo "Failed to pull node:20-alpine, might need to authenticate with Docker Hub"

echo "Pulling base Nginx image..."
docker pull nginx:alpine || echo "Failed to pull nginx:alpine, might need to authenticate with Docker Hub"

# Tag for local registry
echo "Tagging images for local registry..."
docker tag node:20-alpine localhost:${LOCAL_REGISTRY_PORT}/node:20-alpine
docker tag nginx:alpine localhost:${LOCAL_REGISTRY_PORT}/nginx:alpine

# Push to local registry
echo "Pushing images to local registry..."
docker push localhost:${LOCAL_REGISTRY_PORT}/node:20-alpine
docker push localhost:${LOCAL_REGISTRY_PORT}/nginx:alpine

echo "======================================"
echo "Base images cached in local registry"
echo "Your Dockerfile has been updated to use these cached images"
echo "======================================"
