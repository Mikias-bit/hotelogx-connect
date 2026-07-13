const { PrismaClient } = require('@prisma/client');
const config = require('./env');

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is missing. Create hotelogx_connect_app/backend/.env with a valid Neon/PostgreSQL DATABASE_URL before starting the backend.');
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.databaseUrl
    }
  }
});

module.exports = prisma;
