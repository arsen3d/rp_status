#!/bin/bash

# Set variables
IMAGE_NAME="rp_status-rp-dashboard"
IMAGE_TAG="latest"
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

# Navigate to the project directory
cd /root/rp_status

# Build the Docker image
echo "Building Docker image ${FULL_IMAGE_NAME}..."
docker build -t ${FULL_IMAGE_NAME} .

# Load the image into minikube
echo "Loading image into minikube..."
minikube image load ${FULL_IMAGE_NAME}

# Update the deployment and restart it
kubectl apply -f argocd/deployment.yaml
kubectl rollout restart deployment rp-dashboard -n lilypad

echo "Image built, loaded, and deployment restarted!"
