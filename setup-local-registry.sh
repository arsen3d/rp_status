#!/bin/bash
# Setup a local Docker registry to cache images

# Create registry data directory if it doesn't exist
mkdir -p ./registry-data

# Start local registry container
docker run -d \
  --name local-registry \
  --restart=always \
  -p 5000:5000 \
  -v $(pwd)/registry-data:/var/lib/registry \
  registry:2

# Allow insecure registries for localhost (might require Docker daemon restart)
echo '{
  "insecure-registries": ["localhost:5000"]
}' | sudo tee /etc/docker/daemon.json

# Restart Docker daemon to apply changes
sudo systemctl restart docker

# Pull and push the necessary base images to local registry
docker pull node:20-alpine
docker pull nginx:alpine
docker tag node:20-alpine localhost:5000/node:20-alpine
docker tag nginx:alpine localhost:5000/nginx:alpine
docker push localhost:5000/node:20-alpine
docker push localhost:5000/nginx:alpine

echo "Local registry setup complete. Images cached."
echo "You can now update your Dockerfile to use 'localhost:5000/node:20-alpine' and 'localhost:5000/nginx:alpine'"
