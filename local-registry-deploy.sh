#!/bin/bash
# Script to run a local registry and use port-forwarding to make it accessible

LOCAL_REGISTRY_PORT=5000
IMAGE_NAME="rp_status-rp-dashboard"

echo "======================================"
echo "Setting up local registry and deploying image"
echo "======================================"

# Start a local Docker registry
echo "Starting local Docker registry..."
docker run -d -p ${LOCAL_REGISTRY_PORT}:5000 --name local-registry registry:2

# Build the image
echo "Building Docker image..."
cd /root/rp_status
docker build -t ${IMAGE_NAME}:latest -f Dockerfile .

# Tag for local registry
echo "Tagging image for local registry..."
docker tag ${IMAGE_NAME}:latest localhost:${LOCAL_REGISTRY_PORT}/${IMAGE_NAME}:latest

# Push to local registry
echo "Pushing image to local registry..."
docker push localhost:${LOCAL_REGISTRY_PORT}/${IMAGE_NAME}:latest

# Update the deployment to use direct port-forwarding
echo "Creating service account for port-forwarding pods..."
kubectl create serviceaccount registry-forwarder -n lilypad || true

# Create a pod to access the host's Docker registry
echo "Creating port-forward pod..."
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: registry-forwarder
  namespace: lilypad
spec:
  serviceAccountName: registry-forwarder
  containers:
  - name: registry-proxy
    image: nginx:alpine
    ports:
    - containerPort: 5000
    command:
    - sleep
    - infinity
EOF

# Wait for pod to be ready
echo "Waiting for forwarder pod to be ready..."
kubectl wait --for=condition=Ready pod/registry-forwarder -n lilypad --timeout=60s

# Update deployment to use localhost
echo "Updating deployment to use local image..."
kubectl patch deployment rp-dashboard -n lilypad \
  --patch "{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"rp-dashboard\",\"image\":\"localhost:${LOCAL_REGISTRY_PORT}/${IMAGE_NAME}:latest\"}]}}}}" \
  --type=merge

# Start port-forwarding in the background
echo "Starting port-forwarding to make registry accessible to cluster..."
kubectl port-forward pod/registry-forwarder -n lilypad ${LOCAL_REGISTRY_PORT}:${LOCAL_REGISTRY_PORT} &
PF_PID=$!

# Give port-forwarding time to establish
sleep 5

# Restart the deployment
echo "Restarting deployment to use the new image..."
kubectl rollout restart deployment rp-dashboard -n lilypad

# Check the deployment status
echo "Checking deployment status..."
kubectl rollout status deployment rp-dashboard -n lilypad --timeout=60s

echo "Press Ctrl+C to stop port-forwarding and exit"
wait $PF_PID
