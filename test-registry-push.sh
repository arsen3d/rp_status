#!/bin/bash
# test-registry-push.sh - Script to test pushing an image to app-registry

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== App Registry Push Test =====${NC}"
echo "This script will test pushing a sample image to the app-registry"

# Function to display a step message
step() {
  echo -e "${YELLOW}[STEP]${NC} $1"
}

# Check if Docker is available
if ! command -v docker &> /dev/null; then
  echo -e "${RED}Docker could not be found${NC}"
  echo "Please install Docker to continue"
  exit 1
fi

# Get app-registry pod IP
step "Getting app-registry service IP..."
APP_REGISTRY_IP=$(kubectl get service app-registry -n lilypad -o jsonpath='{.spec.clusterIP}' 2>/dev/null)
if [ -z "$APP_REGISTRY_IP" ]; then
  echo -e "${RED}app-registry service not found in lilypad namespace${NC}"
  echo "Please deploy app-registry first using './deploy.sh --force-kubectl'"
  exit 1
fi

echo "App Registry IP: ${APP_REGISTRY_IP}"

# Pull a small test image
step "Pulling a small test image..."
docker pull alpine:latest

# Tag the image for our registry
step "Tagging the image for app-registry..."
docker tag alpine:latest app-registry:5000/alpine:test

# Add the registry to Docker's insecure registries if needed
step "Checking Docker daemon configuration..."
if ! grep -q "app-registry:5000" /etc/docker/daemon.json 2>/dev/null; then
  echo "You may need to add app-registry:5000 to your Docker daemon's insecure registries"
  echo "Example daemon.json content:"
  echo '{
  "insecure-registries" : ["app-registry:5000", "'${APP_REGISTRY_IP}':5000"]
}'
  echo "After updating, restart Docker with: systemctl restart docker"
fi

# Try to push the image
step "Attempting to push image to app-registry..."
if docker push app-registry:5000/alpine:test; then
  echo -e "${GREEN}Successfully pushed image to app-registry${NC}"
else
  echo -e "${RED}Failed to push image to app-registry${NC}"
  echo "Trying with IP address instead..."
  
  # Try with IP address
  docker tag alpine:latest ${APP_REGISTRY_IP}:5000/alpine:test
  if docker push ${APP_REGISTRY_IP}:5000/alpine:test; then
    echo -e "${GREEN}Successfully pushed image to app-registry using IP address${NC}"
  else
    echo -e "${RED}Failed to push image to app-registry using IP address${NC}"
    echo "Please check your Docker configuration and registry accessibility"
  fi
fi

# Check if the image is in the registry
step "Checking if the image is in the registry..."
curl -s http://app-registry:5000/v2/_catalog || curl -s http://${APP_REGISTRY_IP}:5000/v2/_catalog

echo -e "${GREEN}===== Test completed =====${NC}"
