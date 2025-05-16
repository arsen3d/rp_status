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
