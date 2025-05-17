#!/bin/bash
# Script to manually trigger ArgoCD sync with a specific commit hash
# This simulates what happens when the GitHub repo is updated

# Get the current commit hash or generate a fake one for testing
if [ "$1" == "--fake" ]; then
  FAKE_HASH="fake-commit-$(date +%s)"
  echo "Using fake commit hash for testing: $FAKE_HASH"
  COMMIT="$FAKE_HASH"
else
  # Get latest commit from git
  cd /root/rp_status
  COMMIT=$(git rev-parse HEAD)
  echo "Using current git commit: $COMMIT"
fi

# Update the configmap
echo "Updating configmap with commit hash..."
kubectl patch configmap build-info -n lilypad --type=merge -p "{\"data\":{\"git_commit\":\"$COMMIT\"}}"

# Update the deployment directly with the commit hash
echo "Updating deployment annotations with commit hash..."
kubectl patch deployment rp-dashboard -n lilypad --type=strategic --patch "{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"git-commit\":\"$COMMIT\"}}}}}"

# Force ArgoCD to refresh and sync
echo "Triggering ArgoCD refresh and sync..."
kubectl patch application rp-status -n argocd --type=json -p="[{\"op\":\"replace\",\"path\":\"/metadata/annotations/argocd.argoproj.io~1refresh\",\"value\":\"$(date +%s)\"}]"

# Optional: force a manual deployment restart
if [ "$1" == "--force" ] || [ "$2" == "--force" ]; then
  echo "Forcing deployment restart..."
  kubectl rollout restart deployment rp-dashboard -n lilypad
  kubectl rollout status deployment rp-dashboard -n lilypad
fi

echo "Done! Monitor the sync in ArgoCD UI or with kubectl commands"
