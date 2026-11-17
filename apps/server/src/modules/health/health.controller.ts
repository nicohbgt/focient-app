import { Router, Request, Response } from 'express';
import { prisma } from '@focient/database';

export const healthRouter = Router();

// Liveness probe
healthRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// Readiness probe (verifies database connectivity)
healthRouter.get('/ready', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'READY',
      database: 'CONNECTED',
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'NOT_READY',
      database: 'DISCONNECTED',
      error: error instanceof Error ? error.message : 'Database ping failed',
    });
  }
});
