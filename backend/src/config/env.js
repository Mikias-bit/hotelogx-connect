const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: process.env.PORT || 5000,
  databaseUrl: process.env.DATABASE_URL,
  env: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  backendBaseUrl: process.env.BACKEND_BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
  frontendBaseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:5173',
  emailWorkerSecret: process.env.EMAIL_WORKER_SECRET,
  emailPolling: {
    enabled: String(process.env.EMAIL_POLLING_ENABLED || '').toLowerCase() === 'true',
    intervalSeconds: Number(process.env.EMAIL_POLLING_INTERVAL_SECONDS || 60),
    maxResults: Number(process.env.EMAIL_POLLING_MAX_RESULTS || 10)
  },
  googleOAuth: {
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI
  },
  mews: {
    baseUrl: process.env.MEWS_BASE_URL,
    clientToken: process.env.MEWS_CLIENT_TOKEN,
    accessToken: process.env.MEWS_ACCESS_TOKEN
  }
};

module.exports = config;
