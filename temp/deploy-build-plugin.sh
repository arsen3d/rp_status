#!/bin/bash
# Script to deploy the ArgoCD build plugin

# Apply the build plugin ConfigMap to ArgoCD namespace
echo "Applying ArgoCD build plugin ConfigMap..."
kubectl apply -f argocd/argocd-build-plugin.yaml

# Verify the ConfigMap exists
echo "Verifying ConfigMap..."
kubectl get configmap argocd-build-plugin -n argocd

# Restart ArgoCD repo-server to pick up new plugin
echo "Restarting ArgoCD repo-server to pick up the plugin..."
kubectl rollout restart deployment argocd-repo-server -n argocd

# Wait for the restart to complete
echo "Waiting for ArgoCD repo-server to restart..."
kubectl rollout status deployment argocd-repo-server -n argocd

echo "Build plugin deployment complete!"
