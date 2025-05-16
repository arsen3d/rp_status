// A utility for debugging and logging errors to both console and VSCode
export const debugLogger = {
  error: (message, ...args) => {
    console.error(`[DEBUG ERROR] ${message}`, ...args);
    
    // Store in localStorage for persistence
    const errorLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
    errorLogs.push({
      timestamp: new Date().toISOString(),
      type: 'error',
      message,
      details: args.map(arg => 
        typeof arg === 'object' && arg !== null
          ? JSON.stringify(arg, Object.getOwnPropertyNames(arg))
          : String(arg)
      )
    });
    localStorage.setItem('errorLogs', JSON.stringify(errorLogs.slice(-50)));
  },
  
  warn: (message, ...args) => {
    console.warn(`[DEBUG WARN] ${message}`, ...args);
    
    // Store in localStorage for persistence
    const errorLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
    errorLogs.push({
      timestamp: new Date().toISOString(),
      type: 'warning',
      message,
      details: args.map(arg => 
        typeof arg === 'object' && arg !== null
          ? JSON.stringify(arg, Object.getOwnPropertyNames(arg))
          : String(arg)
      )
    });
    localStorage.setItem('errorLogs', JSON.stringify(errorLogs.slice(-50)));
  },
  
  // Display errors in UI (can be triggered manually)
  showErrorOverlay: (show = true) => {
    if (show) {
      const errorLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      
      // Create or update the error overlay
      let overlay = document.getElementById('debug-error-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'debug-error-overlay';
        overlay.style.position = 'fixed';
        overlay.style.bottom = '0';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.maxHeight = '40vh';
        overlay.style.overflowY = 'auto';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        overlay.style.color = 'white';
        overlay.style.padding = '10px';
        overlay.style.zIndex = '9999';
        overlay.style.fontFamily = 'monospace';
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '5px';
        closeBtn.style.right = '5px';
        closeBtn.onclick = () => debugLogger.showErrorOverlay(false);
        overlay.appendChild(closeBtn);
        
        document.body.appendChild(overlay);
      }
      
      // Add error logs to overlay
      const content = document.createElement('div');
      content.innerHTML = `<h3>Debug Logs (${errorLogs.length})</h3>`;
      
      if (errorLogs.length === 0) {
        content.innerHTML += '<p>No errors logged.</p>';
      } else {
        errorLogs.forEach((log, index) => {
          const logEntry = document.createElement('div');
          logEntry.style.borderBottom = '1px solid #333';
          logEntry.style.padding = '5px 0';
          logEntry.style.marginBottom = '5px';
          
          const color = log.type === 'error' ? '#ff5555' : '#ffaa00';
          logEntry.innerHTML = `
            <div style="color: ${color}; font-weight: bold;">
              [${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}
            </div>
            <pre style="margin: 5px 0; white-space: pre-wrap;">${log.details.join('\n')}</pre>
          `;
          
          content.appendChild(logEntry);
        });
      }
      
      // Replace overlay content
      overlay.innerHTML = '';
      overlay.appendChild(content);
      
      // Re-add close button
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Close';
      closeBtn.style.position = 'absolute';
      closeBtn.style.top = '5px';
      closeBtn.style.right = '5px';
      closeBtn.onclick = () => debugLogger.showErrorOverlay(false);
      overlay.appendChild(closeBtn);
    } else {
      // Remove overlay if exists
      const overlay = document.getElementById('debug-error-overlay');
      if (overlay) {
        document.body.removeChild(overlay);
      }
    }
  },
  
  // Clear error logs
  clearLogs: () => {
    localStorage.removeItem('errorLogs');
    console.log('[DEBUG] Error logs cleared');
  },
  
  // Get all logs
  getLogs: () => {
    return JSON.parse(localStorage.getItem('errorLogs') || '[]');
  }
};

// Add a global keyboard shortcut to show error overlay
window.addEventListener('keydown', (e) => {
  // Alt+Shift+D to show debug overlay
  if (e.altKey && e.shiftKey && e.key === 'D') {
    debugLogger.showErrorOverlay();
  }
});

export default debugLogger;
