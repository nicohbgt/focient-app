import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../auth/auth.middleware.js';
import { insightService } from './insight.service.js';

export const insightRouter = Router();

insightRouter.use(authenticate);

// GET /api/insights/weekly
insightRouter.get('/weekly', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const reflection = await insightService.getWeeklyReflection(req.user!.id);
    res.json(reflection);
  } catch (error) {
    next(error);
  }
});
