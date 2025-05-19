// Format bytes to human-readable format
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
export const formatVBytes = (bytes, decimals = 0) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals 
  
  const i = Math.floor(Math.log(bytes ) / Math.log(k ));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' +"GB";
};

// Format large numbers with commas
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Format date and time
export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date and time with hours and minutes
export const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Calculate time ago
export const timeAgo = (timestamp) => {
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + ' years ago';
  }
  
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months ago';
  }
  
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' days ago';
  }
  
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hours ago';
  }
  
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minutes ago';
  }
  
  return Math.floor(seconds) + ' seconds ago';
};

// Get provider status based on state code
export const getProviderStatus = (state) => {
  // If state is a timestamp, use the time-based logic
  if (typeof state === 'string' || state instanceof Date) {
    const now = new Date();
    const lastSeenDate = new Date(state);
    const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffMinutes < 5) {
      return 'active';
    } else if (diffMinutes < 30) {
      return 'idle';
    } else {
      return 'offline';
    }
  }
  
  // If state is a number, map it to a status string
  const stateMap = {
    0: 'created',
    1: 'offered',
    2: 'accepted',
    3: 'active',
    4: 'inactive',
    5: 'offline'
  };
  
  return stateMap[state] || 'unknown';
};

// Get color for status
export const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'idle':
    case 'offered':
    case 'accepted':
      return 'warning';
    case 'offline':
    case 'inactive':
      return 'error';
    case 'created':
      return 'info';
    default:
      return 'default';
  }
};

// Get deal state text
export const getDealStateText = (state) => {
  const states = {
    0: 'Created',
    1: 'Resource Offered',
    2: 'Accepted',
    3: 'Completed',
    4: 'Failed',
    5: 'Canceled'
  };
  
  return states[state] || 'Unknown';
};

// Get deal state color
export const getDealStateColor = (state) => {
  const colors = {
    0: 'info',
    1: 'info',
    2: 'warning',
    3: 'success',
    4: 'error',
    5: 'error'
  };
  
  return colors[state] || 'default';
};

// Helper to truncate Ethereum addresses
export const truncateAddress = (address, startChars = 6, endChars = 4) => {
  // Handle null, undefined, or non-string values
  if (!address) return 'Unknown';
  
  // Convert to string if it's not already a string
  const addressStr = String(address);
  
  // Check if the address is too short to truncate
  if (addressStr.length <= startChars + endChars + 3) {
    return addressStr;
  }
  
  return `${addressStr.slice(0, startChars)}...${addressStr.slice(-endChars)}`;
};

export default {
  formatBytes,
  formatNumber,
  formatDate,
  formatDateTime,
  timeAgo,
  getProviderStatus,
  getStatusColor,
  getDealStateText,
  getDealStateColor,
  truncateAddress
};
