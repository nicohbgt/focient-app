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
  status?: TaskStatus;
  deadline?: string;
  targetDate?: string;
  category?: string;
  startTime?: string;
  scheduledStart?: string;
  completedAt?: string;
  actualDurationMinutes?: number;
  swapWithTaskId?: string;
}

export interface MarkTaskCompleteDto {
  completedAt?: string;
  actualDurationMinutes?: number;
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
  roleArchetype: string;
  workHoursLimit: number; // 1 to 16 hours
  startWorkTime: string;  // "HH:mm"
  endWorkTime: string;    // "HH:mm"
  selectedCategories: string[];
}

export type OnboardingSetupDto = CompleteOnboardingDto;

// ==========================================
// 5. Capacity & Workload DTOs (D4: user_capacities)
// ==========================================
export type CapacityStatus = 'LIGHT' | 'OPTIMAL' | 'NEAR_CAPACITY' | 'OVERLOAD';

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
  adaptiveBanner?: {
    shouldAlert: boolean;
    severity: 'INFO' | 'WARNING' | 'SUCCESS';
    title: string;
    message: string;
  };
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
