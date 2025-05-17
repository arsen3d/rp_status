#!/bin/bash

# This script documents how we resolved the registry access and image pull issue

# First, check if the registry is accessible
echo "Checking registry access..."
kubectl run registry-test --image=alpine:latest --rm -it --restart=Never --namespace=lilypad -- sh -c "apk add --no-cache curl && curl -s http://10.106.91.185:5000/v2/_catalog"

# Create a service for the registry for better DNS resolution
echo "Creating registry service..."
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: registry
  namespace: lilypad
spec:
  selector:
    app: registry
  ports:
  - port: 5000
    targetPort: 5000
  type: ClusterIP
---
apiVersion: v1
kind: Endpoints
metadata:
  name: registry
  namespace: lilypad
subsets:
  - addresses:
    - ip: 10.106.91.185
    ports:
    - port: 5000
EOF

# Create registry credentials secret
echo "Creating registry credentials..."
kubectl create secret docker-registry registry-credentials --docker-server=10.106.91.185:5000 --docker-username=user --docker-password=pass --namespace=lilypad

# Update deployment to use local image (for development)
echo "Updating deployment to use local image..."
kubectl patch deployment rp-dashboard -n lilypad --type='json' -p='[
  {"op": "replace", "path": "/spec/template/spec/containers/0/image", "value": "rp_status-rp-dashboard:latest"},
  {"op": "replace", "path": "/spec/template/spec/containers/0/imagePullPolicy", "value": "Never"}
]'

# For production, use registry with proper credentials
# echo "For production, use the following configuration:"
# kubectl patch deployment rp-dashboard -n lilypad --type='json' -p='[
#   {"op": "replace", "path": "/spec/template/spec/containers/0/image", "value": "10.106.91.185:5000/rp_status-rp-dashboard:latest"},
#   {"op": "replace", "path": "/spec/template/spec/containers/0/imagePullPolicy", "value": "Always"}
# ]'

echo "Done!"