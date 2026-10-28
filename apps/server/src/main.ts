import 'dotenv/config';
import { createApp } from './app.js';
import { logger } from './common/logger.js';
import { getJwtSecret } from './common/config.js';
import { prisma } from '@focient/database';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

async function bootstrap() {
  // Validate critical cryptographic secrets on startup
  getJwtSecret();

  const app = createApp();

  const server = app.listen(PORT, () => {
    logger.info(`FoCient Server started on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      await prisma.$disconnect();
      logger.info('Database connection closed.');
      process.exit(0);
    });

    // Force shutdown after 10s timeout
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((error) => {
  logger.error('Failed to start FoCient Server', error);
  process.exit(1);
});
