import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@focient/database';

export const devRouter = Router();

// Middleware: Restrict all /api/dev routes to non-production environments
devRouter.use((req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Dev endpoints are disabled in production environment',
    });
  }
  next();
});

// POST /api/dev/clean-user: Cleans user and all cascading relational records
devRouter.post('/clean-user', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Parameter email wajib disertakan',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });

    if (user) {
      await prisma.$transaction([
        prisma.task.deleteMany({ where: { userId: user.id } }),
        prisma.category.deleteMany({ where: { userId: user.id } }),
        prisma.scheduleBlock.deleteMany({ where: { userId: user.id } }),
        prisma.workloadDaily.deleteMany({ where: { userId: user.id } }),
        prisma.activityLog.deleteMany({ where: { userId: user.id } }),
        prisma.rescheduleAuditLog.deleteMany({ where: { userId: user.id } }),
        prisma.rescheduleLog.deleteMany({ where: { userId: user.id } }),
        prisma.notification.deleteMany({ where: { userId: user.id } }),
        prisma.session.deleteMany({ where: { userId: user.id } }),
        prisma.deviceToken.deleteMany({ where: { userId: user.id } }),
        prisma.user.delete({ where: { id: user.id } }),
      ]).catch(async () => {
        await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
      });
    }

    return res.json({
      success: true,
      message: `User ${cleanEmail} and all relational data cleared.`,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/dev/reset-db: Resets database in dev mode
devRouter.post('/reset-db', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.$transaction([
      prisma.task.deleteMany(),
      prisma.category.deleteMany(),
      prisma.scheduleBlock.deleteMany(),
      prisma.workloadDaily.deleteMany(),
      prisma.activityLog.deleteMany(),
      prisma.rescheduleAuditLog.deleteMany(),
      prisma.rescheduleLog.deleteMany(),
      prisma.notification.deleteMany(),
      prisma.session.deleteMany(),
      prisma.deviceToken.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    return res.json({
      success: true,
      message: 'Database reset successfully.',
    });
  } catch (error) {
    next(error);
  }
});
