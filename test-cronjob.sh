#!/bin/bash
# Script to verify the CronJob setup by deploying the CronJob manually and testing it

# Apply the RBAC resources first
kubectl apply -f /root/rp_status/argocd/rbac.yaml

# Apply the CronJob
kubectl apply -f /root/rp_status/argocd/cronjob.yaml

# Wait a moment for the CronJob to start
echo "Waiting for CronJob to start..."
sleep 10

# Check if the CronJob exists
echo "Checking CronJob status:"
kubectl get cronjobs -n lilypad

# Create a manual job from the CronJob to test it
echo "Creating a manual job to test:"
kubectl create job --from=cronjob/github-commit-checker test-job-$(date +%s) -n lilypad

# Wait a moment for the job to complete
echo "Waiting for job to complete..."
sleep 30

# Check the job status
echo "Job status:"
kubectl get jobs -n lilypad

# Check the logs from the job
echo "Job logs:"
LATEST_JOB=$(kubectl get jobs -n lilypad -o=custom-columns=NAME:.metadata.name --sort-by=.metadata.creationTimestamp | tail -n 1)
kubectl logs -n lilypad job/$LATEST_JOB -c kubectl-updater

# Check if deployment was updated
echo "Checking if deployment was updated:"
kubectl get deployment rp-dashboard -n lilypad -o=jsonpath='{.spec.template.metadata.annotations}'
echo ""

echo "Test completed. Check the output above to verify if the CronJob is working correctly."
