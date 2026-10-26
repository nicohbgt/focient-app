import { Router, Response } from 'express';
import { prisma, ScheduleBlockType, TaskStatus } from '@focient/database';
import {
  RippleRescheduleSchema,
  AutoScheduleRequestSchema,
  ScheduleBlockDto,
  TaskResponseDto,
} from '@focient/contracts';
import { validateBody } from '../../middleware/validate.middleware.js';
import { authenticate, AuthenticatedRequest } from '../auth/auth.middleware.js';
import { adaptiveRescheduleEngine as rescheduleEngine } from '../../engine/adaptive-reschedule.engine.js';
import { workloadEngine } from '../../engine/workload.engine.js';
import { silentPlacementEngine as taskPlacementEngine } from '../../engine/silent-placement.engine.js';
import { NotFoundError } from '../../common/errors.js';

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

// POST /api/schedule/auto-schedule
scheduleRouter.post(
  '/auto-schedule',
  validateBody(AutoScheduleRequestSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const userId = req.user!.id;
      const { date, preferredBufferMinutes } = req.body;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const workHourStart = user?.workHourStart ?? '09:00';
      const workHourEnd = user?.workHourEnd ?? '17:00';

      const dayStart = new Date(`${date}T00:00:00.000Z`);
      const dayEnd = new Date(`${date}T23:59:59.999Z`);

      // Load existing blocks for the target date
      const existingBlocks = await prisma.scheduleBlock.findMany({
        where: {
          userId,
          startTime: { gte: dayStart, lte: dayEnd },
        },
        orderBy: { startTime: 'asc' },
      });

      const existingBlockDtos: ScheduleBlockDto[] = existingBlocks.map((b) => ({
        id: b.id,
        userId: b.userId,
        taskId: b.taskId ?? undefined,
        title: b.title,
        startTime: b.startTime.toISOString(),
        endTime: b.endTime.toISOString(),
        isLocked: b.isLocked,
        type: b.type as ScheduleBlockDto['type'],
      }));

      // Load active unscheduled tasks or tasks without a block on this date
      const scheduledTaskIds = existingBlocks
        .map((b) => b.taskId)
        .filter((id): id is string => Boolean(id));

      const tasksToSchedule = await prisma.task.findMany({
        where: {
          userId,
          status: { not: TaskStatus.COMPLETED },
          id: { notIn: scheduledTaskIds },
        },
        orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
      });

      const taskDtos: TaskResponseDto[] = tasksToSchedule.map((t) => ({
        id: t.id,
        userId: t.userId,
        title: t.title,
        notes: t.notes ?? undefined,
        durationMinutes: t.durationMinutes,
        priority: t.priority as TaskResponseDto['priority'],
        status: t.status as TaskResponseDto['status'],
        deadline: t.deadline?.toISOString(),
        category: t.category ?? undefined,
        scheduledStart: t.scheduledStart?.toISOString(),
        scheduledEnd: t.scheduledEnd?.toISOString(),
        completedAt: t.completedAt?.toISOString(),
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }));

      const placementResult = taskPlacementEngine.batchPlaceTasks(
        taskDtos,
        existingBlockDtos,
        date,
        {
          workHourStart,
          workHourEnd,
          bufferMinutes: preferredBufferMinutes ?? 10,
        }
      );

      // Persist placed blocks in a transaction
      if (placementResult.placed.length > 0) {
        await prisma.$transaction(async (tx) => {
          for (const item of placementResult.placed) {
            await tx.scheduleBlock.create({
              data: {
                userId,
                taskId: item.task.id,
                title: item.task.title,
                startTime: item.slot.start,
                endTime: item.slot.end,
                type: ScheduleBlockType.TASK,
                isLocked: false,
              },
            });

            await tx.task.update({
              where: { id: item.task.id },
              data: {
                scheduledStart: item.slot.start,
                scheduledEnd: item.slot.end,
              },
            });
          }
        });
      }

      res.json({
        success: true,
        message:
          placementResult.unplaced.length === 0
            ? 'Seluruh tugas berhasil dijadwalkan secara otomatis ke dalam linimasa.'
            : `Berhasil menempatkan ${placementResult.placed.length} tugas. Sisa ${placementResult.unplaced.length} tugas dialokasikan ke antrean berikutnya tanpa penalti.`,
        date,
        placedCount: placementResult.placed.length,
        unplacedCount: placementResult.unplaced.length,
        totalPlacedMinutes: placementResult.totalPlacedMinutes,
        placedTasks: placementResult.placed.map((p: { task: TaskResponseDto; slot: { start: Date; end: Date } }) => ({
          taskId: p.task.id,
          title: p.task.title,
          startTime: p.slot.start.toISOString(),
          endTime: p.slot.end.toISOString(),
          durationMinutes: p.task.durationMinutes,
        })),
        unplacedTasks: placementResult.unplaced.map((u: TaskResponseDto) => ({
          taskId: u.id,
          title: u.title,
          durationMinutes: u.durationMinutes,
          priority: u.priority,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/schedule/auto-place/:taskId
scheduleRouter.post(
  '/auto-place/:taskId',
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const userId = req.user!.id;
      const { taskId } = req.params;
      const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];

      const task = await prisma.task.findFirst({
        where: { id: taskId, userId },
      });

      if (!task) {
        throw new NotFoundError('Tugas tidak ditemukan.');
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const workHourStart = user?.workHourStart ?? '09:00';
      const workHourEnd = user?.workHourEnd ?? '17:00';

      const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
      const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

      const blocks = await prisma.scheduleBlock.findMany({
        where: {
          userId,
          startTime: { gte: dayStart, lte: dayEnd },
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
        type: b.type as ScheduleBlockDto['type'],
      }));

      const slot = taskPlacementEngine.findNextAvailableSlot(
        { durationMinutes: task.durationMinutes },
        blockDtos,
        dateStr,
        workHourStart,
        workHourEnd,
        10
      );

      if (!slot) {
        res.status(200).json({
          success: false,
          message:
            'Kapasitas jam kerja hari ini telah penuh. Tugas dapat dialokasikan ke esok hari dengan tenang.',
          placed: false,
        });
        return;
      }

      const [newBlock, updatedTask] = await prisma.$transaction([
        prisma.scheduleBlock.create({
          data: {
            userId,
            taskId: task.id,
            title: task.title,
            startTime: slot.start,
            endTime: slot.end,
            type: ScheduleBlockType.TASK,
            isLocked: false,
          },
        }),
        prisma.task.update({
          where: { id: task.id },
          data: {
            scheduledStart: slot.start,
            scheduledEnd: slot.end,
          },
        }),
      ]);

      res.status(201).json({
        success: true,
        message: 'Tugas berhasil ditempatkan pada slot waktu terbaik.',
        placed: true,
        block: {
          id: newBlock.id,
          taskId: newBlock.taskId,
          title: newBlock.title,
          startTime: newBlock.startTime.toISOString(),
          endTime: newBlock.endTime.toISOString(),
        },
        task: {
          id: updatedTask.id,
          title: updatedTask.title,
          scheduledStart: updatedTask.scheduledStart?.toISOString(),
          scheduledEnd: updatedTask.scheduledEnd?.toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/schedule/triggers
scheduleRouter.get('/triggers', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
    const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

    const [tasks, blocks, user] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          scheduledStart: { gte: dayStart, lte: dayEnd },
        },
      }),
      prisma.scheduleBlock.findMany({
        where: {
          userId,
          startTime: { gte: dayStart, lte: dayEnd },
        },
        orderBy: { startTime: 'asc' },
      }),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);

    const taskDtos: TaskResponseDto[] = tasks.map((t) => ({
      id: t.id,
      userId: t.userId,
      title: t.title,
      notes: t.notes ?? undefined,
      durationMinutes: t.durationMinutes,
      priority: t.priority as TaskResponseDto['priority'],
      status: t.status as TaskResponseDto['status'],
      deadline: t.deadline?.toISOString(),
      category: t.category ?? undefined,
      scheduledStart: t.scheduledStart?.toISOString(),
      scheduledEnd: t.scheduledEnd?.toISOString(),
      completedAt: t.completedAt?.toISOString(),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

    const blockDtos: ScheduleBlockDto[] = blocks.map((b) => ({
      id: b.id,
      userId: b.userId,
      taskId: b.taskId ?? undefined,
      title: b.title,
      startTime: b.startTime.toISOString(),
      endTime: b.endTime.toISOString(),
      isLocked: b.isLocked,
      type: b.type as ScheduleBlockDto['type'],
    }));

    const capacityMinutes = user?.dailyCapacityMinutes ?? 480;
    const allocatedMinutes = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);
    const workloadPercentage = Math.round((allocatedMinutes / Math.max(1, capacityMinutes)) * 100);

    const assessment = rescheduleEngine.evaluateRescheduleTriggers(
      taskDtos,
      blockDtos,
      new Date(),
      workloadPercentage
    );

    // If there are half-duration breached tasks still in TODO, update status to NEEDS_ADJUSTMENT
    if (assessment.breachedTaskIds.length > 0) {
      await prisma.task.updateMany({
        where: {
          id: { in: assessment.breachedTaskIds },
          status: TaskStatus.TODO,
        },
        data: {
          status: TaskStatus.NEEDS_ADJUSTMENT,
        },
      });
    }

    res.json(assessment);
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

      // Load all blocks and tasks for today
      const today = new Date().toISOString().split('T')[0];
      const [blocks, tasks] = await Promise.all([
        prisma.scheduleBlock.findMany({
          where: {
            userId,
            startTime: {
              gte: new Date(`${today}T00:00:00.000Z`),
              lte: new Date(`${today}T23:59:59.999Z`),
            },
          },
          orderBy: { startTime: 'asc' },
        }),
        prisma.task.findMany({
          where: {
            userId,
            scheduledStart: {
              gte: new Date(`${today}T00:00:00.000Z`),
              lte: new Date(`${today}T23:59:59.999Z`),
            },
          },
        }),
      ]);

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

      const taskDtos: TaskResponseDto[] = tasks.map((t) => ({
        id: t.id,
        userId: t.userId,
        title: t.title,
        durationMinutes: t.durationMinutes,
        priority: t.priority as TaskResponseDto['priority'],
        status: t.status as TaskResponseDto['status'],
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }));

      const result = rescheduleEngine.calculateRippleShift(data, blockDtos, dayEndHour, taskDtos);

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

          // If regular tasks were deferred to next day, unassign or mark as NEEDS_ADJUSTMENT
          if (result.deferredTasks && result.deferredTasks.length > 0) {
            for (const deferred of result.deferredTasks) {
              await tx.task.update({
                where: { id: deferred.taskId },
                data: {
                  status: TaskStatus.NEEDS_ADJUSTMENT,
                },
              });
            }
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

    const alert = workloadEngine.getOverloadAlert(summary);

    res.json({
      ...summary,
      alert,
    });
  } catch (error) {
    next(error);
  }
});

