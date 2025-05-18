# Docker Image Caching

To avoid Docker Hub rate limits, this project uses a local Docker registry to cache base images. This is especially useful for CI/CD environments or when developing on machines with limited Docker Hub pull quotas.

## Setting Up Local Registry and Caching Base Images

1. Run the provided script to set up a local registry and cache the base images:

```bash
./cache-base-images.sh
```

This script will:
- Start a local Docker registry on port 5000
- Pull the necessary base images (node:20-alpine and nginx:alpine)
- Tag and push these images to your local registry

2. The Dockerfile is already configured to use these cached images with the prefix `localhost:5000/`

## Troubleshooting

### Docker Hub Rate Limits

If you see errors like:
```
TOOMANYREQUESTS: You have reached your unauthenticated pull rate limit
```

This means you've hit Docker Hub's rate limit. Run the caching script to use your local registry instead.

### Registry Connection Issues

If you have issues connecting to the local registry, make sure:
- The registry container is running: `docker ps | grep local-registry`
- Your Docker daemon is configured to allow insecure registries (if needed)

You can add the following to `/etc/docker/daemon.json` and restart the Docker daemon:
```json
{
  "insecure-registries": ["localhost:5000"]
}
```

## Manual Image Management

To manually push additional images to your local registry:

```bash
# Pull an image
docker pull some-image:tag

# Tag for local registry
docker tag some-image:tag localhost:5000/some-image:tag

# Push to local registry
docker push localhost:5000/some-image:tag
```
