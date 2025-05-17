#!/bin/bash
# Script to sync ArgoCD application and force redeployment

echo "Syncing ArgoCD application and forcing redeployment..."

# Check if ArgoCD CLI is available
if ! command -v argocd &> /dev/null; then
    echo "ArgoCD CLI not found. Installing..."
    curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
    chmod +x argocd-linux-amd64
    sudo mv argocd-linux-amd64 /usr/local/bin/argocd
fi

# Get ArgoCD credentials if not logged in
if ! argocd account get-user-info &> /dev/null; then
    # Get ArgoCD server URL
    ARGOCD_SERVER=$(kubectl get svc argocd-server -n argocd -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "localhost")
    
    # Get ArgoCD admin password
    ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" 2>/dev/null | base64 -d)
    
    if [ -n "$ARGOCD_PASSWORD" ]; then
        echo "Logging into ArgoCD..."
        argocd login $ARGOCD_SERVER --username admin --password $ARGOCD_PASSWORD --insecure
    else
        echo "Could not get ArgoCD credentials. Please log in manually."
        exit 1
    fi
fi

# Update application with annotations to force refresh
echo "Adding refresh annotation to ArgoCD application..."
kubectl patch application rp-status -n argocd --type=json -p='[{"op":"replace","path":"/metadata/annotations/argocd.argoproj.io~1refresh","value":"'$(date +%s)'"}]' || true

# Force sync with replace option
echo "Force syncing application..."
argocd app sync rp-status --force --replace=true || {
    echo "Failed to sync application via ArgoCD CLI. Trying kubectl patch..."
    
    # Patch the deployment directly to force a restart
    TIMESTAMP=$(date +%s)
    kubectl patch deployment rp-dashboard -n lilypad --type=strategic --patch "{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"kubectl.kubernetes.io/restartedAt\":\"$(date -u +%FT%TZ)\"}}}}}"
    
    # Roll the deployment
    kubectl rollout restart deployment rp-dashboard -n lilypad
}

# Wait for sync to complete
echo "Waiting for deployment rollout..."
kubectl rollout status deployment rp-dashboard -n lilypad

echo "Sync and redeployment completed successfully!"
