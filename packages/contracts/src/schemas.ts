import { z } from 'zod';

/**
 * FoCient Runtime Zod Validation Schemas (Client & Server Contract)
 *
 * Implements the FoCient Validation Standards:
 * 1. Guilt-Free & Empathetic Feedback: zero punitive words ("Gagal", "Salah", "Terlambat").
 * 2. Independent Time Formatting: endTime = startTime + durationMinutes (no user input for endTime).
 * 3. Tabular Figures: integer duration, numeric constraints.
 * 4. Dual-Layer Defense: client-side inline feedback + server relational integrity.
 */

// ==========================================
// Canonical Empathetic Validation Messages
// ==========================================
export const VALIDATION_MESSAGES = {
  id: {
    taskTitle: 'Beri nama tugas singkat agar fokus kerjamu lebih terarah.',
    taskDuration: 'Tentukan durasi antara 5 hingga 480 menit (contoh: 30m atau 45m).',
    taskCategory: 'Pilih satu pilar kategori agar pembagian fokusmu tercatat rapi.',
    taskStartTime: 'Format jam mulai belum pas. Pilih slot waktu yang tersedia.',
    taskStartTimeSameDay: 'Format jam mulai belum pas. Pilih slot waktu dalam hari yang sama.',
    taskTop3Quota:
      '3 tugas fokus utama sudah penuh. Selesaikan salah satunya terlebih dahulu atau alihkan prioritas.',
    workHoursLimit: 'Tentukan batasan jam kerja harian yang realistis antara 1 hingga 16 jam.',
    workHoursFormat: 'Format waktu belum pas. Gunakan format 24 jam HH:mm (contoh: 09:00).',
    workHoursRange: 'Rentang jam kerja belum sesuai. Pastikan jam selesai setelah jam mulai.',
    selectedCategoriesMin: 'Pilih minimal satu kategori kerja untuk memulai rencana pertamamu.',
    selectedCategoriesMax: 'Maksimal 5 kategori kerja untuk menjaga kesederhanaan fokus awal.',
    confirmedStartTimePast: 'Slot waktu ini sudah terlewat. Pilih jam saat ini atau slot berikutnya.',
    emailInvalid: 'Format email belum pas. Masukkan alamat email yang aktif.',
    passwordMin: 'Kata sandi minimal 8 karakter untuk keamanan fokusmu.',
    nameMin: 'Nama minimal 2 karakter.',
  },
  en: {
    taskTitle: 'Give your task a short title to guide your focus.',
    taskDuration: 'Set a duration between 5 and 480 minutes (e.g., 30m or 45m).',
    taskCategory: 'Select a category pillar to keep your focus organized.',
    taskStartTime: 'Start time format is not quite right. Select an available time slot.',
    taskStartTimeSameDay: 'Start time should be within the same day as the task.',
    taskTop3Quota:
      'The 3 main focus tasks are full. Complete one first or switch priority.',
    workHoursLimit: 'Set a realistic daily work hour limit between 1 and 16 hours.',
    workHoursFormat: 'Time format is not aligned. Use 24-hour HH:mm (e.g., 09:00).',
    workHoursRange: 'Work hour range is not aligned. Make sure end time is after start time.',
    selectedCategoriesMin: 'Select at least one work category to start your first plan.',
    selectedCategoriesMax: 'Up to 5 work categories to keep initial focus simple.',
    confirmedStartTimePast: 'This time slot has already passed. Choose the current time or the next available slot.',
    emailInvalid: 'Email format is not aligned. Please enter an active email.',
    passwordMin: 'Password should be at least 8 characters.',
    nameMin: 'Name should be at least 2 characters.',
  },
} as const;

// Default to Indonesian
const MSG = VALIDATION_MESSAGES.id;

// ==========================================
// Auth Schemas
// ==========================================
export const RegisterSchema = z.object({
  email: z.string().email(MSG.emailInvalid),
  password: z.string().min(8, MSG.passwordMin),
  name: z.string().min(2, MSG.nameMin),
  timezone: z.string().optional().default('Asia/Jakarta'),
  dailyCapacityMinutes: z.number().int().positive().optional().default(480),
});

export const LoginSchema = z.object({
  email: z.string().email(MSG.emailInvalid),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
});

export const SendOtpSchema = z.object({
  email: z.string().email(MSG.emailInvalid),
  name: z.string().min(2, MSG.nameMin).optional(),
});

export const VerifyOtpSchema = z.object({
  email: z.string().email(MSG.emailInvalid),
  code: z.string().length(6, 'Kode OTP harus 6 digit angka'),
  name: z.string().min(2, MSG.nameMin),
  password: z.string().min(8, MSG.passwordMin),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email(MSG.emailInvalid),
});

export const VerifyResetOtpSchema = z.object({
  email: z.string().email(MSG.emailInvalid),
  code: z.string().length(6, 'Kode OTP harus 6 digit angka'),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email(MSG.emailInvalid),
  code: z.string().length(6, 'Kode OTP harus 6 digit angka'),
  newPassword: z.string().min(8, MSG.passwordMin),
});

// ==========================================
// Task Schemas
// ==========================================
export const TaskPriorityEnum = z.enum(['TOP_3', 'REGULAR', 'NORMAL', 'LOW']);
export const StrictTaskPriorityEnum = z.enum(['TOP_3', 'REGULAR']);
export const TaskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'NEEDS_ADJUSTMENT', 'COMPLETED']);

/**
 * FoCient Behavior & Psychological Dimension Enums
 * Sourced from User Research Insight (CoTech / Nico Wiranata) & PRD
 * - MotivationType: Identity-driven, Achievement-driven, Discipline-driven, Social-driven
 * - EnergyLevel: Mood & Energy as execution determinants (Low, Medium, High)
 */
export const MotivationTypeEnum = z.enum([
  'IDENTITY_DRIVEN',
  'ACHIEVEMENT_DRIVEN',
  'DISCIPLINE_DRIVEN',
  'SOCIAL_DRIVEN',
]);

export const EnergyLevelEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const TIME_24H_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Task Management Creation Schema
 * Follows Matrix Aturan Validasi Field:
 * - title: min 1, max 120, trimmed
 * - durationMinutes: int, 5 - 480
 * - categoryId: valid UUID
 * - startTime: optional ISO 8601
 * - priority: TOP_3 | REGULAR (default REGULAR)
 * - energyLevel: LOW | MEDIUM | HIGH (default MEDIUM)
 */
export const CreateTaskSchema = z.object({
  title: z
    .string({ required_error: MSG.taskTitle, invalid_type_error: MSG.taskTitle })
    .trim()
    .min(1, MSG.taskTitle)
    .max(120, MSG.taskTitle),
  notes: z.string().max(1000).optional(),
  durationMinutes: z
    .number({ required_error: MSG.taskDuration, invalid_type_error: MSG.taskDuration })
    .int(MSG.taskDuration)
    .min(5, MSG.taskDuration)
    .max(480, MSG.taskDuration),
  categoryId: z
    .string({ required_error: MSG.taskCategory, invalid_type_error: MSG.taskCategory })
    .uuid(MSG.taskCategory)
    .optional(),
  category: z.string().max(50).optional(),
  priority: TaskPriorityEnum.optional().default('REGULAR'),
  energyLevel: EnergyLevelEnum.optional().default('MEDIUM'),
  deadline: z.string().datetime({ offset: true }).optional(),
  startTime: z
    .string()
    .datetime({ offset: true, message: MSG.taskStartTime })
    .optional(),
  scheduledStart: z
    .string()
    .datetime({ offset: true, message: MSG.taskStartTime })
    .optional(),
  swapWithTaskId: z.string().uuid().optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  status: TaskStatusEnum.optional(),
  completedAt: z.string().datetime({ offset: true }).optional(),
  swapWithTaskId: z.string().uuid().optional(),
});

export const TaskFilterSchema = z.object({
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD').optional(),
  isFocusTop3: z.coerce.boolean().optional(),
});

// ==========================================
// Onboarding / Setup Schemas
// ==========================================
/**
 * Onboarding / Setup Form Validation Schema
 * - workHoursLimit: number, min 1, max 16 (0.5 step)
 * - startWorkTime & endWorkTime: local 24h format "HH:mm", endWorkTime > startWorkTime
 * - selectedCategories: array of string, 1 to 5 categories
 */
export const OnboardingSetupSchema = z
  .object({
    roleArchetype: z.string().min(1).optional().default('Software Engineer'),
    workHoursLimit: z
      .number({ required_error: MSG.workHoursLimit, invalid_type_error: MSG.workHoursLimit })
      .min(1, MSG.workHoursLimit)
      .max(16, MSG.workHoursLimit)
      .refine(
        (val) => Number.isInteger(val * 2),
        MSG.workHoursLimit
      )
      .default(8),
    startWorkTime: z
      .string({ required_error: MSG.workHoursFormat, invalid_type_error: MSG.workHoursFormat })
      .regex(TIME_24H_REGEX, MSG.workHoursFormat),
    endWorkTime: z
      .string({ required_error: MSG.workHoursFormat, invalid_type_error: MSG.workHoursFormat })
      .regex(TIME_24H_REGEX, MSG.workHoursFormat),
    selectedCategories: z
      .array(z.string().min(1))
      .min(1, MSG.selectedCategoriesMin)
      .max(5, MSG.selectedCategoriesMax),
    // Behavioral & Psychological Alignment (PRD & User Research)
    visualGoals: z.union([z.array(z.string().min(1)), z.string()]).optional(),
    motivationType: MotivationTypeEnum.optional().default('ACHIEVEMENT_DRIVEN'),
    workStyle: z.string().optional().default('Hybrid System: Structure + Flexibility'),
    timeToFirstPlanSeconds: z.number().int().positive().optional(),
  })
  .refine(
    (data) => {
      const [startH, startM] = data.startWorkTime.split(':').map(Number);
      const [endH, endM] = data.endWorkTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      return endMinutes > startMinutes;
    },
    {
      message: MSG.workHoursRange,
      path: ['endWorkTime'],
    }
  );

export const CompleteOnboardingSchema = OnboardingSetupSchema;

// ==========================================
// Category Schemas (D2: categories)
// ==========================================
export const CreateCategorySchema = z.object({
  name: z.string().trim().min(1, 'Nama kategori wajib diisi').max(50),
  colorToken: z.string().max(20).optional().default('blue'),
  isDefault: z.boolean().optional().default(false),
});

// ==========================================
// Task Completion & Activity Log Schema (D5)
// ==========================================
export const MarkTaskCompleteSchema = z.object({
  completedAt: z.string().datetime({ offset: true }).optional(),
  actualDurationMinutes: z.number().int().positive().optional(),
  energyLevelAtCompletion: EnergyLevelEnum.optional(),
  moodRating: z.number().int().min(1).max(5).optional(),
  reflectionNotes: z.string().max(500).optional(),
});

// ==========================================
// Generate Plan Schema (Onboarding -> Generate Plan -> Today Plan Flow)
// ==========================================
export const GeneratePlanSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD').optional(),
  visualGoals: z.array(z.string()).optional(),
  motivationType: MotivationTypeEnum.optional(),
  preferredCategories: z.array(z.string()).optional(),
  targetTaskCount: z.number().int().min(1).max(6).optional().default(3),
});

// ==========================================
// Adaptive Scheduling Confirmation Schema
// ==========================================
/**
 * Adaptive Scheduling Confirmation
 * - confirmedStartTime: ISO 8601, cannot be in the past for today's tasks
 */
export const AdaptiveScheduleConfirmSchema = z.object({
  taskId: z.string().uuid('ID tugas tidak valid'),
  confirmedStartTime: z
    .string({ required_error: MSG.taskStartTime, invalid_type_error: MSG.taskStartTime })
    .datetime({ offset: true, message: MSG.taskStartTime })
    .refine(
      (val) => {
        const timeMs = new Date(val).getTime();
        // Allow a 1-minute grace margin for network jitter
        return timeMs >= Date.now() - 60000;
      },
      {
        message: MSG.confirmedStartTimePast,
      }
    ),
});

// ==========================================
// Top 3 Quota Validation Helper
// ==========================================
export interface Top3QuotaCheckResult {
  isValid: boolean;
  message?: string;
  activeTop3Count: number;
}

/**
 * Validates the Top 3 focus priority quota:
 * Maximum 3 active (non-completed) tasks can be prioritized as 'TOP_3'.
 */
export function checkTop3Quota(
  desiredPriority: string | undefined,
  currentTasks: Array<{ id?: string; status?: string; priority?: string }>,
  currentTaskId?: string,
  locale: 'id' | 'en' = 'id'
): Top3QuotaCheckResult {
  const isTargetingTop3 = desiredPriority === 'TOP_3';
  const activeTop3Tasks = currentTasks.filter(
    (t) =>
      t.priority === 'TOP_3' &&
      t.status !== 'COMPLETED' &&
      t.id !== currentTaskId
  );

  const activeTop3Count = activeTop3Tasks.length;

  if (isTargetingTop3 && activeTop3Count >= 3) {
    return {
      isValid: false,
      message: VALIDATION_MESSAGES[locale].taskTop3Quota,
      activeTop3Count,
    };
  }

  return {
    isValid: true,
    activeTop3Count,
  };
}

/**
 * Validates that a startTime is within the designated task calendar day.
 */
export function checkSameDayStartTime(
  startTimeIso: string,
  targetDateYmd?: string,
  locale: 'id' | 'en' = 'id'
): { isValid: boolean; message?: string } {
  try {
    const startDate = new Date(startTimeIso);
    if (isNaN(startDate.getTime())) {
      return { isValid: false, message: VALIDATION_MESSAGES[locale].taskStartTime };
    }
    if (targetDateYmd) {
      const year = startDate.getUTCFullYear();
      const month = String(startDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(startDate.getUTCDate()).padStart(2, '0');
      const startYmd = `${year}-${month}-${day}`;
      if (startYmd !== targetDateYmd) {
        return { isValid: false, message: VALIDATION_MESSAGES[locale].taskStartTimeSameDay };
      }
    }
    return { isValid: true };
  } catch {
    return { isValid: false, message: VALIDATION_MESSAGES[locale].taskStartTime };
  }
}

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

// ==========================================
// Apply Reschedule Schemas (Proses 3.0 & D6)
// ==========================================
export const ApplyRescheduleSchema = z.object({
  taskId: z.string().uuid('ID tugas tidak valid'),
  suggestedStartTime: z.string().datetime({ offset: true }),
  reasonMessage: z.string().max(255).optional(),
});

export const BatchApplyRescheduleSchema = z.object({
  shifts: z.array(ApplyRescheduleSchema).min(1, 'Minimal satu pergeseran jadwal diperlukan'),
});
