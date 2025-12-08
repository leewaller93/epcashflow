// API Configuration
// Use environment variable in production, fallback to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default API_URL;

