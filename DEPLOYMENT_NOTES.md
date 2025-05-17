# RP Status Deployment Troubleshooting

## Issues Identified

1. **DNS Resolution Issues**
   - The deployment was configured to use service names (`app-registry:5000`, `registry:5000`), but DNS resolution is failing
   - Caused `ImagePullBackOff` errors in the deployment pods

2. **Registry Access Issues**
   - The pipeline couldn't push to the registry due to connection issues
   - The pods couldn't pull from the registry due to similar connection issues
   - TLS/HTTPS issues when trying to use the registry with default settings

3. **Tekton Pipeline Issues**
   - The pipeline was properly defined but wasn't successfully completing tasks
   - The registry connection issues were preventing images from being pushed

## Solutions Implemented

1. **Working Deployment**
   - Updated the deployment to use a public image (`nginx:alpine`)
   - This confirmed the deployment itself works correctly when images are available

2. **Registry Access**
   - Created scripts to test and diagnose registry access issues
   - Tested direct IP access to the registry
   - Identified TLS/security issues with registry connections

3. **Development Environment**
   - Created a `setup-dev-env.sh` script to properly set up the development environment
   - Added a React development server for frontend work

## Next Steps

1. **Proper Registry Setup**
   - Set up a proper insecure registry that can be accessed from both the host and cluster
   - Configure Docker daemon to accept insecure registry connections

2. **CI/CD Pipeline**
   - Once registry is working, re-enable and test the Tekton pipeline
   - Update all scripts to use the working registry configuration

3. **Frontend Development**
   - Continue development using the React dev server
   - Test frontend changes by updating the deployment with new images when ready

## Usage Instructions

1. **Quick Deployment**
   - Run `/root/rp_status/public-image-deploy.sh` to deploy a working version with a public image

2. **Development Setup**
   - Run `/root/rp_status/setup-dev-env.sh` to set up the complete development environment

3. **Building Images**
   - After fixing registry issues, run `/root/rp_status/insecure-registry-deploy.sh` to build and deploy with local images

4. **Checking Registry Status**
   - Run `/root/rp_status/check-registries.sh` to check the status of the image registries
