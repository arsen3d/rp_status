import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'
import debugLogger from './utils/debugLogger';

// Configure global error handlers for debugging
window.onerror = function(message, source, lineno, colno, error) {
  debugLogger.error('Global error caught:', { message, source, lineno, colno, stack: error?.stack });
  // Don't prevent default handling
  return false;
};

// Configure axios with error logging
axios.interceptors.request.use(
  config => {
    debugLogger.warn('API Request:', { url: config.url, method: config.method, data: config.data });
    return config;
  },
  error => {
    debugLogger.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    debugLogger.error('API Response Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    return Promise.reject(error);
  }
);

// Configure axios defaults
axios.defaults.baseURL = '/'; // Set your API base URL here
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Copy sample.json to public folder
const copySampleJson = async () => {
  try {
    // In a real app, you'd use an API. For this demo, we're ensuring the sample data is accessible
    await fetch('/sample.json')
      .catch(async () => {
        debugLogger.warn('Checking sample.json availability...');
      });
  } catch (error) {
    debugLogger.error('Error checking sample.json:', error);
  }
};

// Initialize app
const initApp = async () => {
  try {
    await copySampleJson();
    
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    
    // Add a button to VSCode debug panel to show errors
    console.log('%c[DEBUG CONTROL]', 'background: #333; color: #fff; padding: 2px 5px;', 
      'Press Alt+Shift+D to show debug overlay, or run this in console: debugLogger.showErrorOverlay()');
    
    // Expose debug logger to window for console access
    window.debugLogger = debugLogger;
    
  } catch (error) {
    debugLogger.error('Fatal error initializing app:', error);
    // Show a minimal error screen if render fails
    document.getElementById('root').innerHTML = `
      <div style="padding: 20px; color: red; font-family: system-ui;">
        <h2>Failed to initialize application</h2>
        <p>An unexpected error occurred during application startup.</p>
        <pre>${error.stack || error.message || String(error)}</pre>
        <button onclick="location.reload()">Reload Application</button>
      </div>
    `;
  }
};

initApp();
