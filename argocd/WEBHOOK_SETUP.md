# GitHub Webhook Setup for Automatic ArgoCD Sync

This guide will help you set up a GitHub webhook to automatically trigger ArgoCD to sync your application when changes are pushed to your GitHub repository.

## Prerequisites
- Administrator access to your GitHub repository
- Access to your ArgoCD instance

## Steps to Configure GitHub Webhook

1. **Get the ArgoCD Webhook URL**
   The ArgoCD webhook URL typically follows this format:
   ```
   https://<your-argocd-server>/api/webhook
   ```

2. **Configure the Webhook in GitHub**
   - Go to your GitHub repository (https://github.com/arsen3d/rp_status)
   - Navigate to "Settings" > "Webhooks" > "Add webhook"
   - Fill in the following information:
     - Payload URL: `https://<your-argocd-server>/api/webhook`
     - Content type: `application/json`
     - Secret: (Optional, but recommended for security)
     - SSL verification: Enabled (unless you're using a self-signed certificate)
     - Which events would you like to trigger this webhook?: Select "Just the push event"
     - Active: Check this box
   - Click "Add webhook"

3. **Configure ArgoCD to Accept Webhooks (if needed)**
   If your ArgoCD instance requires additional configuration to accept webhooks, you may need to:
   - Ensure the ArgoCD server is accessible from GitHub (proper network configuration)
   - Configure any necessary authentication for webhooks

## Verification
After setting up the webhook:
1. Make a small change to your repository
2. Push the change to GitHub
3. Monitor your ArgoCD application - it should automatically start syncing

## Troubleshooting
- Check GitHub webhook delivery logs in the repository settings
- Review ArgoCD server logs for webhook-related events
- Verify network connectivity between GitHub and your ArgoCD server

---

With this configuration:
1. When you push changes to GitHub, a webhook is triggered
2. The webhook sends a notification to ArgoCD
3. ArgoCD detects the changes and automatically syncs your application
4. Your application is updated with zero downtime
