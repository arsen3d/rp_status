#!/bin/bash
# Complete setup script for rp_status development environment

echo "======================================"
echo "Setting up rp_status development environment"
echo "======================================"

# 1. Update the deployment to use a public image temporarily
echo "Step 1: Setting up deployment with public image..."
kubectl patch deployment rp-dashboard -n lilypad \
  --patch '{"spec":{"template":{"spec":{"containers":[{"name":"rp-dashboard","image":"nginx:alpine"}]}}}}' \
  --type=merge

# 2. Create registry secrets
echo "Step 2: Creating registry secrets..."
kubectl create secret docker-registry registry-credentials \
  --docker-server=registry.hub.docker.com \
  --namespace=lilypad \
  --dry-run=client -o yaml | kubectl apply -f -

# 3. Update kustomization to not use tekton-pipelinerun
echo "Step 3: Updating kustomization.yaml..."
sed -i 's/- tekton-pipelinerun.yaml/# - tekton-pipelinerun.yaml  # Commented out as PipelineRuns are managed directly/' /root/rp_status/argocd/kustomization.yaml

# 4. Apply ArgoCD build plugin
echo "Step 4: Applying ArgoCD build plugin..."
kubectl apply -f /root/rp_status/argocd/argocd-build-plugin.yaml

# 5. Apply all resources with kustomize
echo "Step 5: Applying Kubernetes resources..."
kubectl apply -k /root/rp_status/argocd/

# 6. Start a development task for the React app
echo "Step 6: Starting React development server..."
cd /root/rp_status
nohup bash -c "cd rp-dashboard && npm run dev" > /tmp/react-dev.log 2>&1 &

echo "Setup complete!"
echo ""
echo "To view the React app, visit: http://localhost:5173"
echo "To check the deployment status: kubectl get pods -n lilypad -l app=rp-dashboard"
echo "To see the React dev server logs: cat /tmp/react-dev.log"
