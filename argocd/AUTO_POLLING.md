# ArgoCD Automatic Repository Polling

ArgoCD has been configured to automatically detect changes in your GitHub repository through its built-in polling mechanism. This means that:

1. ArgoCD will automatically check your repository at regular intervals (typically every 3 minutes by default)
2. When changes are detected, ArgoCD will automatically sync your application
3. No webhooks or external triggers are required

## How It Works

ArgoCD uses the following configuration to enable automatic polling and syncing:

```yaml
syncPolicy:
  automated:
    prune: true      # Automatically delete resources that are no longer defined in Git
    selfHeal: true   # Automatically sync when drift is detected between Git and the cluster
    allowEmpty: false
```

This configuration ensures that:
- ArgoCD will poll your repository regularly
- When changes are detected, it will automatically trigger a sync
- All resources are kept in sync with your Git repository

## Deployment Process

With this configuration in place, your deployment process is now fully automated:

1. Make changes to your code in the GitHub repository
2. Commit and push the changes to GitHub
3. ArgoCD will detect the changes during its next polling cycle
4. ArgoCD will automatically sync your application with zero downtime

## Customizing Polling Interval (Optional)

If needed, you can adjust how frequently ArgoCD polls for changes by modifying the ArgoCD ConfigMap. The default polling interval is 3 minutes.

To change this, you would need to update the `timeout.reconciliation` setting in the ArgoCD ConfigMap:

```
kubectl patch configmap argocd-cm -n argocd --type merge -p '{"data":{"timeout.reconciliation":"30s"}}'
```

This example would set it to 30 seconds. Adjust as needed for your environment.

## Checking Sync Status

You can always check the current sync status in the ArgoCD UI:
- Applications that are in sync will show a green "Synced" status
- Applications that are still syncing will show a yellow "Progressing" status
- Applications that are out of sync will show a red "OutOfSync" status

## Zero-Downtime Updates

Your deployment is configured with a rolling update strategy that ensures zero downtime during updates:
- New pods are created before old ones are terminated
- Traffic continues flowing to the old pods until the new ones are fully ready
- The PodDisruptionBudget ensures pods aren't disrupted during the update process
