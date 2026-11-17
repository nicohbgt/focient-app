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
    if (req.query.type === 'reflection') {
      const reflection = await insightService.getWeeklyReflection(req.user!.id);
      res.json(reflection);
      return;
    }
    const summary = await insightService.getWeeklyInsightSummary(req.user!.id);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

// GET /api/insights/weekly-summary (Proses 5.0)
insightRouter.get('/weekly-summary', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const summary = await insightService.getWeeklyInsightSummary(req.user!.id);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

// GET /api/insights/metrics (PRD MVP Success Metrics: Activation, Execution, Efficiency)
insightRouter.get('/metrics', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const metrics = await insightService.getSuccessMetrics(req.user!.id);
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});
