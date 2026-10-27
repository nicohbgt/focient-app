/**
 * @focient/contracts
 * Shared API contracts, Data Transfer Objects, and Validation Schemas.
 */
export * from './dtos.js';
export * from './schemas.js';

// Standard API Route Constants
export const API_ROUTES = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    SEND_OTP: '/api/auth/send-otp',
    VERIFY_OTP: '/api/auth/verify-otp',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    VERIFY_RESET_OTP: '/api/auth/verify-reset-otp',
    RESET_PASSWORD: '/api/auth/reset-password',
    ME: '/api/auth/me',
  },
  TASKS: {
    BASE: '/api/tasks',
    TOP_3: '/api/tasks/top-3',
    BY_ID: (id: string) => `/api/tasks/${id}`,
  },
  SCHEDULE: {
    BASE: '/api/schedule',
    AUTO_SCHEDULE: '/api/schedule/auto-place',
    RIPPLE_RESCHEDULE: '/api/schedule/ripple-reschedule',
  },
  CAPACITY: {
    DAILY: '/api/capacity/daily',
  },
  INSIGHT: {
    WEEKLY: '/api/insights/weekly',
  },
  HEALTH: '/health',
} as const;
