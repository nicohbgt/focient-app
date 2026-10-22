import express, { Express } from 'express';
import { configureSecurityMiddleware } from './middleware/security.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { authRouter } from './modules/auth/auth.controller.js';
import { taskRouter } from './modules/task/task.controller.js';
import { scheduleRouter } from './modules/schedule/schedule.controller.js';
import { notificationRouter } from './modules/notification/notification.controller.js';
import { insightRouter } from './modules/insight/insight.controller.js';
import { healthRouter } from './modules/health/health.controller.js';

export const createApp = (): Express => {
  const app = express();

  // Apply Security Middleware (Helmet, CORS, Rate Limiting)
  configureSecurityMiddleware(app);

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Monitoring & Health
  app.use(healthRouter);

  // Application Domain API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/tasks', taskRouter);
  app.use('/api/schedule', scheduleRouter);
  app.use('/api/notifications', notificationRouter);
  app.use('/api/insights', insightRouter);

  // Central Error Handler
  app.use(errorHandler);

  return app;
};
