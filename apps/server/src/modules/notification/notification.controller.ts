import { Router, Response } from 'express';
import {
  RegisterDeviceTokenSchema,
  UnregisterDeviceTokenSchema,
  UpdateNotificationPreferencesSchema,
  SendTestPushNotificationSchema,
} from '@focient/contracts';
import { authenticate, AuthenticatedRequest } from '../auth/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
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

// GET /api/notifications/preferences
notificationRouter.get('/preferences', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const preferences = await notificationService.getPreferences(req.user!.id);
    res.json(preferences);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notifications/preferences
notificationRouter.patch(
  '/preferences',
  validateBody(UpdateNotificationPreferencesSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const updated = await notificationService.updatePreferences(req.user!.id, req.body);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/notifications/device-token
notificationRouter.post(
  '/device-token',
  validateBody(RegisterDeviceTokenSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const record = await notificationService.registerDeviceToken(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Device token registered successfully',
        deviceToken: record,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/notifications/device-token
notificationRouter.delete(
  '/device-token',
  validateBody(UnregisterDeviceTokenSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const removed = await notificationService.unregisterDeviceToken(req.user!.id, req.body.token);
      res.json({
        success: removed,
        message: removed ? 'Device token unregistered' : 'Device token not found',
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/notifications/test-push
notificationRouter.post(
  '/test-push',
  validateBody(SendTestPushNotificationSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { title, body, type } = req.body;
      const result = await notificationService.dispatchFcmNotification(
        req.user!.id,
        { title, body },
        type
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);
