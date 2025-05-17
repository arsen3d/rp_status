#!/bin/bash
# Script to reset and redeploy the entire application

echo "Resetting and redeploying the application..."

# 1. Delete existing resources
echo "Deleting existing resources..."
kubectl delete deployment rp-dashboard -n lilypad --ignore-not-found
kubectl delete pipelinerun --all -n lilypad

# 2. Apply the ArgoCD build plugin
echo "Applying the ArgoCD build plugin..."
kubectl apply -f argocd/argocd-build-plugin.yaml -n argocd

# 3. Apply all resources with kustomize
echo "Applying all resources with kustomize..."
kubectl apply -k argocd/

# 4. Trigger a new pipeline run
echo "Creating a new pipeline run..."
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
      value: "app-registry:5000"
    - name: registry-user
      value: ""
    - name: registry-password
      value: ""
EOF

echo "Deployment initiated. Monitoring pipeline..."
kubectl get pipelinerun docker-build-pipeline-run-${TIMESTAMP} -n lilypad
