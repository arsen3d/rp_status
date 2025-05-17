#!/bin/bash
# deploy.sh - Comprehensive deployment script for rp-dashboard
# This script can be used to deploy the application either via ArgoCD or directly with kubectl

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== RP Dashboard Deployment Script =====${NC}"
echo "Starting deployment process at $(date)"

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to check if a resource exists in Kubernetes
resource_exists() {
  local kind=$1
  local name=$2
  local namespace=$3
  kubectl get $kind $name -n $namespace >/dev/null 2>&1
}

# Function to display a step message
step() {
  echo -e "${YELLOW}[STEP]${NC} $1"
}

# Check prerequisites
step "Checking prerequisites..."
if ! command_exists kubectl; then
  echo -e "${RED}Error: kubectl not found. Please install kubectl.${NC}"
  exit 1
fi

if ! kubectl cluster-info >/dev/null 2>&1; then
  echo -e "${RED}Error: Cannot connect to Kubernetes cluster. Please check your kubeconfig.${NC}"
  exit 1
fi

# Check if registry is accessible
step "Checking if registry is accessible..."
if command_exists curl; then
  if curl -s -f http://registry:5000/v2/ >/dev/null 2>&1; then
    echo "✅ Registry at registry:5000 is accessible"
  else
    echo -e "${YELLOW}Warning: Registry at registry:5000 seems inaccessible. Deployment might fail.${NC}"
  fi
else
  echo -e "${YELLOW}Warning: curl not found, skipping registry check.${NC}"
fi

# Create lilypad namespace if it doesn't exist
step "Ensuring lilypad namespace exists..."
kubectl create namespace lilypad --dry-run=client -o yaml | kubectl apply -f -
echo "✅ Namespace lilypad is ready"

# Reset deployment if requested or if there are issues
if [ "$1" == "reset" ] || [ "$1" == "--reset" ]; then
  step "Resetting existing deployment..."
  kubectl delete deployment rp-dashboard -n lilypad --ignore-not-found
  kubectl apply -f /root/rp_status/reset-deployment.yaml
  echo "✅ Deployment has been reset with proper configuration"
fi

# Check if ArgoCD is available
if kubectl get namespace argocd >/dev/null 2>&1; then
  ARGOCD_AVAILABLE=true
  step "ArgoCD detected, checking if rp-dashboard application exists..."
  
  if kubectl get application rp-dashboard -n argocd >/dev/null 2>&1; then
    echo "✅ ArgoCD application 'rp-dashboard' exists"
    
    # Check if we need to force refresh
    if [ "$1" == "refresh" ] || [ "$1" == "--refresh" ]; then
      step "Force refreshing ArgoCD application..."
      kubectl patch application rp-dashboard -n argocd --type=merge -p '{"spec":{"syncPolicy":{"automated":{"prune":false}}}}' || true
      kubectl patch application rp-dashboard -n argocd --type=json -p '[{"op":"replace","path":"/metadata/annotations/argocd.argoproj.io~1refresh","value":"'$(date +%s)'"}]' || true
      echo "✅ ArgoCD application has been refreshed"
    fi
    
    # Sync the application
    step "Syncing ArgoCD application..."
    if command_exists argocd; then
      argocd app sync rp-dashboard || echo -e "${YELLOW}Warning: ArgoCD CLI sync failed, application will sync automatically based on your settings${NC}"
    else
      echo "ArgoCD CLI not available, application will sync automatically based on your settings"
    fi
  else
    echo "ArgoCD application 'rp-dashboard' not found, will deploy using kubectl"
    ARGOCD_AVAILABLE=false
  fi
else
  ARGOCD_AVAILABLE=false
  echo "ArgoCD not detected, will deploy using kubectl"
fi

# If not using ArgoCD or if --force-kubectl is specified, deploy with kubectl
if [ "$ARGOCD_AVAILABLE" != "true" ] || [ "$1" == "kubectl" ] || [ "$1" == "--force-kubectl" ]; then
  step "Deploying app-registry..."
  # Apply the registry deployment and service
  kubectl apply -f /root/rp_status/argocd/app-registry.yaml
  echo "✅ Docker registry deployed"
  
  # Wait for the registry to be ready
  step "Waiting for app-registry to be ready..."
  kubectl rollout status deployment/app-registry -n lilypad --timeout=60s || true
  
  # Get registry pod IP and update the registry service
  REGISTRY_POD_IP=$(kubectl get pod -n lilypad -l app=app-registry -o jsonpath='{.items[0].status.podIP}')
  if [ -n "$REGISTRY_POD_IP" ]; then
    step "Updating registry endpoints with pod IP: ${REGISTRY_POD_IP}..."
    cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Endpoints
metadata:
  name: registry
  namespace: lilypad
subsets:
  - addresses:
    - ip: ${REGISTRY_POD_IP}
    ports:
    - port: 5000
EOF
    echo "✅ Registry endpoints updated"
  else
    echo -e "${YELLOW}Warning: Could not get app-registry pod IP. Using existing registry endpoints.${NC}"
  fi
  
  step "Deploying using kubectl..."
  
  # Apply Tekton resources
  kubectl apply -f /root/rp_status/argocd/tekton-tasks.yaml
  kubectl apply -f /root/rp_status/argocd/tekton-pipeline.yaml
  echo "✅ Tekton pipeline and tasks deployed"
  
  # Apply the deployment, service and other resources
  kubectl apply -f /root/rp_status/argocd/deployment.yaml
  kubectl apply -f /root/rp_status/argocd/service.yaml
  echo "✅ Deployment and service resources applied"
  
  # Create a new pipeline run
  step "Triggering pipeline run..."
  TIMESTAMP=$(date +%s)
  cat <<EOF | kubectl apply -f -
apiVersion: tekton.dev/v1beta1
kind: PipelineRun
metadata:
  name: docker-build-pipeline-run-${TIMESTAMP}
  namespace: lilypad
spec:
  pipelineRef:
    name: docker-build-pipeline
  workspaces:
    - name: shared-workspace
      volumeClaimTemplate:
        spec:
          accessModes:
            - ReadWriteOnce
          resources:
            requests:
              storage: 1Gi
  params:
    - name: repo-url
      value: https://github.com/arsen3d/rp_status.git
    - name: branch-name
      value: main
    - name: image-name
      value: rp_status-rp-dashboard
    - name: image-tag
      value: latest
    - name: registry-url
      value: "10.104.93.56:5000"
    - name: registry-user
      value: ""
    - name: registry-password
      value: ""
EOF
  echo "✅ Pipeline run triggered"
fi

# Monitor the status of the deployment
step "Monitoring deployment status..."
kubectl rollout status deployment/rp-dashboard -n lilypad --timeout=120s || true

# Get deployment info
step "Deployment info:"
kubectl get pods -n lilypad -l app=rp-dashboard
kubectl get service -n lilypad -l app=rp-dashboard

# Check if service is exposed
SERVICE_PORT=$(kubectl get service rp-dashboard -n lilypad -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)
if [ -n "$SERVICE_PORT" ]; then
  echo -e "${GREEN}Application exposed on NodePort: ${SERVICE_PORT}${NC}"
  echo "You can access the application at: http://<node-ip>:${SERVICE_PORT}"
else
  SERVICE_PORT=$(kubectl get service rp-dashboard -n lilypad -o jsonpath='{.spec.ports[0].port}' 2>/dev/null)
  if [ -n "$SERVICE_PORT" ]; then
    echo -e "${GREEN}Application running on cluster port: ${SERVICE_PORT}${NC}"
    echo "The service is available inside the cluster at: rp-dashboard.lilypad.svc.cluster.local:${SERVICE_PORT}"
    echo "To access it locally, run: kubectl port-forward svc/rp-dashboard -n lilypad ${SERVICE_PORT}:${SERVICE_PORT}"
  fi
fi

echo -e "${GREEN}===== Deployment process completed =====${NC}"
echo "Finished at $(date)"
echo "Use './deploy.sh reset' to force a clean redeployment if issues occur"
echo "Use './deploy.sh refresh' to force an ArgoCD refresh"
echo "Use './check-registry.sh --app-registry' to check app-registry connectivity"
echo "Use './test-registry-push.sh' to test pushing an image to app-registry"
