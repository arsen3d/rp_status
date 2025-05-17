# Commit-Based Redeployment

This document explains how to use the commit-based redeployment feature in the RP Status project.

## Overview

The system is configured to automatically redeploy the application when new commits are detected in the GitHub repository. This ensures that the latest code is always running in the cluster without manual intervention.

## How It Works

1. The deployment is configured to use the Git commit hash as a trigger for redeployment.
2. When ArgoCD syncs the application, it detects the commit hash from either:
   - The ArgoCD environment variable `ARGOCD_APP_REVISION`
   - A direct query to the GitHub API
3. This commit hash is stored in the `build-info` ConfigMap and used as an environment variable in the container.
4. The pod template annotations include the commit hash, forcing Kubernetes to recreate the pods when the hash changes.

## Manual Triggering

There are several ways to manually trigger a redeploy:

### Force Redeploy with Current Commit

```bash
./force-redeploy.sh --github
```

This script fetches the latest commit from GitHub and triggers a redeployment.

### Test with a Fake Commit

```bash
./test-commit-sync.sh --fake
```

This generates a fake commit hash and updates the deployment, useful for testing the redeployment mechanism.

### Setup Automatic Checking

```bash
./setup-github-check-cron.sh
```

This sets up a cron job that periodically checks for new commits and redeploys if changes are detected.

## Troubleshooting

If the automatic redeployment isn't working:

1. Check the ArgoCD application status:
   ```bash
   kubectl get application rp-status -n argocd -o jsonpath='{.status.sync.status}'
   ```

2. Verify the commit hash in the ConfigMap:
   ```bash
   kubectl get configmap build-info -n lilypad -o jsonpath='{.data.git_commit}'
   ```

3. Check if the deployment has the correct annotations:
   ```bash
   kubectl get deployment rp-dashboard -n lilypad -o jsonpath='{.spec.template.metadata.annotations}'
   ```

4. Force a manual redeploy:
   ```bash
   ./force-redeploy.sh
   ```

## Additional Tools

- `update-argocd-commit.sh`: Updates the ArgoCD application to use a specific commit hash
- `check-github-changes.sh`: Checks if the GitHub repository has new commits and triggers redeployment if needed
