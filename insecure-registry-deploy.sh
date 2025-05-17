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
    # Stop and remove any existing registry container
    docker stop registry || true
    docker rm registry || true
    
    # Start the registry with insecure settings
    docker run -d -p ${REGISTRY_PORT}:5000 \
      --name registry \
      --restart=always \
      -e REGISTRY_HTTP_ADDR=0.0.0.0:5000 \
      -e REGISTRY_STORAGE_DELETE_ENABLED=true \
      -e REGISTRY_HTTP_TLS_CERTIFICATE="" \
      -e REGISTRY_HTTP_TLS_KEY="" \
      registry:2
else
    echo "Registry already running"
fi

# Configure Docker to use insecure registry
echo "Configuring Docker to use insecure registry..."
cat > /etc/docker/daemon.json <<EOF
{
  "insecure-registries": ["${HOST_IP}:${REGISTRY_PORT}"]
}
EOF

# Restart Docker service to apply changes
echo "Restarting Docker service..."
systemctl restart docker
sleep 5

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

# Create a simple debug pod to test connectivity
echo "Creating debug pod to test registry connectivity..."
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: debug-pod
  namespace: lilypad
spec:
  containers:
  - name: debug
    image: alpine
    command: ["sleep", "3600"]
EOF

kubectl wait --for=condition=Ready pod/debug-pod -n lilypad --timeout=60s

# Test registry connection from inside the cluster
echo "Testing registry connection from debug pod:"
kubectl exec -it debug-pod -n lilypad -- wget -q -O- http://${HOST_IP}:${REGISTRY_PORT}/v2/_catalog

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
kubectl rollout status deployment rp-dashboard -n lilypad --timeout=60s || true

echo "Deployment complete! Check the status with:"
echo "kubectl get pods -n lilypad -l app=rp-dashboard"
