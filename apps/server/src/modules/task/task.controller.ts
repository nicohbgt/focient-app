import { Router, Response } from 'express';
import { prisma, TaskPriority, TaskStatus } from '@focient/database';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  TaskFilterSchema,
  TaskResponseDto,
  VALIDATION_MESSAGES,
} from '@focient/contracts';
import { validateBody, validateQuery } from '../../middleware/validate.middleware.js';
import { authenticate, AuthenticatedRequest } from '../auth/auth.middleware.js';
import { NotFoundError, ValidationError } from '../../common/errors.js';
import { top3PrioritiesEngine } from '../../engine/top3-priorities.engine.js';
const top3PriorityEngine = top3PrioritiesEngine;

export const taskRouter = Router();

taskRouter.use(authenticate);

// GET /api/tasks
taskRouter.get('/', validateQuery(TaskFilterSchema), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { status, priority, isFocusTop3 } = req.query as {
      status?: TaskStatus;
      priority?: TaskPriority;
      isFocusTop3?: boolean;
    };

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    });

    const dtos: TaskResponseDto[] = tasks.map(formatTask);

    if (isFocusTop3) {
      res.json(top3PriorityEngine.selectTop3(dtos));
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

    const top3 = top3PriorityEngine.selectTop3(tasks.map(formatTask));
    res.json(top3);
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks
taskRouter.post('/', validateBody(CreateTaskSchema), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const data = req.body;

    // Enforce Top-3 Priorities Rule (Max 3 active Top-3 focus tasks)
    if (data.priority === 'TOP_3') {
      const activeTop3Count = await prisma.task.count({
        where: {
          userId,
          priority: TaskPriority.TOP_3,
          status: { not: TaskStatus.COMPLETED },
        },
      });

      if (!top3PriorityEngine.canAcceptTop3(activeTop3Count)) {
        throw new ValidationError(VALIDATION_MESSAGES.id.taskTop3Quota);
      }
    }

    const task = await prisma.task.create({
      data: {
        userId,
        title: data.title,
        notes: data.notes,
        durationMinutes: data.durationMinutes,
        priority: data.priority as TaskPriority,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        category: data.category,
        scheduledStart: data.scheduledStart ? new Date(data.scheduledStart) : undefined,
      },
    });

    res.status(201).json(formatTask(task));
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

    // Enforce Top-3 Priorities Rule on status or priority update
    const isTargetingTop3 =
      data.priority === 'TOP_3' || (data.priority === undefined && existing.priority === TaskPriority.TOP_3);
    const isTargetingActive =
      data.status !== undefined ? data.status !== TaskStatus.COMPLETED : existing.status !== TaskStatus.COMPLETED;
    const wasAlreadyActiveTop3 = existing.priority === TaskPriority.TOP_3 && existing.status !== TaskStatus.COMPLETED;

    if (isTargetingTop3 && isTargetingActive && !wasAlreadyActiveTop3) {
      const activeTop3Count = await prisma.task.count({
        where: {
          userId,
          priority: TaskPriority.TOP_3,
          status: { not: TaskStatus.COMPLETED },
          id: { not: req.params.id },
        },
      });

      if (!top3PriorityEngine.canAcceptTop3(activeTop3Count)) {
        throw new ValidationError(VALIDATION_MESSAGES.id.taskTop3Quota);
      }
    }

    const isNowCompleted = data.status === TaskStatus.COMPLETED && existing.status !== TaskStatus.COMPLETED;

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.durationMinutes !== undefined ? { durationMinutes: data.durationMinutes } : {}),
        ...(data.priority !== undefined ? { priority: data.priority as TaskPriority } : {}),
        ...(data.status !== undefined ? { status: data.status as TaskStatus } : {}),
        ...(data.deadline !== undefined ? { deadline: data.deadline ? new Date(data.deadline) : null } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.scheduledStart !== undefined ? { scheduledStart: data.scheduledStart ? new Date(data.scheduledStart) : null } : {}),
        completedAt: isNowCompleted ? new Date() : data.status && data.status !== TaskStatus.COMPLETED ? null : undefined,
      },
    });

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

    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

function formatTask(task: {
  id: string;
  userId: string;
  title: string;
  notes: string | null;
  durationMinutes: number;
  priority: string;
  status: string;
  deadline: Date | null;
  category: string | null;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): TaskResponseDto {
  return {
    id: task.id,
    userId: task.userId,
    title: task.title,
    notes: task.notes ?? undefined,
    durationMinutes: task.durationMinutes,
    priority: task.priority as TaskResponseDto['priority'],
    status: task.status as TaskResponseDto['status'],
    deadline: task.deadline?.toISOString(),
    category: task.category ?? undefined,
    scheduledStart: task.scheduledStart?.toISOString(),
    scheduledEnd: task.scheduledEnd?.toISOString(),
    completedAt: task.completedAt?.toISOString(),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}
