import React, { useState, useEffect } from 'react';
import debugLogger from '../utils/debugLogger';

/**
 * Debug panel component for displaying errors and debug information
 * Use this component in development mode only
 */
const DebugPanel = ({ position = 'bottom-right' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Load logs on mount
    setLogs(debugLogger.getLogs());

    // Update logs when they change
    const interval = setInterval(() => {
      setLogs(debugLogger.getLogs());
    }, 2000);

    // Keyboard shortcut to toggle debug panel
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === 'D') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Position styling
  const getPositionStyle = () => {
    switch (position) {
      case 'bottom-right':
        return { bottom: '20px', right: '20px' };
      case 'bottom-left':
        return { bottom: '20px', left: '20px' };
      case 'top-right':
        return { top: '20px', right: '20px' };
      case 'top-left':
        return { top: '20px', left: '20px' };
      default:
        return { bottom: '20px', right: '20px' };
    }
  };

  // Filter logs
  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.type === filter);

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          ...getPositionStyle(),
          zIndex: 9999,
          padding: '8px 12px',
          background: '#333',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          opacity: 0.7,
          fontSize: '12px'
        }}
      >
        Debug ({logs.length})
      </button>
    );
  }

  return (
    <div 
      style={{
        position: 'fixed',
        ...getPositionStyle(),
        zIndex: 9999,
        width: '400px',
        maxHeight: '80vh',
        overflowY: 'auto',
        background: '#1e1e1e',
        color: '#eee',
        border: '1px solid #555',
        borderRadius: '4px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}
    >
      <div style={{ padding: '8px', borderBottom: '1px solid #555', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Debug Panel ({filteredLogs.length})</h3>
        <div>
          <button 
            onClick={() => setIsVisible(false)}
            style={{ background: 'transparent', border: 'none', color: '#eee', cursor: 'pointer', marginLeft: '8px' }}
          >
            ×
          </button>
        </div>
      </div>
      
      <div style={{ padding: '8px', borderBottom: '1px solid #555', display: 'flex', gap: '8px' }}>
        <button 
          onClick={() => setFilter('all')} 
          style={{ 
            background: filter === 'all' ? '#555' : 'transparent',
            border: '1px solid #555',
            color: '#eee',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('error')} 
          style={{ 
            background: filter === 'error' ? '#5a1d1d' : 'transparent',
            border: '1px solid #5a1d1d',
            color: '#eee',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Errors
        </button>
        <button 
          onClick={() => setFilter('warning')} 
          style={{ 
            background: filter === 'warning' ? '#5a4a1d' : 'transparent',
            border: '1px solid #5a4a1d',
            color: '#eee',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Warnings
        </button>
        <button 
          onClick={() => debugLogger.clearLogs()} 
          style={{ 
            background: 'transparent',
            border: '1px solid #555',
            color: '#eee',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: 'auto'
          }}
        >
          Clear
        </button>
      </div>
      
      <div style={{ padding: '8px' }}>
        {filteredLogs.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic' }}>No logs to display</p>
        ) : (
          filteredLogs.map((log, index) => (
            <div 
              key={index} 
              style={{ 
                borderBottom: '1px solid #333',
                padding: '8px 0',
                marginBottom: '8px'
              }}
            >
              <div style={{ 
                color: log.type === 'error' ? '#ff5555' : '#ffaa00',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>[{log.type.toUpperCase()}]</span>
                <span style={{ color: '#888', fontSize: '10px' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
              <div style={{ margin: '4px 0' }}>{log.message}</div>
              <pre 
                style={{ 
                  margin: '4px 0',
                  padding: '4px',
                  background: '#2a2a2a',
                  border: '1px solid #333',
                  borderRadius: '2px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  fontSize: '11px'
                }}
              >
                {log.details.join('\n')}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DebugPanel;
