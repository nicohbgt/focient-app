import { Router, Response } from 'express';
import { prisma, TaskPriority, TaskStatus, ScheduleBlockType, CapacityStatus } from '@focient/database';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  TaskFilterSchema,
  TaskResponseDto,
  MarkTaskCompleteSchema,
  VALIDATION_MESSAGES,
} from '@focient/contracts';
import { validateBody, validateQuery } from '../../middleware/validate.middleware.js';
import { authenticate, AuthenticatedRequest } from '../auth/auth.middleware.js';
import { NotFoundError, ValidationError } from '../../common/errors.js';
import { top3PrioritiesEngine } from '../../engine/top3-priorities.engine.js';
import { workloadEngine } from '../../engine/workload.engine.js';
import { silentPlacementEngine } from '../../engine/silent-placement.engine.js';
import { adaptiveRescheduleEngine } from '../../engine/adaptive-reschedule.engine.js';

export const taskRouter = Router();

taskRouter.use(authenticate);

// GET /api/tasks
taskRouter.get('/', validateQuery(TaskFilterSchema), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { status, priority, isFocusTop3, date } = req.query as {
      status?: TaskStatus;
      priority?: TaskPriority;
      isFocusTop3?: boolean;
      date?: string;
    };

    let dateFilter = {};
    if (date) {
      const dayStart = new Date(`${date}T00:00:00.000Z`);
      const dayEnd = new Date(`${date}T23:59:59.999Z`);
      dateFilter = {
        OR: [
          { targetDate: { gte: dayStart, lte: dayEnd } },
          { scheduledStart: { gte: dayStart, lte: dayEnd } },
          { startTime: { gte: dayStart, lte: dayEnd } },
        ],
      };
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...dateFilter,
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    });

    const dtos: TaskResponseDto[] = tasks.map(formatTask);

    if (isFocusTop3) {
      res.json(top3PrioritiesEngine.selectTop3(dtos));
      return;
    }

    res.json(dtos);
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/top-3
taskRouter.get('/top-3', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const tasks = await prisma.task.findMany({
      where: { userId, status: { not: TaskStatus.COMPLETED } },
      orderBy: { createdAt: 'desc' },
    });

    const top3 = top3PrioritiesEngine.selectTop3(tasks.map(formatTask));
    res.json(top3);
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/:id (Fetch task detail)
taskRouter.get('/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, userId },
      include: { categoryRef: true },
    });

    if (!task) {
      throw new NotFoundError('Tugas tidak ditemukan');
    }

    res.json(formatTask(task));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tasks (Proses 2.0: Quick Add Task with Activity Diagram Decision Flow)
 *
 * 1. User inputs Quick Add Task
 * 2. Evaluates daily workload:
 *    - If <= 90%: SilentPlacementEngine places task into first-fit gap + 10m buffer.
 *    - If > 90% (Overload): AdaptiveRescheduleEngine prepares ripple shift proposal & amber banner.
 * 3. Enforces Top 3 Priorities Rule & optional swap.
 * 4. Persists to D3 (tasks) and updates D4 (user_capacities).
 */
taskRouter.post('/', validateBody(CreateTaskSchema), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const data = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const capacityMinutes = user?.dailyCapacityMinutes ?? 480;
    const workHourStart = user?.startWorkTime ?? user?.workHourStart ?? '09:00';
    const workHourEnd = user?.endWorkTime ?? user?.workHourEnd ?? '17:00';

    const targetDateStr = data.targetDate || (data.startTime ? data.startTime.split('T')[0] : new Date().toISOString().split('T')[0]);
    const dayStart = new Date(`${targetDateStr}T00:00:00.000Z`);
    const dayEnd = new Date(`${targetDateStr}T23:59:59.999Z`);

    // Top-3 Priority Quota & Swap Check
    if (data.priority === 'TOP_3') {
      if (data.swapWithTaskId) {
        await prisma.task.updateMany({
          where: { id: data.swapWithTaskId, userId },
          data: { priority: TaskPriority.REGULAR },
        });
      } else {
        const activeTop3Tasks = await prisma.task.findMany({
          where: {
            userId,
            priority: TaskPriority.TOP_3,
            status: { not: TaskStatus.COMPLETED },
          },
          select: { id: true, title: true, durationMinutes: true, category: true },
        });

        if (activeTop3Tasks.length >= 3) {
          throw new ValidationError(VALIDATION_MESSAGES.id.taskTop3Quota, {
            canSwap: true,
            activeTop3Tasks,
          });
        }
      }
    }

    // Hitung Alokasi Jam & Kapasitas (WorkloadEngine)
    const existingDayTasks = await prisma.task.findMany({
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

    const currentAllocatedMinutes = existingDayTasks.reduce((sum, t) => sum + t.durationMinutes, 0);
    const newAllocatedMinutes = currentAllocatedMinutes + data.durationMinutes;

    const workload = workloadEngine.calculateWorkload(
      targetDateStr,
      newAllocatedMinutes,
      capacityMinutes,
      existingDayTasks.length + 1,
      0
    );

    let finalStartTime: Date | null = data.startTime ? new Date(data.startTime) : (data.scheduledStart ? new Date(data.scheduledStart) : null);
    let finalEndTime: Date | null = null;
    let placedAutomatically = false;

    // Decision Diamond: [Kapasitas Overload? (> 90%)]
    if (!workload.isOverloaded) {
      // Kondisi 1: Tidak Overload (<= 90%) -> Picu SilentPlacementEngine
      if (!finalStartTime) {
        const blocks = await prisma.scheduleBlock.findMany({
          where: {
            userId,
            startTime: { gte: dayStart, lte: dayEnd },
          },
          orderBy: { startTime: 'asc' },
        });

        const blockDtos = blocks.map((b) => ({
          id: b.id,
          userId: b.userId,
          taskId: b.taskId ?? undefined,
          title: b.title,
          startTime: b.startTime.toISOString(),
          endTime: b.endTime.toISOString(),
          isLocked: b.isLocked,
          type: b.type as ScheduleBlockType,
        }));

        const slot = silentPlacementEngine.findNextAvailableSlot(
          { durationMinutes: data.durationMinutes },
          blockDtos,
          targetDateStr,
          workHourStart,
          workHourEnd,
          10
        );

        if (slot) {
          finalStartTime = slot.start;
          finalEndTime = slot.end;
          placedAutomatically = true;
        }
      } else {
        finalEndTime = new Date(finalStartTime.getTime() + data.durationMinutes * 60000);
      }
    } else {
      // Kondisi 2: Terdeteksi Overload (> 90%) -> Peringatan ramah tanpa status merah
      if (!finalStartTime) {
        // Disimpan sebagai Unscheduled Task untuk perlindungan fokus
        finalStartTime = null;
        finalEndTime = null;
      } else {
        finalEndTime = new Date(finalStartTime.getTime() + data.durationMinutes * 60000);
      }
    }

    // Simpan Tugas ke D3: tasks
    const task = await prisma.task.create({
      data: {
        userId,
        title: data.title,
        notes: data.notes,
        durationMinutes: data.durationMinutes,
        priority: (data.priority as TaskPriority) ?? TaskPriority.REGULAR,
        energyLevel: (data.energyLevel as any) ?? 'MEDIUM',
        categoryId: data.categoryId,
        category: data.category,
        targetDate: dayStart,
        startTime: finalStartTime,
        scheduledStart: finalStartTime,
        scheduledEnd: finalEndTime,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        focusType: data.focusType ?? (data.energyLevel === 'HIGH' ? 'Deep Focus' : data.energyLevel === 'LOW' ? 'Light' : 'Medium'),
        restMinutes: data.restMinutes ?? 10,
        needRestAfter: data.needRestAfter ?? true,
        isBacklog: data.isBacklog ?? false,
        categoryName: data.categoryName ?? data.category ?? 'Strategic',
        categoryColor: data.categoryColor ?? '#7C3AED',
        dateDisplay: data.dateDisplay,
        startHourDisplay: data.startHourDisplay,
      },
    });

    // Buat ScheduleBlock jika memiliki startTime
    if (finalStartTime && finalEndTime) {
      await prisma.scheduleBlock.create({
        data: {
          userId,
          taskId: task.id,
          title: task.title,
          startTime: finalStartTime,
          endTime: finalEndTime,
          isLocked: false,
          type: ScheduleBlockType.TASK,
        },
      });
    }

    // Perbarui D4: user_capacities
    await prisma.workloadDaily.upsert({
      where: { userId_date: { userId, date: targetDateStr } },
      update: {
        allocatedMinutes: newAllocatedMinutes,
        capacityPercentage: workload.percentage,
        status: workload.status as CapacityStatus,
        isOverloaded: workload.isOverloaded,
        targetDate: dayStart,
      },
      create: {
        userId,
        date: targetDateStr,
        targetDate: dayStart,
        maxDailyMinutes: capacityMinutes,
        capacityMinutes,
        allocatedMinutes: newAllocatedMinutes,
        capacityPercentage: workload.percentage,
        status: workload.status as CapacityStatus,
        isOverloaded: workload.isOverloaded,
      },
    });

    const amberBanner = workloadEngine.getOverloadAlert(workload);

    res.status(201).json({
      ...formatTask(task),
      placedAutomatically,
      capacity: workload,
      amberBanner: amberBanner.shouldAlert ? amberBanner : undefined,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/:id
taskRouter.get('/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, userId },
    });

    if (!task) {
      throw new NotFoundError('Tugas tidak ditemukan');
    }

    res.json(formatTask(task));
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks/:id/complete (Proses 4.0: Centang Selesai & Activity Log)
taskRouter.post(
  '/:id/complete',
  validateBody(MarkTaskCompleteSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const data = req.body;

      const task = await prisma.task.findFirst({
        where: { id, userId },
      });

      if (!task) {
        throw new NotFoundError('Tugas tidak ditemukan');
      }

      const completedAtDate = data.completedAt ? new Date(data.completedAt) : new Date();
      const actualDuration = data.actualDurationMinutes ?? task.durationMinutes;

      // 1. Update task status ke COMPLETED
      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          status: TaskStatus.COMPLETED,
          completedAt: completedAtDate,
        },
      });

      // 2. Catat riwayat aktivitas ke D5: activity_logs
      const activityLog = await prisma.activityLog.create({
        data: {
          taskId: task.id,
          userId,
          actualDurationMinutes: actualDuration,
          energyLevel: (data.energyLevelAtCompletion as any) || task.energyLevel || undefined,
          moodRating: data.moodRating,
          reflectionNotes: data.reflectionNotes,
          completedAt: completedAtDate,
        },
      });

      // 3. Perbarui sisa beban kerja di D4: user_capacities
      const todayStr = completedAtDate.toISOString().split('T')[0];
      const dayStart = new Date(`${todayStr}T00:00:00.000Z`);
      const dayEnd = new Date(`${todayStr}T23:59:59.999Z`);

      const remainingTasks = await prisma.task.findMany({
        where: {
          userId,
          status: { not: TaskStatus.COMPLETED },
          OR: [
            { targetDate: { gte: dayStart, lte: dayEnd } },
            { scheduledStart: { gte: dayStart, lte: dayEnd } },
          ],
        },
      });

      const remainingAllocated = remainingTasks.reduce((sum, t) => sum + t.durationMinutes, 0);
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const capacityMinutes = user?.dailyCapacityMinutes ?? 480;

      const updatedWorkload = workloadEngine.calculateWorkload(
        todayStr,
        remainingAllocated,
        capacityMinutes,
        remainingTasks.length,
        1
      );

      await prisma.workloadDaily.upsert({
        where: { userId_date: { userId, date: todayStr } },
        update: {
          allocatedMinutes: remainingAllocated,
          capacityPercentage: updatedWorkload.percentage,
          status: updatedWorkload.status as CapacityStatus,
          isOverloaded: updatedWorkload.isOverloaded,
        },
        create: {
          userId,
          date: todayStr,
          targetDate: dayStart,
          maxDailyMinutes: capacityMinutes,
          capacityMinutes,
          allocatedMinutes: remainingAllocated,
          capacityPercentage: updatedWorkload.percentage,
          status: updatedWorkload.status as CapacityStatus,
          isOverloaded: updatedWorkload.isOverloaded,
        },
      });

      res.json({
        task: formatTask(updatedTask),
        activityLog: {
          id: activityLog.id,
          actualDurationMinutes: activityLog.actualDurationMinutes,
          completedAt: activityLog.completedAt.toISOString(),
        },
        capacityProfile: updatedWorkload,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/tasks/:id
taskRouter.patch('/:id', validateBody(UpdateTaskSchema), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, userId },
    });

    if (!existing) {
      throw new NotFoundError('Tugas tidak ditemukan');
    }

    const data = req.body;

    // Enforce Top-3 Priorities Rule on status or priority update with optional swap
    const isTargetingTop3 =
      data.priority === 'TOP_3' || (data.priority === undefined && existing.priority === TaskPriority.TOP_3);
    const isTargetingActive =
      data.status !== undefined ? data.status !== TaskStatus.COMPLETED : existing.status !== TaskStatus.COMPLETED;
    const wasAlreadyActiveTop3 = existing.priority === TaskPriority.TOP_3 && existing.status !== TaskStatus.COMPLETED;

    if (isTargetingTop3 && isTargetingActive && !wasAlreadyActiveTop3) {
      if (data.swapWithTaskId) {
        await prisma.task.updateMany({
          where: { id: data.swapWithTaskId, userId },
          data: { priority: TaskPriority.REGULAR },
        });
      } else {
        const activeTop3Tasks = await prisma.task.findMany({
          where: {
            userId,
            priority: TaskPriority.TOP_3,
            status: { not: TaskStatus.COMPLETED },
            id: { not: req.params.id },
          },
          select: { id: true, title: true, durationMinutes: true, category: true },
        });

        if (activeTop3Tasks.length >= 3) {
          throw new ValidationError(VALIDATION_MESSAGES.id.taskTop3Quota, {
            canSwap: true,
            activeTop3Tasks,
          });
        }
      }
    }

    const isNowCompleted = data.status === TaskStatus.COMPLETED && existing.status !== TaskStatus.COMPLETED;
    const completedAtDate = isNowCompleted ? new Date() : data.status && data.status !== TaskStatus.COMPLETED ? null : undefined;

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.durationMinutes !== undefined ? { durationMinutes: data.durationMinutes } : {}),
        ...(data.priority !== undefined ? { priority: data.priority as TaskPriority } : {}),
        ...(data.status !== undefined ? { status: data.status as TaskStatus } : {}),
        ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.energyLevel !== undefined ? { energyLevel: data.energyLevel as any } : {}),
        ...(data.deadline !== undefined ? { deadline: data.deadline ? new Date(data.deadline) : null } : {}),
        ...(data.targetDate !== undefined ? { targetDate: data.targetDate ? new Date(data.targetDate) : null } : {}),
        ...(data.startTime !== undefined ? { startTime: data.startTime ? new Date(data.startTime) : null } : {}),
        ...(data.scheduledStart !== undefined ? { scheduledStart: data.scheduledStart ? new Date(data.scheduledStart) : null } : {}),
        ...(data.focusType !== undefined ? { focusType: data.focusType } : {}),
        ...(data.restMinutes !== undefined ? { restMinutes: data.restMinutes } : {}),
        ...(data.needRestAfter !== undefined ? { needRestAfter: data.needRestAfter } : {}),
        ...(data.isBacklog !== undefined ? { isBacklog: data.isBacklog } : {}),
        ...(data.categoryName !== undefined ? { categoryName: data.categoryName } : {}),
        ...(data.categoryColor !== undefined ? { categoryColor: data.categoryColor } : {}),
        ...(data.dateDisplay !== undefined ? { dateDisplay: data.dateDisplay } : {}),
        ...(data.startHourDisplay !== undefined ? { startHourDisplay: data.startHourDisplay } : {}),
        completedAt: completedAtDate,
      },
    });

    // Jika baru selesai, catat log aktivitas ke D5
    if (isNowCompleted) {
      await prisma.activityLog.create({
        data: {
          taskId: updated.id,
          userId,
          actualDurationMinutes: data.actualDurationMinutes ?? updated.durationMinutes,
          energyLevel: (data.energyLevelAtCompletion as any) || updated.energyLevel || undefined,
          moodRating: data.moodRating,
          reflectionNotes: data.reflectionNotes,
          completedAt: new Date(),
        },
      });
    }

    res.json(formatTask(updated));
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/:id
taskRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, userId },
    });

    if (!existing) {
      throw new NotFoundError('Tugas tidak ditemukan');
    }

    await prisma.scheduleBlock.deleteMany({ where: { taskId: req.params.id } });
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export function formatTask(task: {
  id: string;
  userId: string;
  categoryId?: string | null;
  category?: string | null;
  title: string;
  notes: string | null;
  durationMinutes: number;
  priority: string;
  energyLevel?: string | null;
  status: string;
  targetDate?: Date | null;
  startTime?: Date | null;
  scheduledStart?: Date | null;
  scheduledEnd?: Date | null;
  deadline?: Date | null;
  completedAt?: Date | null;
  focusType?: string | null;
  restMinutes?: number | null;
  needRestAfter?: boolean | null;
  isBacklog?: boolean | null;
  categoryName?: string | null;
  categoryColor?: string | null;
  dateDisplay?: string | null;
  startHourDisplay?: string | null;
  createdAt: Date;
  updatedAt: Date;
}): TaskResponseDto {
  const start = task.startTime || task.scheduledStart;
  const end = task.scheduledEnd || (start ? new Date(new Date(start).getTime() + task.durationMinutes * 60000) : null);
  return {
    id: task.id,
    userId: task.userId,
    categoryId: task.categoryId ?? undefined,
    category: task.category ?? undefined,
    title: task.title,
    notes: task.notes ?? undefined,
    durationMinutes: task.durationMinutes,
    priority: task.priority as TaskResponseDto['priority'],
    energyLevel: (task.energyLevel as TaskResponseDto['energyLevel']) ?? 'MEDIUM',
    status: task.status as TaskResponseDto['status'],
    targetDate: task.targetDate ? task.targetDate.toISOString().split('T')[0] : undefined,
    startTime: start ? start.toISOString() : undefined,
    endTime: end ? end.toISOString() : undefined,
    deadline: task.deadline ? task.deadline.toISOString() : undefined,
    scheduledStart: task.scheduledStart ? task.scheduledStart.toISOString() : undefined,
    scheduledEnd: task.scheduledEnd ? task.scheduledEnd.toISOString() : undefined,
    completedAt: task.completedAt ? task.completedAt.toISOString() : undefined,
    focusType: task.focusType ?? (task.energyLevel === 'HIGH' ? 'Deep Focus' : task.energyLevel === 'LOW' ? 'Light' : 'Medium'),
    restMinutes: task.restMinutes ?? 10,
    needRestAfter: task.needRestAfter ?? true,
    isBacklog: task.isBacklog ?? false,
    categoryName: task.categoryName ?? task.category ?? 'Strategic',
    categoryColor: task.categoryColor ?? '#7C3AED',
    dateDisplay: task.dateDisplay ?? (task.targetDate ? task.targetDate.toISOString().split('T')[0] : 'October, 3rd 2026'),
    startHourDisplay: task.startHourDisplay ?? (start ? start.toISOString().substring(11, 16) : '11:40'),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}
