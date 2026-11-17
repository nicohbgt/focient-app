import express, { Express } from 'express';
import { configureSecurityMiddleware } from './middleware/security.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { authRouter, onboardingRouter } from './modules/auth/auth.controller.js';
import { taskRouter } from './modules/task/task.controller.js';
import { scheduleRouter } from './modules/schedule/schedule.controller.js';
import { categoryRouter } from './modules/category/category.controller.js';
import { notificationRouter } from './modules/notification/notification.controller.js';
import { insightRouter } from './modules/insight/insight.controller.js';
import { healthRouter } from './modules/health/health.controller.js';
import { devRouter } from './modules/dev/dev.controller.js';

export const createApp = (): Express => {
  const app = express();

  // Apply Security Middleware (Helmet, CORS, Rate Limiting)
  configureSecurityMiddleware(app);

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Monitoring & Health
  app.use(healthRouter);

  // Dev Utility Routes (clean-user, reset-db - active only in non-production)
  app.use('/api/dev', devRouter);

  // Application Domain API Routes (Gateway Controllers matching Architecture Specification)
  app.use('/api/auth', authRouter);
  app.use('/api/onboarding', onboardingRouter);
  app.use('/api/tasks', taskRouter);
  app.use('/api/categories', categoryRouter);
  app.use('/api/schedule', scheduleRouter);
  app.use('/api/today-plan', scheduleRouter);
  app.use('/api/timeline', scheduleRouter);
  app.use('/api/notifications', notificationRouter);
  app.use('/api/insights', insightRouter);

  // Central Error Handler
  app.use(errorHandler);

  return app;
};
