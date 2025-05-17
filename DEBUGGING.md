# React Dashboard Debug Setup

## Chrome Debugging in VSCode

This project is configured to enable browser console output to be visible in VSCode, which helps track down UI errors and issues.

### How to use the debugging setup:

1. **Launch the debug session:**
   - Open VSCode Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
   - Select "Tasks: Run Task"
   - Choose "Debug React Application"

2. **View console logs:**
   - All console logs will appear in the Debug Console panel in VSCode
   - Uncaught errors will also be visible in VSCode

3. **Debugging UI in the application:**
   - Press `Alt+Shift+D` to toggle the debug panel
   - Click the "Debug Logs" button in the sidebar
   - Use the console command: `debugLogger.showErrorOverlay()`

4. **Available debug tools:**
   - Debug panel shows errors and warnings in real-time
   - Debug button in the sidebar toggles error overlay
   - All errors are stored in localStorage for persistence
   - Filter between all logs, errors, and warnings

### Useful commands:

- `debugLogger.getLogs()` - Get all debug logs
- `debugLogger.clearLogs()` - Clear all debug logs
- `debugLogger.showErrorOverlay()` - Show error overlay

### Break on Exceptions:

To break on exceptions in VSCode:
1. Open the Run and Debug panel
2. Click the gear icon to open launch.json
3. Make sure the "Chrome" launch configuration is selected
4. In the Debug toolbar, enable "Break on Exceptions"

### Network Debugging:

Network requests are automatically logged. To see them:
1. Check the Debug Console for request/response logs
2. Open the debug panel to see detailed API errors

### Terminal Debugging Commands:

```bash
# Check Chrome debugging port
lsof -i :9222

# Launch Chrome with debugging port manually
google-chrome --remote-debugging-port=9222 --user-data-dir=./chrome-debug-profile http://localhost:5173
```

### Debugging different browsers:

This setup primarily focuses on Chrome, but you can:
- Use Edge by selecting the "Launch Edge against localhost" configuration
- Use Firefox with the Firefox Debugger extension (requires additional setup)

## Kubernetes Deployment Debugging

### Checking Pod Status

To check the status of your pods:

```bash
kubectl get pods -n lilypad
```

If you see status like `ErrImagePull`, `ImagePullBackOff`, or `InvalidImageName`, there's an issue with your container image.

### Diagnosing Image Issues

1. **Check the exact error message**:
   ```bash
   kubectl describe pod -n lilypad -l app=rp-dashboard
   ```

2. **Check if the image exists**:
   For minikube:
   ```bash
   eval $(minikube docker-env)
   docker images | grep rp_status
   ```

3. **Check registry access** (if using external registry):
   ```bash
   kubectl run registry-test --image=alpine:latest --rm -it --restart=Never -- sh -c "apk add --no-cache curl && curl -s http://registry:5000/v2/_catalog"
   ```

### Common Errors and Solutions

#### InvalidImageName

If you see `InvalidImageName` or `couldn't parse image name "${REGISTRY_URL}/rp_status-rp-dashboard:latest"`:

1. Check if environment variables are being substituted correctly:
   ```bash
   kubectl get deployment rp-dashboard -n lilypad -o jsonpath='{.spec.template.spec.containers[0].image}'
   ```

2. Fix by directly specifying the image without variables:
   ```bash
   kubectl patch deployment rp-dashboard -n lilypad --type='json' -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value": "rp_status-rp-dashboard:latest"}]'
   ```

#### ErrImagePull or ImagePullBackOff

1. For minikube development:
   - Build image directly in minikube:
     ```bash
     eval $(minikube docker-env)
     cd /root/rp_status
     docker build -t rp_status-rp-dashboard:latest .
     ```
   - Set `imagePullPolicy: Never` to use local image:
     ```bash
     kubectl patch deployment rp-dashboard -n lilypad --type='json' -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/imagePullPolicy", "value": "Never"}]'
     ```

2. For external registry:
   - Check registry credentials:
     ```bash
     kubectl get secret registry-credentials -n lilypad
     ```
   - Test registry connection:
     ```bash
     kubectl run registry-test --image=alpine:latest --rm -it --restart=Never -- sh -c "wget -qO- --no-check-certificate https://my-registry:5000/v2/"
     ```

### Tekton Pipeline Debugging

1. **Check PipelineRun status**:
   ```bash
   kubectl get pipelineruns -n lilypad
   ```

2. **Get detailed PipelineRun information**:
   ```bash
   kubectl describe pipelinerun docker-build-pipeline-run -n lilypad
   ```

3. **Check logs of specific TaskRun**:
   ```bash
   kubectl get taskruns -n lilypad
   kubectl logs -n lilypad taskrun/docker-build-pipeline-run-build-docker-image -c step-build-and-load
   ```

4. **Manually run building and loading into minikube**:
   ```bash
   eval $(minikube docker-env)
   cd /root/rp_status
   docker build -t rp_status-rp-dashboard:latest .
   kubectl apply -f argocd/deployment.yaml
   ```
