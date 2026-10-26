import { Router, Response, NextFunction } from 'express';
import { prisma, ScheduleBlockType, TaskStatus, CapacityStatus } from '@focient/database';
import {
  RippleRescheduleSchema,
  AutoScheduleRequestSchema,
  ApplyRescheduleSchema,
  BatchApplyRescheduleSchema,
  ScheduleBlockDto,
  TaskResponseDto,
  TodayPlanDto,
  CapacityProfileDto,
} from '@focient/contracts';
import { validateBody } from '../../middleware/validate.middleware.js';
import { authenticate, AuthenticatedRequest } from '../auth/auth.middleware.js';
import { adaptiveRescheduleEngine as rescheduleEngine } from '../../engine/adaptive-reschedule.engine.js';
import { workloadEngine } from '../../engine/workload.engine.js';
import { silentPlacementEngine as taskPlacementEngine } from '../../engine/silent-placement.engine.js';
import { top3PrioritiesEngine } from '../../engine/top3-priorities.engine.js';
import { formatTask } from '../task/task.controller.js';
import { NotFoundError } from '../../common/errors.js';

export const scheduleRouter = Router();

scheduleRouter.use(authenticate);

async function recalculateCapacity(userId: string, dateStr: string) {
  const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
  const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const maxDailyMinutes = Math.round((user?.workHoursLimit ?? 8) * 60);

  const dayTasks = await prisma.task.findMany({
    where: {
      userId,
      status: { not: TaskStatus.COMPLETED },
      OR: [
        { targetDate: { gte: dayStart, lte: dayEnd } },
        { scheduledStart: { gte: dayStart, lte: dayEnd } },
        { startTime: { gte: dayStart, lte: dayEnd } },
      ],
    },
  });

  const allocatedMinutes = dayTasks.reduce((sum, t) => sum + t.durationMinutes, 0);
  const workload = workloadEngine.calculateWorkload(
    dateStr,
    allocatedMinutes,
    maxDailyMinutes,
    dayTasks.length,
    0
  );

  return prisma.workloadDaily.upsert({
    where: { userId_date: { userId, date: dateStr } },
    update: {
      allocatedMinutes,
      capacityPercentage: workload.percentage,
      status: workload.status as CapacityStatus,
      isOverloaded: workload.isOverloaded,
      targetDate: dayStart,
    },
    create: {
      userId,
      date: dateStr,
      targetDate: dayStart,
      maxDailyMinutes,
      capacityMinutes: maxDailyMinutes,
      allocatedMinutes,
      capacityPercentage: workload.percentage,
      status: workload.status as CapacityStatus,
      isOverloaded: workload.isOverloaded,
    },
  });
}

/**
 * Proses 4.0: Aggregates Today Plan:
 * - timelineSchedule (ordered tasks with start time)
 * - unscheduledTasks (backlog without start time)
 * - top3Priorities (Top 3 priorities selection)
 * - capacityProfile (D4: user_capacities)
 * - adaptiveBanner (overload or trigger warning)
 */
async function handleTodayPlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
    const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const maxDailyMinutes = Math.round((user?.workHoursLimit ?? 8) * 60);

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        OR: [
          { targetDate: { gte: dayStart, lte: dayEnd } },
          { scheduledStart: { gte: dayStart, lte: dayEnd } },
          { startTime: { gte: dayStart, lte: dayEnd } },
          { createdAt: { gte: dayStart, lte: dayEnd } },
        ],
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    });

    const formattedTasks = tasks.map(formatTask);

    const timelineSchedule = formattedTasks
      .filter((t) => Boolean(t.startTime || t.scheduledStart))
      .sort((a, b) => {
        const timeA = new Date(a.startTime || a.scheduledStart!).getTime();
        const timeB = new Date(b.startTime || b.scheduledStart!).getTime();
        return timeA - timeB;
      });

    const unscheduledTasks = formattedTasks.filter(
      (t) => !t.startTime && !t.scheduledStart && t.status !== TaskStatus.COMPLETED
    );

    const top3Priorities = top3PrioritiesEngine.selectTop3(formattedTasks);

    const activeTasks = tasks.filter((t) => t.status !== TaskStatus.COMPLETED);
    const allocatedMinutes = activeTasks.reduce((sum, t) => sum + t.durationMinutes, 0);
    const completedCount = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;

    const workload = workloadEngine.calculateWorkload(
      dateStr,
      allocatedMinutes,
      maxDailyMinutes,
      tasks.length,
      completedCount
    );

    const capacityRecord = await prisma.workloadDaily.upsert({
      where: { userId_date: { userId, date: dateStr } },
      update: {
        allocatedMinutes,
        capacityPercentage: workload.percentage,
        status: workload.status as CapacityStatus,
        isOverloaded: workload.isOverloaded,
        targetDate: dayStart,
      },
      create: {
        userId,
        date: dateStr,
        targetDate: dayStart,
        maxDailyMinutes,
        capacityMinutes: maxDailyMinutes,
        allocatedMinutes,
        capacityPercentage: workload.percentage,
        status: workload.status as CapacityStatus,
        isOverloaded: workload.isOverloaded,
      },
    });

    const capacityProfile: CapacityProfileDto = {
      id: capacityRecord.id,
      userId,
      targetDate: dateStr,
      maxDailyMinutes,
      allocatedMinutes,
      capacityPercentage: workload.percentage,
      status: workload.status,
      isOverloaded: workload.isOverloaded,
    };

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

    const triggerAssessment = rescheduleEngine.evaluateRescheduleTriggers(
      timelineSchedule,
      blockDtos,
      new Date(),
      workload.percentage
    );

    let adaptiveBanner: TodayPlanDto['adaptiveBanner'] = {
      shouldAlert: false,
      severity: 'INFO',
      title: 'Ritme Fokus Terjaga',
      message: 'Jadwal kerjamu seimbang dan optimal.',
    };

    if (workload.isOverloaded) {
      adaptiveBanner = {
        shouldAlert: true,
        severity: 'WARNING',
        title: 'Kapasitas Hari Ini Hampir Penuh',
        message:
          'Beban kerja melebihi 90% kapasitas idealmu. Pertimbangkan untuk memindahkan tugas reguler ke esok hari demi menjaga kualitas fokus.',
      };
    } else if (triggerAssessment.needsAdjustment) {
      adaptiveBanner = {
        shouldAlert: true,
        severity: 'WARNING',
        title: 'Perlu Penyesuaian Jadwal',
        message: triggerAssessment.message,
      };
    }

    const response: TodayPlanDto = {
      date: dateStr,
      timelineSchedule,
      unscheduledTasks,
      top3Priorities,
      capacityProfile,
      adaptiveBanner,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

// GET /api/schedule/today-plan
scheduleRouter.get('/today-plan', handleTodayPlan);

// GET /api/schedule?date=YYYY-MM-DD
scheduleRouter.get('/', async (req: AuthenticatedRequest, res: Response, next) => {
  if (req.baseUrl.includes('today-plan')) {
    return handleTodayPlan(req, res, next);
  }

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

// POST /api/schedule/apply-reschedule (Proses 3.0: Guilt-Free Adaptive Shift & D6 Audit Log)
scheduleRouter.post(
  '/apply-reschedule',
  validateBody(ApplyRescheduleSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const userId = req.user!.id;
      const { taskId, suggestedStartTime, reasonMessage } = req.body;

      const task = await prisma.task.findFirst({
        where: { id: taskId, userId },
      });

      if (!task) {
        throw new NotFoundError('Tugas tidak ditemukan.');
      }

      const previousStartTime = task.startTime || task.scheduledStart;
      const previousDateStr = previousStartTime
        ? previousStartTime.toISOString().split('T')[0]
        : task.targetDate?.toISOString().split('T')[0];

      const newStartTime = new Date(suggestedStartTime);
      const newEndTime = new Date(newStartTime.getTime() + task.durationMinutes * 60000);
      const targetDateStr = suggestedStartTime.split('T')[0];
      const newTargetDate = new Date(`${targetDateStr}T00:00:00.000Z`);

      const result = await prisma.$transaction(async (tx) => {
        const updatedTask = await tx.task.update({
          where: { id: task.id },
          data: {
            startTime: newStartTime,
            scheduledStart: newStartTime,
            scheduledEnd: newEndTime,
            targetDate: newTargetDate,
            status: task.status === TaskStatus.NEEDS_ADJUSTMENT ? TaskStatus.TODO : task.status,
          },
        });

        const existingBlock = await tx.scheduleBlock.findFirst({
          where: { userId, taskId: task.id },
        });

        if (existingBlock) {
          await tx.scheduleBlock.update({
            where: { id: existingBlock.id },
            data: {
              startTime: newStartTime,
              endTime: newEndTime,
            },
          });
        } else {
          await tx.scheduleBlock.create({
            data: {
              userId,
              taskId: task.id,
              title: task.title,
              startTime: newStartTime,
              endTime: newEndTime,
              isLocked: false,
              type: ScheduleBlockType.TASK,
            },
          });
        }

        const auditLog = await tx.rescheduleAuditLog.create({
          data: {
            taskId: task.id,
            userId,
            previousStartTime: previousStartTime ?? null,
            newStartTime,
            reasonMessage: reasonMessage || 'Penyesuaian adaptif waktu pengerjaan tugas.',
            appliedAt: new Date(),
          },
        });

        return { updatedTask, auditLog };
      });

      // Recalculate capacity on affected dates
      await recalculateCapacity(userId, targetDateStr);
      if (previousDateStr && previousDateStr !== targetDateStr) {
        await recalculateCapacity(userId, previousDateStr);
      }

      res.json({
        success: true,
        message: 'Jadwal tugas berhasil disesuaikan dengan tenang.',
        task: formatTask(result.updatedTask),
        auditLog: {
          id: result.auditLog.id,
          taskId: result.auditLog.taskId,
          userId: result.auditLog.userId,
          previousStartTime: result.auditLog.previousStartTime?.toISOString(),
          newStartTime: result.auditLog.newStartTime?.toISOString(),
          reasonMessage: result.auditLog.reasonMessage ?? undefined,
          appliedAt: result.auditLog.appliedAt.toISOString(),
          createdAt: result.auditLog.createdAt.toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/schedule/batch-apply-reschedule (Proses 3.0: Ripple Shift Confirmation & D6 Batch Audit Logs)
scheduleRouter.post(
  '/batch-apply-reschedule',
  validateBody(BatchApplyRescheduleSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const userId = req.user!.id;
      const { shifts } = req.body;

      const shiftedTaskIds = shifts.map((s: { taskId: string }) => s.taskId);
      const tasks = await prisma.task.findMany({
        where: { id: { in: shiftedTaskIds }, userId },
      });
      const taskMap = new Map(tasks.map((t) => [t.id, t]));

      const affectedDates = new Set<string>();

      const transactionResults = await prisma.$transaction(async (tx) => {
        const updatedTasks = [];
        const auditLogs = [];

        for (const shift of shifts) {
          const task = taskMap.get(shift.taskId);
          if (!task) continue;

          const previousStartTime = task.startTime || task.scheduledStart;
          const prevDateStr = previousStartTime
            ? previousStartTime.toISOString().split('T')[0]
            : task.targetDate?.toISOString().split('T')[0];
          if (prevDateStr) affectedDates.add(prevDateStr);

          const newStartTime = new Date(shift.suggestedStartTime);
          const newEndTime = new Date(newStartTime.getTime() + task.durationMinutes * 60000);
          const targetDateStr = shift.suggestedStartTime.split('T')[0];
          affectedDates.add(targetDateStr);

          const newTargetDate = new Date(`${targetDateStr}T00:00:00.000Z`);

          const updated = await tx.task.update({
            where: { id: task.id },
            data: {
              startTime: newStartTime,
              scheduledStart: newStartTime,
              scheduledEnd: newEndTime,
              targetDate: newTargetDate,
              status: task.status === TaskStatus.NEEDS_ADJUSTMENT ? TaskStatus.TODO : task.status,
            },
          });
          updatedTasks.push(updated);

          const existingBlock = await tx.scheduleBlock.findFirst({
            where: { userId, taskId: task.id },
          });

          if (existingBlock) {
            await tx.scheduleBlock.update({
              where: { id: existingBlock.id },
              data: {
                startTime: newStartTime,
                endTime: newEndTime,
              },
            });
          } else {
            await tx.scheduleBlock.create({
              data: {
                userId,
                taskId: task.id,
                title: task.title,
                startTime: newStartTime,
                endTime: newEndTime,
                isLocked: false,
                type: ScheduleBlockType.TASK,
              },
            });
          }

          const audit = await tx.rescheduleAuditLog.create({
            data: {
              taskId: task.id,
              userId,
              previousStartTime: previousStartTime ?? null,
              newStartTime,
              reasonMessage: shift.reasonMessage || 'Penyesuaian jadwal beruntun (ripple reschedule).',
              appliedAt: new Date(),
            },
          });
          auditLogs.push(audit);
        }

        return { updatedTasks, auditLogs };
      });

      // Recalculate capacity on all affected dates
      for (const dStr of affectedDates) {
        await recalculateCapacity(userId, dStr);
      }

      res.json({
        success: true,
        message: `${transactionResults.updatedTasks.length} jadwal tugas berhasil disesuaikan secara adaptif.`,
        tasks: transactionResults.updatedTasks.map(formatTask),
        auditLogs: transactionResults.auditLogs.map((a) => ({
          id: a.id,
          taskId: a.taskId,
          userId: a.userId,
          previousStartTime: a.previousStartTime?.toISOString(),
          newStartTime: a.newStartTime?.toISOString(),
          reasonMessage: a.reasonMessage ?? undefined,
          appliedAt: a.appliedAt.toISOString(),
          createdAt: a.createdAt.toISOString(),
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

