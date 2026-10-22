import { Router, Response } from 'express';
import { prisma, ScheduleBlockType } from '@focient/database';
import { RippleRescheduleSchema, AutoScheduleRequestSchema, ScheduleBlockDto } from '@focient/contracts';
import { validateBody } from '../../middleware/validate.middleware.js';
import { authenticate, AuthenticatedRequest } from '../auth/auth.middleware.js';
import { rescheduleEngine } from '../../engine/reschedule-engine.js';
import { workloadEngine } from '../../engine/workload-engine.js';

export const scheduleRouter = Router();

scheduleRouter.use(authenticate);

// GET /api/schedule?date=YYYY-MM-DD
scheduleRouter.get('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
    const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

    const blocks = await prisma.scheduleBlock.findMany({
      where: {
        userId,
        startTime: { gte: dayStart, lte: dayEnd },
      },
      orderBy: { startTime: 'asc' },
    });

    const dtos: ScheduleBlockDto[] = blocks.map((b) => ({
      id: b.id,
      userId: b.userId,
      taskId: b.taskId ?? undefined,
      title: b.title,
      startTime: b.startTime.toISOString(),
      endTime: b.endTime.toISOString(),
      isLocked: b.isLocked,
      type: b.type as ScheduleBlockDto['type'],
    }));

    res.json(dtos);
  } catch (error) {
    next(error);
  }
});

// POST /api/schedule/ripple-reschedule
scheduleRouter.post(
  '/ripple-reschedule',
  validateBody(RippleRescheduleSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const userId = req.user!.id;
      const data = req.body;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const dayEndHour = user?.workHourEnd ?? '17:00';

      // Load all blocks for today
      const today = new Date().toISOString().split('T')[0];
      const blocks = await prisma.scheduleBlock.findMany({
        where: {
          userId,
          startTime: {
            gte: new Date(`${today}T00:00:00.000Z`),
            lte: new Date(`${today}T23:59:59.999Z`),
          },
        },
        orderBy: { startTime: 'asc' },
      });

      const blockDtos: ScheduleBlockDto[] = blocks.map((b) => ({
        id: b.id,
        userId: b.userId,
        taskId: b.taskId ?? undefined,
        title: b.title,
        startTime: b.startTime.toISOString(),
        endTime: b.endTime.toISOString(),
        isLocked: b.isLocked,
        type: b.type as ScheduleBlockType,
      }));

      const result = rescheduleEngine.calculateRippleShift(data, blockDtos, dayEndHour);

      // Persist shifts in a transaction
      if (result.success && result.shiftedTasks.length > 0) {
        await prisma.$transaction(async (tx) => {
          for (const shift of result.shiftedTasks) {
            await tx.scheduleBlock.updateMany({
              where: { userId, taskId: shift.taskId },
              data: {
                startTime: new Date(shift.newStartTime),
                endTime: new Date(shift.newEndTime),
              },
            });
            await tx.task.update({
              where: { id: shift.taskId },
              data: {
                scheduledStart: new Date(shift.newStartTime),
                scheduledEnd: new Date(shift.newEndTime),
              },
            });
          }

          await tx.rescheduleLog.create({
            data: {
              userId,
              delayedTaskId: data.delayedTaskId,
              delayMinutes: data.delayMinutes,
              tasksShifted: result.shiftedTasks.length,
              reason: data.reason,
            },
          });
        });
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/capacity/daily?date=YYYY-MM-DD
scheduleRouter.get('/capacity/daily', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const capacityMinutes = user?.dailyCapacityMinutes ?? 480;

    const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
    const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        scheduledStart: { gte: dayStart, lte: dayEnd },
      },
    });

    const allocatedMinutes = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);
    const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

    const summary = workloadEngine.calculateWorkload(
      dateStr,
      allocatedMinutes,
      capacityMinutes,
      tasks.length,
      completedCount
    );

    res.json(summary);
  } catch (error) {
    next(error);
  }
});
