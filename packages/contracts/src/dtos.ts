/**
 * FoCient Shared Data Transfer Objects (DTOs)
 * Used across Frontend, Mobile, and Backend API integrations.
 * Aligned with DFD Level 0, DFD Level 1, and FoCient Class Diagram.
 */

// ==========================================
// 1. Authentication & User DTOs (D1: users)
// ==========================================
export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  timezone?: string;
  dailyCapacityMinutes?: number;
  roleArchetype?: string;
  workHoursLimit?: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface SendOtpDto {
  email: string;
  name?: string;
}

export interface VerifyOtpDto {
  email: string;
  code: string;
  name: string;
  password: string;
}

export interface OtpResponseDto {
  success: boolean;
  message: string;
  expiresInSeconds: number;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface VerifyResetOtpDto {
  email: string;
  code: string;
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}

export type MotivationType =
  | 'IDENTITY_DRIVEN'
  | 'ACHIEVEMENT_DRIVEN'
  | 'DISCIPLINE_DRIVEN'
  | 'SOCIAL_DRIVEN';

export type EnergyLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface UserProfileDto {
  id: string;
  email: string;
  name: string;
  timezone: string;
  roleArchetype: string;
  workHoursLimit: number;
  startWorkTime: string; // e.g. "09:00"
  endWorkTime: string;   // e.g. "17:00"
  workHourStart: string; // backwards compatibility alias
  workHourEnd: string;   // backwards compatibility alias
  dailyCapacityMinutes: number;
  isOnboardingCompleted: boolean;
  visualGoals?: string[] | string;
  motivationType?: MotivationType;
  workStyle?: string;
  timeToFirstPlanSeconds?: number;
  consistentPlanDays?: number;
  rescheduleTimeSavedMinutes?: number;
  manualAdjustmentsReducedCount?: number;
  createdAt: string;
}

export interface AuthResponseDto {
  token: string;
  user: UserProfileDto;
}

// ==========================================
// 2. Category DTOs (D2: categories)
// ==========================================
export interface CategoryDto {
  id: string;
  userId?: string;
  name: string;
  colorToken: string;
  isDefault: boolean;
  color?: string; // backwards compatibility alias
  isActive?: boolean;
  createdAt?: string;
}

export interface CreateCategoryDto {
  name: string;
  colorToken?: string;
  isDefault?: boolean;
}

// ==========================================
// 3. Task Management DTOs (D3: tasks)
// ==========================================
export type TaskPriority = 'TOP_3' | 'REGULAR' | 'NORMAL' | 'LOW';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'NEEDS_ADJUSTMENT' | 'COMPLETED';

export interface CreateTaskDto {
  title: string;
  notes?: string;
  durationMinutes: number;
  categoryId?: string;
  priority?: TaskPriority;
  energyLevel?: EnergyLevel;
  deadline?: string;
  targetDate?: string;
  category?: string;
  startTime?: string;
  scheduledStart?: string;
  swapWithTaskId?: string;
}

export interface UpdateTaskDto {
  title?: string;
  notes?: string;
  durationMinutes?: number;
  categoryId?: string;
  priority?: TaskPriority;
  energyLevel?: EnergyLevel;
  status?: TaskStatus;
  deadline?: string;
  targetDate?: string;
  category?: string;
  startTime?: string;
  scheduledStart?: string;
  completedAt?: string;
  actualDurationMinutes?: number;
  energyLevelAtCompletion?: EnergyLevel;
  moodRating?: number;
  reflectionNotes?: string;
  swapWithTaskId?: string;
}

export interface MarkTaskCompleteDto {
  completedAt?: string;
  actualDurationMinutes?: number;
  energyLevelAtCompletion?: EnergyLevel;
  moodRating?: number;
  reflectionNotes?: string;
}

export interface TaskResponseDto {
  id: string;
  userId: string;
  categoryId?: string;
  category?: string;
  title: string;
  notes?: string;
  durationMinutes: number;
  priority: TaskPriority;
  energyLevel?: EnergyLevel;
  status: TaskStatus;
  targetDate?: string;
  startTime?: string;
  endTime?: string;
  deadline?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilterDto {
  status?: TaskStatus;
  priority?: TaskPriority;
  date?: string;
  isFocusTop3?: boolean;
}

// ==========================================
// 4. Onboarding & Setup DTOs (Proses 1.0)
// ==========================================
export interface CompleteOnboardingDto {
  username?: string;
  name?: string;
  roleArchetype: string;
  workHoursLimit: number; // 1 to 16 hours
  startWorkTime: string;  // "HH:mm"
  endWorkTime: string;    // "HH:mm"
  selectedCategories: string[];
  visualGoals?: string[] | string;
  motivationType?: MotivationType;
  workStyle?: string;
  timeToFirstPlanSeconds?: number;
}

export type OnboardingSetupDto = CompleteOnboardingDto;

// ==========================================
// 5. Capacity & Workload DTOs (D4: user_capacities)
// ==========================================
export type CapacityStatus = 'LIGHT' | 'OPTIMAL' | 'NEAR_CAPACITY' | 'OVERLOAD';

export interface EnergyDistributionDto {
  lowMinutes: number;
  mediumMinutes: number;
  highMinutes: number;
  highEnergyCount: number;
  isHighEnergyOverload: boolean;
  energyAdvice?: string;
}

export interface CapacityProfileDto {
  id?: string;
  userId: string;
  targetDate: string;
  maxDailyMinutes: number;
  allocatedMinutes: number;
  capacityPercentage: number;
  status: CapacityStatus;
  isOverloaded: boolean;
}

export interface WorkloadSummaryDto {
  date: string;
  allocatedMinutes: number;
  capacityMinutes: number;
  percentage: number;
  status: CapacityStatus;
  taskCount: number;
  completedCount: number;
  isOverloaded: boolean;
  energyBreakdown?: EnergyDistributionDto;
}

// ==========================================
// 6. Productivity Tracking & Today Plan (Proses 4.0)
// ==========================================
export interface TodayPlanDto {
  date: string;
  timelineSchedule: TaskResponseDto[];
  unscheduledTasks: TaskResponseDto[];
  top3Priorities: TaskResponseDto[];
  capacityProfile: CapacityProfileDto;
  energyBreakdown?: EnergyDistributionDto;
  adaptiveBanner?: {
    shouldAlert: boolean;
    severity: 'INFO' | 'WARNING' | 'SUCCESS';
    title: string;
    message: string;
  };
}

// ==========================================
// 6.1 MVP Success & Behavioral Metrics (PRD Aligned)
// ==========================================
export interface SuccessMetricsDto {
  activation: {
    timeToFirstPlanSeconds: number | null;
    isActivated: boolean;
  };
  execution: {
    taskCompletionRate: number;
    consistentPlanDays: number;
    activeStreak: number;
  };
  efficiency: {
    rescheduleTimeSavedMinutes: number;
    manualAdjustmentsReducedCount: number;
  };
}

// ==========================================
// 6.2 Initial Plan Generation (Onboarding -> Generate Plan)
// ==========================================
export interface GeneratePlanResponseDto {
  date: string;
  suggestedTasks: TaskResponseDto[];
  top3Tasks: TaskResponseDto[];
  allocatedMinutes: number;
  capacityPercentage: number;
  rationale: string;
}

// ==========================================
// 7. Activity Logs (D5: activity_logs)
// ==========================================
export interface ActivityLogDto {
  id: string;
  taskId: string;
  userId: string;
  actualDurationMinutes: number;
  completedAt: string;
  createdAt: string;
}

// ==========================================
// 8. Adaptive Rescheduling & Audit Logs (D6: reschedule_audit_logs)
// ==========================================
export type ScheduleBlockType = 'TASK' | 'BUFFER' | 'BREAK' | 'FOCUS_SESSION';

export interface ScheduleBlockDto {
  id: string;
  userId: string;
  taskId?: string;
  title: string;
  startTime: string; // ISO 8601 string
  endTime: string;   // ISO 8601 string
  isLocked: boolean;
  type: ScheduleBlockType;
}

export interface AutoScheduleRequestDto {
  date: string; // YYYY-MM-DD
  preserveLocked?: boolean;
  preferredBufferMinutes?: number;
}

export interface RippleRescheduleDto {
  delayedTaskId: string;
  actualDurationMinutes: number;
  delayMinutes: number;
  reason?: string;
}

export interface ShiftedTaskResultDto {
  taskId: string;
  taskTitle: string;
  previousStartTime: string;
  newStartTime: string;
  newEndTime: string;
}

export interface RippleRescheduleResponseDto {
  success: boolean;
  message: string;
  shiftedTasks: ShiftedTaskResultDto[];
  deferredTasks?: ShiftedTaskResultDto[];
  requiresConfirmation: boolean;
  overloadDetected: boolean;
}

export interface ApplyRescheduleDto {
  taskId: string;
  suggestedStartTime: string;
  reasonMessage?: string;
}

export interface BatchApplyRescheduleDto {
  shifts: ApplyRescheduleDto[];
}

export interface RescheduleAuditLogDto {
  id: string;
  taskId: string;
  userId: string;
  previousStartTime?: string;
  newStartTime?: string;
  reasonMessage?: string;
  appliedAt: string;
  createdAt: string;
}

export interface AdaptiveScheduleConfirmDto {
  taskId: string;
  confirmedStartTime: string; // ISO 8601
}

export function calculateEndTime(startTimeIso: string, durationMinutes: number): string {
  const start = new Date(startTimeIso);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return end.toISOString();
}

// ==========================================
// 9. Analytics & Weekly Insight (Proses 5.0)
// ==========================================
export interface WeeklyReflectionDto {
  startDate: string;
  endDate: string;
  totalFocusMinutes: number;
  completedTasks: number;
  guiltFreeBalanceScore: number; // 0-100 rating based on healthy work pace
  rescheduleCount: number;
  topCategories: Array<{ category: string; minutes: number }>;
}

export interface WeeklyInsightSummaryDto {
  startDate: string;
  endDate: string;
  totalFocusMinutes: number;
  completedTasks: number;
  overallCompletionRate: number;
  guiltFreeBalanceScore: number;
  dailyRhythms: Array<{
    date: string;
    focusMinutes: number;
    completedCount: number;
    completionRate: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    minutes: number;
    percentage: number;
  }>;
  reflectionNote: string;
}

// ==========================================
// 10. External Calendar Integration DTOs
// ==========================================
export interface ExternalCalendarEventDto {
  externalId: string;
  provider: 'GOOGLE' | 'OUTLOOK' | 'APPLE';
  summary: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
}

export interface CalendarSyncResponseDto {
  syncedEventsCount: number;
  createdBlocksCount: number;
  conflictsFound: number;
}
