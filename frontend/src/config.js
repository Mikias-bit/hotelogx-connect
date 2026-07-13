const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Local API URL vs Live API URL
export const API_BASE_URL = isLocal
  ? (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000')
  : 'https://hotelpmsbackend-production.up.railway.app';

