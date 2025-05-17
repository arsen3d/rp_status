#!/bin/bash
# Script to resume ArgoCD sync after an abort
# Use this to restore normal operations after using abort-sync.sh

set -e

echo "🔄 Resuming ArgoCD sync for rp-status application..."

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

# Method 1: Resume any paused rollouts
echo "Resuming paused rollouts..."
kubectl rollout resume deployment rp-dashboard -n lilypad || true

# Method 2: Remove the sync window block
echo "Removing sync-window block..."
kubectl patch application rp-status -n argocd --type=json -p '[{"op":"remove","path":"/metadata/annotations/argocd.argoproj.io~1sync-window"}]' || true

# Method 3: Resume application health from suspended state
echo "Resuming application health from suspended state..."
kubectl patch application rp-status -n argocd --type=json -p '[{"op":"remove","path":"/metadata/annotations/argocd.argoproj.io~1suspend"}]' || true

# Method 4: Re-enable automated sync policy as it was before
echo "Re-enabling automated sync policy..."
kubectl patch application rp-status -n argocd --type=merge -p '{
  "spec": {
    "syncPolicy": {
      "automated": {
        "prune": true,
        "selfHeal": true,
        "allowEmpty": false
      }
    }
  }
}' || true

# Method 5: Force a refresh to ensure everything is up to date
echo "Forcing application refresh..."
kubectl patch application rp-status -n argocd --type=json -p '[{"op":"replace","path":"/metadata/annotations/argocd.argoproj.io~1refresh","value":"'"$(date +%s)"'"}]' || true

# Wait a moment to ensure the changes are processed
echo "Waiting for resume operations to take effect..."
sleep 5

# Verify the application status
SYNC_STATUS=$(kubectl get application rp-status -n argocd -o jsonpath='{.status.sync.status}' 2>/dev/null || echo "Unknown")
HEALTH_STATUS=$(kubectl get application rp-status -n argocd -o jsonpath='{.status.health.status}' 2>/dev/null || echo "Unknown")

echo "Current application status:"
echo "  Sync Status: $SYNC_STATUS"
echo "  Health Status: $HEALTH_STATUS"

echo "✅ Normal operations have been resumed"
echo ""
echo "TIP: If you want to trigger a sync now, you can run:"
echo "argocd app sync rp-status"
