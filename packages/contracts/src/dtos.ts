/**
 * FoCient Shared Data Transfer Objects (DTOs)
 * Used across Frontend, Mobile, and Backend API integrations.
 */

// ==========================================
// 1. Authentication & User DTOs
// ==========================================
export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  timezone?: string;
  dailyCapacityMinutes?: number;
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
  workHourStart: string; // e.g. "09:00"
  workHourEnd: string;   // e.g. "17:00"
  dailyCapacityMinutes: number;
  createdAt: string;
}

export interface AuthResponseDto {
  token: string;
  user: UserProfileDto;
}

// ==========================================
// 2. Task Management DTOs
// ==========================================
export type TaskPriority = 'TOP_3' | 'REGULAR' | 'NORMAL' | 'LOW';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export interface CategoryDto {
  id: string;
  userId?: string;
  name: string;
  color?: string;
  isActive: boolean;
}

export interface CreateTaskDto {
  title: string;
  notes?: string;
  durationMinutes: number;
  categoryId?: string;
  priority?: TaskPriority;
  deadline?: string;
  category?: string;
  startTime?: string;
  scheduledStart?: string;
}

export interface UpdateTaskDto {
  title?: string;
  notes?: string;
  durationMinutes?: number;
  categoryId?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  deadline?: string;
  category?: string;
  startTime?: string;
  scheduledStart?: string;
  completedAt?: string;
}

export interface TaskResponseDto {
  id: string;
  userId: string;
  title: string;
  notes?: string;
  durationMinutes: number;
  priority: TaskPriority;
  status: TaskStatus;
  categoryId?: string;
  category?: string;
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
// 2.1 Onboarding & Setup DTOs
// ==========================================
export interface OnboardingSetupDto {
  workHoursLimit: number; // 1 to 16 hours (step 0.5)
  startWorkTime: string;  // 24h format "HH:mm"
  endWorkTime: string;    // 24h format "HH:mm"
  selectedCategories: string[]; // 1 to 5 categories
}

// ==========================================
// 2.2 Adaptive Scheduling Confirmation DTOs
// ==========================================
export interface AdaptiveScheduleConfirmDto {
  taskId: string;
  confirmedStartTime: string; // ISO 8601
}

/**
 * Calculates endTime automatically: endTime = startTime + durationMinutes.
 * FoCient principle: Independent time formatting without user input for endTime.
 */
export function calculateEndTime(startTimeIso: string, durationMinutes: number): string {
  const start = new Date(startTimeIso);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return end.toISOString();
}

// ==========================================
// 3. Schedule & Ripple Reschedule DTOs
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
  requiresConfirmation: boolean;
  overloadDetected: boolean;
}

// ==========================================
// 4. Capacity & Workload DTOs
// ==========================================
export type CapacityStatus = 'LIGHT' | 'OPTIMAL' | 'NEAR_CAPACITY' | 'OVERLOAD';

export interface WorkloadSummaryDto {
  date: string;
  allocatedMinutes: number;
  capacityMinutes: number;
  percentage: number;
  status: CapacityStatus;
  taskCount: number;
  completedCount: number;
}

// ==========================================
// 5. Analytics & Insight DTOs
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

// ==========================================
// 6. External Calendar Integration DTOs
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
