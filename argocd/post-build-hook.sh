#!/bin/bash
# This script is a Kustomize generator that adds a timestamp 
# to force redeployment on every ArgoCD sync

# Generate a timestamp
TIMESTAMP=$(date +%s)
RANDOM_ID=$(tr -dc 'a-zA-Z0-9' < /dev/urandom | head -c 8)

cat << EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: deployment-trigger-${TIMESTAMP}
  namespace: lilypad
  annotations:
    argocd.argoproj.io/sync-wave: "0"
    argocd.argoproj.io/sync-options: Replace=true
data:
  timestamp: "${TIMESTAMP}"
  random_id: "${RANDOM_ID}"
EOF
