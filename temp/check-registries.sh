#!/bin/bash
# Script to check if the required image exists in both registries

REGISTRY_SERVICE="registry:5000"
APP_REGISTRY_SERVICE="app-registry:5000"
REGISTRY_IP="10.106.91.185:5000"
APP_REGISTRY_IP="10.104.93.56:5000"
IMAGE_NAME="rp_status-rp-dashboard"

echo "Checking registries for image: ${IMAGE_NAME}"

# Function to check registry by service name and IP
check_registry() {
  local registry_service=$1
  local registry_ip=$2
  
  echo "======================================"
  echo "Checking registry service: $registry_service"
  echo "Registry IP: $registry_ip"
  echo "======================================"
  
  # Create a temporary pod to interact with the registry
  cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: registry-checker
  namespace: lilypad
spec:
  containers:
  - name: registry-checker
    image: curlimages/curl:latest
    command: ["sleep", "3600"]
  restartPolicy: Never
EOF

  # Wait for the pod to be ready
  kubectl wait --for=condition=Ready pod/registry-checker -n lilypad --timeout=60s

  # DNS lookup for the service
  echo "DNS lookup for $registry_service:"
  kubectl exec -n lilypad registry-checker -- nslookup $registry_service || echo "Failed to resolve $registry_service"
  
  echo "Querying registry catalog via service name:"
  kubectl exec -n lilypad registry-checker -- curl -s "http://$registry_service/v2/_catalog" || echo "Failed to connect to registry via service name"
  
  echo "Querying registry catalog via IP:"
  kubectl exec -n lilypad registry-checker -- curl -s "http://$registry_ip/v2/_catalog" || echo "Failed to connect to registry via IP"
  
  echo "Checking for image tags via service name:"
  kubectl exec -n lilypad registry-checker -- curl -s "http://$registry_service/v2/$IMAGE_NAME/tags/list" || echo "Failed to find image via service name"
  
  echo "Checking for image tags via IP:"
  kubectl exec -n lilypad registry-checker -- curl -s "http://$registry_ip/v2/$IMAGE_NAME/tags/list" || echo "Failed to find image via IP"
  
  # Cleanup
  kubectl delete pod registry-checker -n lilypad
}

# Check both registries
check_registry $REGISTRY_SERVICE $REGISTRY_IP
check_registry $APP_REGISTRY_SERVICE $APP_REGISTRY_IP

# Test connectivity to the registries directly
echo "======================================"
echo "Testing service and pod IPs directly:"
echo "======================================"
echo "Getting registry service IP:"
kubectl get service registry -n lilypad -o jsonpath='{.spec.clusterIP}:{.spec.ports[0].port}'
echo ""

echo "Getting app-registry service IP:"
kubectl get service app-registry -n lilypad -o jsonpath='{.spec.clusterIP}:{.spec.ports[0].port}'
echo ""

echo "Registry check complete!"
