import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../auth/auth.middleware.js';
import { insightService } from './insight.service.js';

export const insightRouter = Router();

insightRouter.use(authenticate);

// GET /api/insights/daily?date=YYYY-MM-DD
insightRouter.get('/daily', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const dateStr = req.query.date as string | undefined;
    const daily = await insightService.getDailyInsight(req.user!.id, dateStr);
    res.json(daily);
  } catch (error) {
    next(error);
  }
});

// GET /api/insights/weekly
insightRouter.get('/weekly', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const reflection = await insightService.getWeeklyReflection(req.user!.id);
    res.json(reflection);
  } catch (error) {
    next(error);
  }
});
