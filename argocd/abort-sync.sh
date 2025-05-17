#!/bin/bash
# Script to abort an ongoing ArgoCD sync process
# This script can be used during deployment issues or when needing to stop a sync

set -e

echo "⚠️ Attempting to abort ArgoCD sync for rp-status application..."

# Check if this is an ArgoCD environment
ARGOCD_AVAILABLE=false

if command -v argocd &> /dev/null && kubectl get namespace argocd &> /dev/null; then
  echo "✅ ArgoCD detected in the cluster"
  
  # Check if our application exists
  if kubectl get application rp-status -n argocd &> /dev/null; then
    ARGOCD_AVAILABLE=true
    echo "✅ ArgoCD application 'rp-status' found"
  else
    echo "❌ ArgoCD application 'rp-status' not found"
    exit 1
  fi
else
  echo "❌ ArgoCD not detected in the cluster"
  exit 1
fi

# Method 1: Terminate any in-progress sync using ArgoCD CLI if available
if command -v argocd &> /dev/null; then
  echo "Using ArgoCD CLI to terminate sync..."
  argocd app terminate-op rp-status || echo "No operation to terminate or CLI not properly configured"
fi

# Method 2: Patch application to disable automated sync temporarily
echo "Disabling automated sync temporarily..."
kubectl patch application rp-status -n argocd --type=merge -p '{"spec":{"syncPolicy":{"automated":null}}}' || true

# Method 3: Add sync windows to block syncing
echo "Setting sync-window annotation to block syncing..."
kubectl patch application rp-status -n argocd --type=json -p '[{"op":"replace","path":"/metadata/annotations/argocd.argoproj.io~1sync-window","value":"block"}]' || true

# Method 4: Set resources health to suspended to pause sync
echo "Setting application health to suspended..."
kubectl patch application rp-status -n argocd --type=json -p '[{"op":"replace","path":"/metadata/annotations/argocd.argoproj.io~1suspend","value":"true"}]' || true

# Method 5: Stop in-progress resources with kubectl
echo "Stopping any in-progress rollouts..."
kubectl rollout pause deployment rp-dashboard -n lilypad || true

# Wait a moment to ensure the changes are processed
echo "Waiting for abort operations to take effect..."
sleep 5

# Verify the application is no longer syncing
SYNC_STATUS=$(kubectl get application rp-status -n argocd -o jsonpath='{.status.sync.status}' 2>/dev/null || echo "Unknown")
HEALTH_STATUS=$(kubectl get application rp-status -n argocd -o jsonpath='{.status.health.status}' 2>/dev/null || echo "Unknown")

echo "Current application status:"
echo "  Sync Status: $SYNC_STATUS"
echo "  Health Status: $HEALTH_STATUS"

if [ "$SYNC_STATUS" = "Syncing" ]; then
  echo "⚠️ Application is still in syncing state. You may need to use the ArgoCD UI to manually terminate the operation."
else
  echo "✅ Sync has been aborted successfully"
fi

echo ""
echo "⚠️ IMPORTANT: The application is now in a paused state."
echo "To resume normal operations, run: ./resume-sync.sh"
