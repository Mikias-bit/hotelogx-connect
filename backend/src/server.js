const app = require('./app');
const config = require('./config/env');
const prisma = require('./config/prisma');
const emailPollingScheduler = require('./services/email/EmailPollingScheduler');
// Trigger restart after prisma client generation


const startServer = async () => {
  try {
    // Validate database connection
    await prisma.$connect();
    console.log('Prisma ORM connected to PostgreSQL database successfully.');

    app.listen(config.port, () => {
      console.log(`Backend Express server running in ${config.env} mode on port ${config.port}`);
      emailPollingScheduler.start();
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
