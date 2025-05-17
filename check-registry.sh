#!/bin/bash
# check-registry.sh - Enhanced script to check and fix registry connectivity issues

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default registry IPs - can be overridden with parameter
REGISTRY_IP=${1:-"10.106.91.185"}
REGISTRY_PORT=${2:-"5000"}
REGISTRY_URL="${REGISTRY_IP}:${REGISTRY_PORT}"

# Check if app-registry option is specified
if [ "$1" == "app-registry" ] || [ "$1" == "--app-registry" ]; then
  # Use app-registry instead
  echo -e "${GREEN}===== App Registry Connectivity Check =====${NC}"
  echo "Checking app-registry in the lilypad namespace"
  
  # Get the app-registry service IP
  APP_REGISTRY_IP=$(kubectl get service app-registry -n lilypad -o jsonpath='{.spec.clusterIP}' 2>/dev/null)
  if [ -z "$APP_REGISTRY_IP" ]; then
    echo -e "${RED}app-registry service not found in lilypad namespace${NC}"
    echo "Please deploy app-registry first using './deploy.sh --force-kubectl'"
    exit 1
  fi
  
  APP_REGISTRY_URL="${APP_REGISTRY_IP}:5000"
  echo "App Registry URL: $APP_REGISTRY_URL"
  
  # Check app-registry pod status
  echo -e "${YELLOW}[CHECK]${NC} Checking app-registry pod status..."
  kubectl get pods -n lilypad -l app=app-registry -o wide
  
  # Test app-registry connectivity
  echo -e "${YELLOW}[CHECK]${NC} Testing app-registry connectivity..."
  kubectl run registry-test --image=alpine:latest --rm -it --restart=Never --namespace=lilypad \
    --timeout=60s -- sh -c "apk add --no-cache curl && curl -s http://app-registry:5000/v2/_catalog" || {
    echo -e "${RED}Failed to connect to app-registry.${NC}"
    echo "Trying to fix connectivity issues..."
    
    # Update registry endpoints to point to app-registry
    echo "Updating registry endpoints to point to app-registry..."
    kubectl patch endpoints registry -n lilypad --type='json' -p='[
      {"op": "replace", "path": "/subsets/0/addresses/0/ip", "value": "'$APP_REGISTRY_IP'"}
    ]'
    
    # Test again with the updated endpoints
    kubectl run registry-test2 --image=alpine:latest --rm -it --restart=Never --namespace=lilypad \
      --timeout=60s -- sh -c "apk add --no-cache curl && curl -s http://registry:5000/v2/_catalog" || {
      echo -e "${RED}Still unable to connect to registry via service.${NC}"
    }
  }
  
  # Check deployment image and offer to update to app-registry
  echo -e "${YELLOW}[CHECK]${NC} Checking deployment image configuration..."
  CURRENT_IMAGE=$(kubectl get deployment rp-dashboard -n lilypad -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null)
  echo "Current image: $CURRENT_IMAGE"
  
  # Offer to update to app-registry
  echo
  echo "Would you like to update the deployment to use app-registry?"
  echo "1) Update to use app-registry (app-registry:5000/rp_status-rp-dashboard:latest)"
  echo "2) Skip image configuration"
  
  read -p "Select an option (1-2): " option
  case $option in
    1)
      echo "Updating deployment to use app-registry image..."
      kubectl patch deployment rp-dashboard -n lilypad --type='json' -p='[
        {"op": "replace", "path": "/spec/template/spec/containers/0/image", "value": "app-registry:5000/rp_status-rp-dashboard:latest"},
        {"op": "replace", "path": "/spec/template/spec/containers/0/imagePullPolicy", "value": "Always"}
      ]'
      echo -e "${GREEN}Updated to app-registry image configuration.${NC}"
      ;;
    2)
      echo "Skipping image configuration."
      ;;
    *)
      echo "Invalid option. Skipping image configuration."
      ;;
  esac
  
  echo -e "${GREEN}===== App Registry check completed =====${NC}"
  exit 0
fi

echo -e "${GREEN}===== Docker Registry Connectivity Check =====${NC}"
echo "Checking registry at $REGISTRY_URL"

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to ask for confirmation
confirm() {
  read -p "$1 (y/n) " -n 1 -r
  echo
  [[ $REPLY =~ ^[Yy]$ ]]
}

# Test registry connectivity
echo -e "${YELLOW}[CHECK]${NC} Testing registry connectivity..."
kubectl run registry-test --image=alpine:latest --rm -it --restart=Never --namespace=lilypad \
  --timeout=60s -- sh -c "apk add --no-cache curl && curl -s http://${REGISTRY_URL}/v2/_catalog" || {
  echo -e "${RED}Failed to connect to registry.${NC}"
  if confirm "Would you like to create a registry service to improve DNS resolution?"; then
    echo "Creating registry service and endpoints..."
    cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: registry
  namespace: lilypad
spec:
  selector:
    app: registry
  ports:
  - port: ${REGISTRY_PORT}
    targetPort: ${REGISTRY_PORT}
  type: ClusterIP
---
apiVersion: v1
kind: Endpoints
metadata:
  name: registry
  namespace: lilypad
subsets:
  - addresses:
    - ip: ${REGISTRY_IP}
    ports:
    - port: ${REGISTRY_PORT}
EOF
    echo -e "${GREEN}Service and endpoints created.${NC}"
    
    echo "Testing with the new service..."
    kubectl run registry-test2 --image=alpine:latest --rm -it --restart=Never --namespace=lilypad \
      --timeout=60s -- sh -c "apk add --no-cache curl && curl -s http://registry:${REGISTRY_PORT}/v2/_catalog" || {
      echo -e "${RED}Still unable to connect to registry via service.${NC}"
    }
  fi
}

# Check existing secrets
echo -e "${YELLOW}[CHECK]${NC} Checking for registry credentials..."
kubectl get secret registry-credentials -n lilypad >/dev/null 2>&1 && {
  echo -e "${GREEN}Registry credentials already exist.${NC}"
} || {
  echo -e "${YELLOW}Registry credentials don't exist.${NC}"
  if confirm "Would you like to create registry credentials?"; then
    # Prompt for credentials
    read -p "Enter registry username (blank for none): " username
    if [ -n "$username" ]; then
      read -s -p "Enter registry password: " password
      echo
      kubectl create secret docker-registry registry-credentials \
        --docker-server=registry:${REGISTRY_PORT} \
        --docker-username="$username" \
        --docker-password="$password" \
        --namespace=lilypad
    else
      kubectl create secret docker-registry registry-credentials \
        --docker-server=registry:${REGISTRY_PORT} \
        --namespace=lilypad
    fi
    echo -e "${GREEN}Registry credentials created.${NC}"
  fi
}

# Check deployment image
echo -e "${YELLOW}[CHECK]${NC} Checking deployment image configuration..."
CURRENT_IMAGE=$(kubectl get deployment rp-dashboard -n lilypad -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null)
CURRENT_POLICY=$(kubectl get deployment rp-dashboard -n lilypad -o jsonpath='{.spec.template.spec.containers[0].imagePullPolicy}' 2>/dev/null)

echo "Current image: $CURRENT_IMAGE"
echo "Current pull policy: $CURRENT_POLICY"

# Menu for image configuration
echo
echo "Available image configuration options:"
echo "1) Use local image (for development)"
echo "2) Use registry image with AlwaysPull policy (for production)"
echo "3) Skip image configuration"

read -p "Select an option (1-3): " option
case $option in
  1)
    echo "Updating deployment to use local image..."
    kubectl patch deployment rp-dashboard -n lilypad --type='json' -p='[
      {"op": "replace", "path": "/spec/template/spec/containers/0/image", "value": "rp_status-rp-dashboard:latest"},
      {"op": "replace", "path": "/spec/template/spec/containers/0/imagePullPolicy", "value": "Never"}
    ]'
    echo -e "${GREEN}Updated to local image configuration.${NC}"
    ;;
  2)
    echo "Updating deployment to use registry image..."
    kubectl patch deployment rp-dashboard -n lilypad --type='json' -p='[
      {"op": "replace", "path": "/spec/template/spec/containers/0/image", "value": "registry:5000/rp_status-rp-dashboard:latest"},
      {"op": "replace", "path": "/spec/template/spec/containers/0/imagePullPolicy", "value": "Always"}
    ]'
    echo -e "${GREEN}Updated to registry image configuration.${NC}"
    ;;
  3)
    echo "Skipping image configuration."
    ;;
  *)
    echo "Invalid option. Skipping image configuration."
    ;;
esac

echo -e "${GREEN}===== Registry check completed =====${NC}"
echo "For more options, check out the deploy.sh script."