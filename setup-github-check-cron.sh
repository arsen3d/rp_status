#!/bin/bash
# Script to setup a cron job that checks for GitHub commits and redeploys if needed

echo "Setting up cron job to check for GitHub changes..."

# Create the crontab entry to run every 1 minutes
CRON_ENTRY="*/1 * * * * /root/rp_status/update-deployment-with-commit.sh >> /tmp/github-check.log 2>&1"

# Check if the cron job already exists
if crontab -l 2>/dev/null | grep -q "update-deployment-with-commit.sh\|check-github-changes.sh"; then
    echo "Cron job already exists. Updating..."
    # Remove existing cron job and add new one
    (crontab -l 2>/dev/null | grep -v "update-deployment-with-commit.sh\|check-github-changes.sh"; echo "$CRON_ENTRY") | crontab -
else
    echo "Adding new cron job..."
    # Add to existing crontab or create new one
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
fi

# Show current crontab
echo "Current crontab:"
crontab -l

echo "Cron job setup complete. The script will run every 5 minutes."
echo "Log output will be saved to /tmp/github-check.log"
