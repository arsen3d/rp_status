#!/bin/bash

# Script to reset the pipeline run for ArgoCD

echo "Checking for existing PipelineRun..."
if kubectl get pipelinerun docker-build-pipeline-run -n lilypad &> /dev/null; then
  echo "Existing PipelineRun found, deleting it..."
  kubectl delete pipelinerun docker-build-pipeline-run -n lilypad
  # Wait for deletion to complete
  echo "Waiting for PipelineRun deletion to complete..."
  while kubectl get pipelinerun docker-build-pipeline-run -n lilypad &> /dev/null; do
    sleep 1
  done
  echo "PipelineRun deleted."
else
  echo "No existing PipelineRun found."
fi

echo "Creating new PipelineRun..."
kubectl apply -f /root/rp_status/argocd/tekton-pipelinerun.yaml

echo "PipelineRun reset complete. Check status with:"
echo "kubectl get pipelinerun docker-build-pipeline-run -n lilypad"
