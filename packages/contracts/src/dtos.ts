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
export type TaskPriority = 'TOP_3' | 'NORMAL' | 'LOW';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export interface CreateTaskDto {
  title: string;
  notes?: string;
  durationMinutes: number;
  priority?: TaskPriority;
  deadline?: string;
  category?: string;
  scheduledStart?: string;
}

export interface UpdateTaskDto {
  title?: string;
  notes?: string;
  durationMinutes?: number;
  priority?: TaskPriority;
  status?: TaskStatus;
  deadline?: string;
  category?: string;
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
  deadline?: string;
  category?: string;
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
