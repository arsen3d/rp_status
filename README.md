# RP Status Dashboard

This repository contains the RP Status Dashboard application, which is deployed using ArgoCD in a Kubernetes cluster.

## Commit-Based Redeployment

The application is configured to automatically redeploy when new commits are detected in the GitHub repository. This ensures the latest code is always running without manual intervention.

### How It Works

The deployment uses git commit hashes to determine when a redeploy is necessary:

1. When ArgoCD syncs the application, it checks the latest commit from GitHub
2. The commit hash is stored in a ConfigMap and used in the pod annotations
3. When the commit hash changes, Kubernetes recreates the pods with the updated code

### Available Scripts

Several scripts are available to manage deployments:

- `force-redeploy.sh`: Forces a redeployment with the latest timestamp
  - Use `./force-redeploy.sh --github` to redeploy with the latest GitHub commit
  
- `check-github-changes.sh`: Checks for new commits in GitHub and triggers a redeploy if needed

- `setup-github-check-cron.sh`: Sets up a cron job to automatically check for GitHub changes

- `test-commit-sync.sh`: Tests the commit-based redeployment with a fake commit
  - Use `./test-commit-sync.sh --fake` to generate a fake commit hash
  - Use `./test-commit-sync.sh --force` to force a rollout after updating

For more detailed information, see [COMMIT_BASED_REDEPLOY.md](COMMIT_BASED_REDEPLOY.md).

## Development

To start the React development server:

```bash
cd rp-dashboard
npm run dev
```

This will start the development server at http://localhost:5173.

## Deployment

The application is automatically deployed by ArgoCD. To manually trigger a deployment:

1. Make changes to the code and push to GitHub
2. ArgoCD will detect the changes and deploy the new version
3. Alternatively, run `./force-redeploy.sh --github` to force a redeployment

## Troubleshooting

If the deployment isn't working correctly:

1. Check the ArgoCD UI to see if the application is synced
2. Run `kubectl get pods -n lilypad` to check the status of the pods
3. Check the logs with `kubectl logs -n lilypad <pod-name>`
4. Try forcing a manual redeploy with `./force-redeploy.sh`

For more troubleshooting information, see [DEPLOYMENT_NOTES.md](DEPLOYMENT_NOTES.md).
