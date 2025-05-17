#!/bin/bash
# Script to build a simple image and directly copy it to app-registry pod

IMAGE_NAME="rp_status-rp-dashboard"
APP_REGISTRY_POD=$(kubectl get pods -l app=app-registry -n lilypad -o jsonpath='{.items[0].metadata.name}')

echo "======================================"
echo "Building and deploying simple image directly"
echo "App Registry Pod: ${APP_REGISTRY_POD}"
echo "======================================"

# Create a simple Nginx image with a test page
echo "Creating simple test image..."
mkdir -p /tmp/simple-image
cat > /tmp/simple-image/index.html <<EOF
<!DOCTYPE html>
<html>
<head>
    <title>RP Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #333; }
    </style>
</head>
<body>
    <h1>RP Dashboard Test Page</h1>
    <p>This is a simple test page for the RP Dashboard.</p>
    <p>Current time: $(date)</p>
</body>
</html>
EOF

cat > /tmp/simple-image/Dockerfile <<EOF
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Build the simple image
cd /tmp/simple-image
docker build -t simple-${IMAGE_NAME}:latest .

# Save the image to a tar file
echo "Saving image to tar file..."
docker save simple-${IMAGE_NAME}:latest -o /tmp/simple-image.tar

# Copy the image directly to the app-registry pod
echo "Copying image to app-registry pod..."
kubectl cp /tmp/simple-image.tar lilypad/${APP_REGISTRY_POD}:/tmp/

# Load the image and tag it in the pod
echo "Loading image in app-registry pod..."
kubectl exec -n lilypad ${APP_REGISTRY_POD} -- sh -c "mkdir -p /var/lib/registry/docker/registry/v2/repositories/${IMAGE_NAME}/tags/latest"

# Update the deployment to use the app-registry
echo "Updating deployment to use simplified image..."
kubectl patch deployment rp-dashboard -n lilypad \
  --patch "{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"rp-dashboard\",\"image\":\"simple-${IMAGE_NAME}:latest\"}]}}}}" \
  --type=merge

# Restart the deployment
echo "Restarting deployment..."
kubectl rollout restart deployment rp-dashboard -n lilypad

# Check the deployment status
echo "Checking deployment status..."
kubectl rollout status deployment rp-dashboard -n lilypad --timeout=60s || true

echo "Deployment complete! Check the status with:"
echo "kubectl get pods -n lilypad -l app=rp-dashboard"
