import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../auth/auth.middleware.js';
import { notificationService } from './notification.service.js';

export const notificationRouter = Router();

notificationRouter.use(authenticate);

// GET /api/notifications
notificationRouter.get('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const list = await notificationService.getUserNotifications(req.user!.id);
    res.json(list);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notifications/:id/read
notificationRouter.patch('/:id/read', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    await notificationService.markAsRead(req.user!.id, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
