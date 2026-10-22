import { z } from 'zod';

/**
 * FoCient Runtime Zod Validation Schemas
 * Enforces request payload contracts on server & client boundaries.
 */

// ==========================================
// Auth Schemas
// ==========================================
export const RegisterSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  timezone: z.string().optional().default('Asia/Jakarta'),
  dailyCapacityMinutes: z.number().int().positive().optional().default(480),
});

export const LoginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
});

// ==========================================
// Task Schemas
// ==========================================
export const TaskPriorityEnum = z.enum(['TOP_3', 'NORMAL', 'LOW']);
export const TaskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']);

export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Judul tugas wajib diisi').max(120, 'Judul maksimal 120 karakter'),
  notes: z.string().max(1000).optional(),
  durationMinutes: z.number().int().min(5, 'Durasi minimal 5 menit').max(480, 'Durasi maksimal 8 jam'),
  priority: TaskPriorityEnum.optional().default('NORMAL'),
  deadline: z.string().datetime({ offset: true }).optional(),
  category: z.string().max(50).optional(),
  scheduledStart: z.string().datetime({ offset: true }).optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  status: TaskStatusEnum.optional(),
  completedAt: z.string().datetime({ offset: true }).optional(),
});

export const TaskFilterSchema = z.object({
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD').optional(),
  isFocusTop3: z.coerce.boolean().optional(),
});

// ==========================================
// Ripple Reschedule Schemas
// ==========================================
export const RippleRescheduleSchema = z.object({
  delayedTaskId: z.string().uuid('ID tugas tidak valid'),
  actualDurationMinutes: z.number().int().positive(),
  delayMinutes: z.number().int().positive(),
  reason: z.string().max(255).optional(),
});

// ==========================================
// Auto-Schedule Request Schema
// ==========================================
export const AutoScheduleRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  preserveLocked: z.boolean().optional().default(true),
  preferredBufferMinutes: z.number().int().min(0).max(60).optional().default(10),
});
