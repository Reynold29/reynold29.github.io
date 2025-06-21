// Configuration for API endpoints
const config = {
  // Development environment
  development: {
    apiUrl: 'http://localhost:5001'
  },
  // Production environment (Railway backend)
  production: {
    apiUrl: process.env.REACT_APP_API_URL || 'https://your-app-name-production.up.railway.app'
  }
};

// Get current environment
const environment = import.meta.env.MODE || 'development';

// Export the appropriate configuration
export const apiUrl = config[environment].apiUrl;

// Log the current configuration for debugging
console.log(`Environment: ${environment}, API URL: ${apiUrl}`); 