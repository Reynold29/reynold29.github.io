// Configuration for API endpoints
const config = {
  // Development environment
  development: {
    apiUrl: 'http://localhost:5001'
  },
  // Production environment (Render backend)
  production: {
    apiUrl: process.env.REACT_APP_API_URL || 'https://your-backend-name.onrender.com'
  }
};

// Get current environment
const environment = import.meta.env.MODE || 'development';

// Export the appropriate configuration
export const apiUrl = config[environment].apiUrl; 