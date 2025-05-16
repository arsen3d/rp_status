import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import React from 'react';
import ThemeContextProvider from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Providers from './pages/Providers';
import Hardware from './pages/Hardware';
import Deals from './pages/Deals';
import Financial from './pages/Financial';
import Network from './pages/Network';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    },
  },
});

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error("Error caught by error boundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', background: '#ffeeee', border: '1px solid #ffaaaa', borderRadius: '4px' }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap', margin: '10px 0' }}>
            <summary>Error Details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  // Global error logging
  useEffect(() => {
    // Global error handler to log uncaught errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Log to console for VSCode debug console
      originalConsoleError.apply(console, args);
      
      // You can also send errors to a service or store them
      // For debugging, we'll log them to localStorage
      const errorLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      errorLogs.push({
        timestamp: new Date().toISOString(),
        error: args.map(arg => 
          typeof arg === 'object' && arg !== null
            ? JSON.stringify(arg, Object.getOwnPropertyNames(arg))
            : String(arg)
        ).join(' ')
      });
      localStorage.setItem('errorLogs', JSON.stringify(errorLogs.slice(-50)));
    };

    // Capture unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Capture uncaught errors
    const handleUncaughtError = (event) => {
      console.error('Uncaught Error:', event.error || event.message);
      // Prevent default browser error handlers
      event.preventDefault();
    };
    window.addEventListener('error', handleUncaughtError);

    return () => {
      console.error = originalConsoleError;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleUncaughtError);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeContextProvider>
          <Router>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/providers" element={<Providers />} />
                <Route path="/hardware" element={<Hardware />} />
                <Route path="/deals" element={<Deals />} />
                <Route path="/financial" element={<Financial />} />
                <Route path="/network" element={<Network />} />
              </Routes>
            </MainLayout>
          </Router>
        </ThemeContextProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
}

export default App;
