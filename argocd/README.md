# ArgoCD Configuration for RP Dashboard

This directory contains the Kubernetes manifests and ArgoCD configuration required to deploy the RP Dashboard application.

## Files

- `application.yaml`: The ArgoCD Application definition
- `deployment.yaml`: Kubernetes Deployment for the dashboard
- `service.yaml`: Kubernetes Service to expose the dashboard
- `ingress.yaml`: Kubernetes Ingress to provide external access
- `kustomization.yaml`: Kustomize configuration to manage all resources
- `tekton-pipeline.yaml`: Tekton Pipeline for building the Docker image
- `tekton-tasks.yaml`: Custom Tekton tasks for the build pipeline
- `tekton-pipelinerun.yaml`: PipelineRun to trigger the Tekton pipeline
- `argocd-build-plugin.yaml`: Custom ArgoCD plugin configuration

## Automated Build and Deployment

This setup automatically builds the Docker image when ArgoCD pulls the repository:

1. When ArgoCD syncs the application, it uses the `argocd-build-plugin` which:
   - Builds a new Docker image from the source using the Dockerfile
   - Applies the Kubernetes resources using kustomize

2. Alternatively, the Tekton pipeline can be used to:
   - Clone the repository
   - Build the Docker image directly in minikube's Docker daemon
   - Load the image into minikube for local development
   - Deploy the application using the local image

## Deployment

To deploy this application with ArgoCD:

1. Make sure ArgoCD and Tekton are installed in your cluster
2. Install the ArgoCD build plugin:
   ```
   kubectl apply -f argocd-build-plugin.yaml
   ```
3. Apply the application manifest:
   ```
   kubectl apply -f application.yaml
   ```
4. ArgoCD will automatically sync, build the image, and deploy all resources

## Configuration

- Update the `repoURL` in `application.yaml` and `tekton-pipelinerun.yaml` to point to your actual Git repository
- Update the `host` in `ingress.yaml` to use your actual domain

## Image

The application uses the `rp_status-rp-dashboard:latest` image which is built automatically from the Dockerfile. It's an NGINX-based container running on port 80.

## Minikube Development

For local development with minikube:

1. The deployment is configured to use `imagePullPolicy: Never` to use the locally built image
2. The image is built directly in the minikube Docker daemon to avoid registry issues
3. No external Docker registry is required for local development

## Troubleshooting

### Image Pull Errors

If you encounter image pull errors like `ErrImagePull`, `InvalidImageName`, or `ImagePullBackOff`:

1. Check that the image name in the deployment is correctly formatted:
   ```bash
   kubectl get deployment rp-dashboard -n lilypad -o jsonpath='{.spec.template.spec.containers[0].image}'
   ```

2. For minikube, build the image directly into minikube's Docker daemon:
   ```bash
   eval $(minikube docker-env)
   cd /root/rp_status
   docker build -t rp_status-rp-dashboard:latest .
   ```

3. Update the deployment to use `imagePullPolicy: Never` to use the local image:
   ```bash
   kubectl patch deployment rp-dashboard -n lilypad --type='json' -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/imagePullPolicy", "value": "Never"}]'
   ```

4. If using a remote registry, check registry credentials and connectivity:
   ```bash
   kubectl get secret registry-credentials -n lilypad
   ```
