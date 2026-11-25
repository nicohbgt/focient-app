'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { authClient, UserSession, PendingRegistration } from '../lib/auth-client';
import {
  calculateCapacityMinutes,
  formatCurrentDate,
  getDayOfWeekIndex,
  getDayOfWeekName,
  getWeekDayDate,
  getWeekDayKeys,
  getWeekRangeBadge,
  WeekStartDay,
  isTaskOnDate,
  isTimeOverlappingQuietHours,
  normalizeToISODate,
  parseTime24ToMinutes,
} from '../lib/date-utils';
import {
  registerPwaServiceWorker,
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showPwaNotification,
  subscribeToWebPush,
  triggerServerWebPush,
  buildTaskReminderCopy,
  buildTaskLeadReminderCopy,
  buildTop3DailyReminderCopy,
  buildDailyQuietTimeSummaryCopy,
  buildWorkloadAlertCopy,
  buildScheduleRecommendationCopy,
  buildWorkloadWarningCopy,
  buildDailySummaryCopy,
  buildRestBufferCopy,
  buildUrgentTaskReminderCopy,
  buildTaskAddedCopy,
  buildTaskCompletedCopy,
} from '../lib/pwa-notifications';
import { FoCientI18nProvider } from '../components/i18n/I18nContext';

export type TaskStatus = 'todo' | 'inProgress' | 'completed';
export type TaskPriority = 'top3' | 'normal' | 'low';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type FocusType = 'Low' | 'Medium' | 'High' | 'Light' | 'Deep Focus';
export type RecurrencePattern = 'daily' | 'weekdays' | 'weekly' | 'custom';
export type NotificationCategory = 'task' | 'workload' | 'summary' | 'rest';
export type AuthView =
  | 'landing'
  | 'welcome'
  | 'login'
  | 'register'
  | 'otp'
  | 'forgotPassword'
  | 'resetPassword'
  | 'onboarding'
  | 'dashboard';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export interface WorkspaceCategory {
  id: string;
  name: string;
  colorHex: string;
  focusType?: FocusType;
  isDefault?: boolean;
}

export interface MobileTask {
  id: string;
  title: string;
  notes?: string;
  durationMinutes: number;
  priority: TaskPriority;
  energyLevel: EnergyLevel;
  status: TaskStatus;
  categoryName: string;
  categoryColor: string;
  restMinutes: number;
  dateDisplay: string;
  startHourDisplay: string;
  focusType: FocusType;
  isBacklog?: boolean;
  needRestAfter?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  recurrenceDays?: number[];
}

export interface CategoryBudgetItem {
  name: string;
  allocatedMinutes: number;
  maxMinutes?: number;
  colorHex?: string;
}

export interface DailyWorkloadItem {
  dayKey: string;
  fullDayName: string;
  percentage: number;
}

export interface RebalanceTaskProposal {
  id: string;
  title: string;
  previousSchedule: string;
  newSchedule: string;
  taskDurationMinutes: number;
  restDurationMinutes: number;
  categoryName: string;
  categoryColor: string;
}

export interface BacklogTaskItem {
  id: string;
  title: string;
  durationMinutes: number;
  categoryName: string;
  categoryColor: string;
  focusType: FocusType;
  restMinutes?: number;
}

export type ScreenInspectorView =
  | 'fullFlow'
  | 'landing'
  | 'welcome'
  | 'login'
  | 'register'
  | 'otp'
  | 'forgotPassword'
  | 'resetPassword'
  | 'step1Workspace'
  | 'step2Rhythm'
  | 'step3Time'
  | 'step4Task'
  | 'step5Review'
  | 'dashboard'
  | 'todayPlan'
  | 'taskList'
  | 'addTask'
  | 'taskDetail'
  | 'reschedule'
  | 'insights'
  | 'settings';

export type ActiveNavTab = 'dashboard' | 'plan' | 'addTask' | 'tasks' | 'insights' | 'reschedule' | 'settings';
export type DevicePreviewMode = 'responsive' | 'mobile' | 'tablet' | 'desktop';
export type Language = 'en' | 'id';

export const kOccupanciesList = [
  'General',
  'Professional',
  'Entrepreneur',
  'Student',
];

export const kOccupancyCategoryTemplates: Record<string, WorkspaceCategory[]> = {
  General: [
    { id: 'cat-gen-1', name: 'Focus', colorHex: '#2563EB', focusType: 'High', isDefault: true },
    { id: 'cat-gen-2', name: 'Sync', colorHex: '#0284C7', focusType: 'Medium', isDefault: true },
    { id: 'cat-gen-3', name: 'Admin', colorHex: '#64748B', focusType: 'Low', isDefault: true },
    { id: 'cat-gen-4', name: 'Personal', colorHex: '#059669', focusType: 'Low', isDefault: true },
  ],
  Professional: [
    { id: 'cat-pro-1', name: 'Project', colorHex: '#2563EB', focusType: 'High', isDefault: true },
    { id: 'cat-pro-2', name: 'Review', colorHex: '#0284C7', focusType: 'Medium', isDefault: true },
    { id: 'cat-pro-3', name: 'Tech', colorHex: '#7C3AED', focusType: 'Medium', isDefault: true },
    { id: 'cat-pro-4', name: 'Ops', colorHex: '#64748B', focusType: 'Low', isDefault: true },
  ],
  Entrepreneur: [
    { id: 'cat-ent-1', name: 'Strategy', colorHex: '#7C3AED', focusType: 'High', isDefault: true },
    { id: 'cat-ent-2', name: 'Product', colorHex: '#2563EB', focusType: 'High', isDefault: true },
    { id: 'cat-ent-3', name: 'Sales', colorHex: '#0284C7', focusType: 'Medium', isDefault: true },
    { id: 'cat-ent-4', name: 'Finance', colorHex: '#059669', focusType: 'Low', isDefault: true },
  ],
  Student: [
    { id: 'cat-stu-1', name: 'Study', colorHex: '#2563EB', focusType: 'High', isDefault: true },
    { id: 'cat-stu-2', name: 'Assignment', colorHex: '#7C3AED', focusType: 'High', isDefault: true },
    { id: 'cat-stu-3', name: 'Exam', colorHex: '#0284C7', focusType: 'Medium', isDefault: true },
    { id: 'cat-stu-4', name: 'Campus', colorHex: '#059669', focusType: 'Low', isDefault: true },
  ],
};

export const kOccupancyCategoryTemplatesId: Record<string, WorkspaceCategory[]> = {
  General: [
    { id: 'cat-gen-1', name: 'Fokus', colorHex: '#2563EB', focusType: 'High', isDefault: true },
    { id: 'cat-gen-2', name: 'Komunikasi', colorHex: '#0284C7', focusType: 'Medium', isDefault: true },
    { id: 'cat-gen-3', name: 'Administrasi', colorHex: '#64748B', focusType: 'Low', isDefault: true },
    { id: 'cat-gen-4', name: 'Pribadi', colorHex: '#059669', focusType: 'Low', isDefault: true },
  ],
  Professional: [
    { id: 'cat-pro-1', name: 'Proyek', colorHex: '#2563EB', focusType: 'High', isDefault: true },
    { id: 'cat-pro-2', name: 'Review', colorHex: '#0284C7', focusType: 'Medium', isDefault: true },
    { id: 'cat-pro-3', name: 'Teknis', colorHex: '#7C3AED', focusType: 'Medium', isDefault: true },
    { id: 'cat-pro-4', name: 'Operasional', colorHex: '#64748B', focusType: 'Low', isDefault: true },
  ],
  Entrepreneur: [
    { id: 'cat-ent-1', name: 'Strategi', colorHex: '#7C3AED', focusType: 'High', isDefault: true },
    { id: 'cat-ent-2', name: 'Produk', colorHex: '#2563EB', focusType: 'High', isDefault: true },
    { id: 'cat-ent-3', name: 'Penjualan', colorHex: '#0284C7', focusType: 'Medium', isDefault: true },
    { id: 'cat-ent-4', name: 'Keuangan', colorHex: '#059669', focusType: 'Low', isDefault: true },
  ],
  Student: [
    { id: 'cat-stu-1', name: 'Belajar', colorHex: '#2563EB', focusType: 'High', isDefault: true },
    { id: 'cat-stu-2', name: 'Tugas', colorHex: '#7C3AED', focusType: 'High', isDefault: true },
    { id: 'cat-stu-3', name: 'Ujian', colorHex: '#0284C7', focusType: 'Medium', isDefault: true },
    { id: 'cat-stu-4', name: 'Organisasi', colorHex: '#059669', focusType: 'Low', isDefault: true },
  ],
};

export const resolveCategoryFocusTypeByName = (name?: string): FocusType => {
  if (!name) return 'Medium';
  const clean = name.trim().toLowerCase();

  // 1. Direct template matching
  for (const list of Object.values(kOccupancyCategoryTemplates)) {
    const found = list.find((t) => t.name.toLowerCase() === clean);
    if (found?.focusType) return found.focusType;
  }
  for (const list of Object.values(kOccupancyCategoryTemplatesId)) {
    const found = list.find((t) => t.name.toLowerCase() === clean);
    if (found?.focusType) return found.focusType;
  }

  // 2. Keyword heuristic for Low intensity
  if (
    clean.includes('admin') ||
    clean.includes('pribadi') ||
    clean.includes('personal') ||
    clean.includes('keuangan') ||
    clean.includes('finance') ||
    clean.includes('ops') ||
    clean.includes('operasional') ||
    clean.includes('campus') ||
    clean.includes('organisasi') ||
    clean.includes('recovery') ||
    clean.includes('errand') ||
    clean.includes('rutin') ||
    clean.includes('routine') ||
    clean.includes('santai') ||
    clean.includes('istirahat') ||
    clean.includes('break')
  ) {
    return 'Low';
  }

  // 3. Keyword heuristic for High intensity
  if (
    clean.includes('fokus') ||
    clean.includes('focus') ||
    clean.includes('deep') ||
    clean.includes('core') ||
    clean.includes('strateg') ||
    clean.includes('proyek') ||
    clean.includes('project') ||
    clean.includes('belajar') ||
    clean.includes('study') ||
    clean.includes('tugas') ||
    clean.includes('assignment') ||
    clean.includes('produk') ||
    clean.includes('product') ||
    clean.includes('research') ||
    clean.includes('riset')
  ) {
    return 'High';
  }

  // 4. Default for communications, sync, reviews, meetings, etc.
  return 'Medium';
};

export const resolveCategoryFocusType = (cat?: Partial<WorkspaceCategory> | null): FocusType => {
  if (!cat) return 'Medium';
  const name = cat.name || '';

  // If it's a default category, respect the canonical template intensity
  if (cat.isDefault) {
    return resolveCategoryFocusTypeByName(name);
  }

  // If explicitly configured for custom category
  if (cat.focusType) {
    const ft = cat.focusType;
    if (ft === 'Deep Focus') return 'High';
    if (ft === 'Light') return 'Low';
    if (ft === 'High' || ft === 'Medium' || ft === 'Low') return ft;
  }

  return resolveCategoryFocusTypeByName(name);
};

const monDateStr = formatCurrentDate(getWeekDayDate(0), 'en');
const tueDateStr = formatCurrentDate(getWeekDayDate(1), 'en');
const wedDateStr = formatCurrentDate(getWeekDayDate(2), 'en');
const thuDateStr = formatCurrentDate(getWeekDayDate(3), 'en');
const friDateStr = formatCurrentDate(getWeekDayDate(4), 'en');
const todayDateStr = formatCurrentDate(new Date(), 'en');
const prevDateStr = formatCurrentDate(new Date(Date.now() - 86400000 * 2), 'en');

export const kSampleTasks: MobileTask[] = [
  {
    id: 't-1',
    title: 'Complete Weekly Report',
    durationMinutes: 45,
    priority: 'top3',
    energyLevel: 'high',
    status: 'todo',
    categoryName: 'Focus',
    categoryColor: '#2563EB',
    restMinutes: 15,
    dateDisplay: monDateStr,
    startHourDisplay: '09:30',
    focusType: 'High',
    needRestAfter: true,
  },
  {
    id: 't-2',
    title: 'Team Sync & Schedule Alignment',
    durationMinutes: 30,
    priority: 'top3',
    energyLevel: 'medium',
    status: 'todo',
    categoryName: 'Sync',
    categoryColor: '#0284C7',
    restMinutes: 10,
    dateDisplay: wedDateStr,
    startHourDisplay: '11:00',
    focusType: 'Medium',
    needRestAfter: true,
  },
  {
    id: 't-3',
    title: 'Organize Key Documents & Records',
    durationMinutes: 30,
    priority: 'top3',
    energyLevel: 'low',
    status: 'todo',
    categoryName: 'Admin',
    categoryColor: '#64748B',
    restMinutes: 10,
    dateDisplay: tueDateStr,
    startHourDisplay: '13:00',
    focusType: 'Low',
    needRestAfter: true,
  },
  {
    id: 't-4',
    title: 'Department Coordination Meeting',
    durationMinutes: 30,
    priority: 'normal',
    energyLevel: 'medium',
    status: 'todo',
    categoryName: 'Sync',
    categoryColor: '#0284C7',
    restMinutes: 10,
    dateDisplay: thuDateStr,
    startHourDisplay: '14:00',
    focusType: 'Medium',
    needRestAfter: true,
  },
  {
    id: 't-5',
    title: 'Prepare Presentation Slides',
    durationMinutes: 35,
    priority: 'normal',
    energyLevel: 'high',
    status: 'todo',
    categoryName: 'Focus',
    categoryColor: '#2563EB',
    restMinutes: 10,
    dateDisplay: thuDateStr,
    startHourDisplay: '14:40',
    focusType: 'High',
    needRestAfter: true,
  },
  {
    id: 't-6',
    title: 'Follow-up Email & Message Triage',
    durationMinutes: 25,
    priority: 'normal',
    energyLevel: 'low',
    status: 'todo',
    categoryName: 'Admin',
    categoryColor: '#64748B',
    restMinutes: 10,
    dateDisplay: friDateStr,
    startHourDisplay: '15:30',
    focusType: 'Low',
    needRestAfter: true,
  },
  {
    id: 't-7',
    title: 'Draft Monthly Activity Summary',
    durationMinutes: 30,
    priority: 'normal',
    energyLevel: 'medium',
    status: 'todo',
    categoryName: 'Focus',
    categoryColor: '#2563EB',
    restMinutes: 10,
    dateDisplay: wedDateStr,
    startHourDisplay: '16:00',
    focusType: 'High',
    needRestAfter: true,
    isRecurring: false,
  },
  {
    id: 't-8',
    title: 'Sort Invoices & Expense Receipts',
    durationMinutes: 20,
    priority: 'normal',
    energyLevel: 'low',
    status: 'todo',
    categoryName: 'Admin',
    categoryColor: '#64748B',
    restMinutes: 10,
    dateDisplay: tueDateStr,
    startHourDisplay: '16:30',
    focusType: 'Low',
    needRestAfter: true,
  },
  {
    id: 't-9',
    title: 'Lunch Break & Relaxing Walk',
    durationMinutes: 45,
    priority: 'low',
    energyLevel: 'low',
    status: 'todo',
    categoryName: 'Personal',
    categoryColor: '#059669',
    restMinutes: 0,
    dateDisplay: thuDateStr,
    startHourDisplay: '12:00',
    focusType: 'Low',
    needRestAfter: false,
  },
  {
    id: 't-10',
    title: 'Clean Desktop Workspace & Files',
    durationMinutes: 15,
    priority: 'low',
    energyLevel: 'low',
    status: 'todo',
    categoryName: 'Admin',
    categoryColor: '#64748B',
    restMinutes: 5,
    dateDisplay: monDateStr,
    startHourDisplay: '17:00',
    focusType: 'Low',
    needRestAfter: false,
  },
  // Recent tasks matching mockups
  {
    id: 't-oct3-1',
    title: 'Morning Walk & Light Stretching',
    durationMinutes: 30,
    priority: 'normal',
    energyLevel: 'medium',
    status: 'completed',
    categoryName: 'Personal',
    categoryColor: '#059669',
    restMinutes: 10,
    dateDisplay: prevDateStr,
    startHourDisplay: '08:30',
    focusType: 'Low',
    needRestAfter: true,
  },
  {
    id: 't-oct3-2',
    title: 'Review Weekly Expenses & Budget',
    durationMinutes: 30,
    priority: 'normal',
    energyLevel: 'low',
    status: 'completed',
    categoryName: 'Admin',
    categoryColor: '#64748B',
    restMinutes: 10,
    dateDisplay: prevDateStr,
    startHourDisplay: '09:15',
    focusType: 'Low',
    needRestAfter: true,
  },
  {
    id: 't-oct3-3',
    title: 'Project Progress Discussion',
    durationMinutes: 45,
    priority: 'top3',
    energyLevel: 'high',
    status: 'completed',
    categoryName: 'Sync',
    categoryColor: '#0284C7',
    restMinutes: 10,
    dateDisplay: prevDateStr,
    startHourDisplay: '11:40',
    focusType: 'High',
    needRestAfter: true,
  },
  {
    id: 't-oct3-4',
    title: 'Team Weekly Check-in',
    durationMinutes: 30,
    priority: 'top3',
    energyLevel: 'medium',
    status: 'todo',
    categoryName: 'Sync',
    categoryColor: '#0284C7',
    restMinutes: 10,
    dateDisplay: prevDateStr,
    startHourDisplay: '13:00',
    focusType: 'Medium',
    needRestAfter: true,
  },
  {
    id: 't-oct3-5',
    title: 'Draft Core Proposal Document',
    durationMinutes: 40,
    priority: 'normal',
    energyLevel: 'high',
    status: 'todo',
    categoryName: 'Focus',
    categoryColor: '#2563EB',
    restMinutes: 10,
    dateDisplay: prevDateStr,
    startHourDisplay: '14:30',
    focusType: 'High',
    needRestAfter: true,
  },
];

export const kSampleBacklog: BacklogTaskItem[] = [
  {
    id: 'backlog-1',
    title: 'Plan Next Quarter Key Milestones',
    durationMinutes: 45,
    categoryName: 'Focus',
    categoryColor: '#2563EB',
    focusType: 'High',
  },
  {
    id: 'backlog-2',
    title: 'Draft User Guide Documentation',
    durationMinutes: 30,
    categoryName: 'Sync',
    categoryColor: '#0284C7',
    focusType: 'Medium',
  },
  {
    id: 'backlog-3',
    title: 'Archive Completed Project Folders',
    durationMinutes: 20,
    categoryName: 'Admin',
    categoryColor: '#64748B',
    focusType: 'Low',
  },
];

interface FocientContextType {
  // Auth
  user: UserSession | null;
  isAuthenticated: boolean;
  isOtpPending: boolean;
  otpEmail: string;
  setOtpEmail: (email: string) => void;
  otpPurpose: 'register' | 'forgotPassword';
  setOtpPurpose: (purpose: 'register' | 'forgotPassword') => void;
  pendingRegistration: PendingRegistration | null;
  sendRegistrationOtp: (name: string, email: string, password?: string) => Promise<boolean>;
  resendOtp: () => Promise<boolean>;
  isResetPasswordPending: boolean;
  authView: AuthView;
  startOnboarding: () => void;
  login: (email: string, password?: string) => Promise<boolean>;
  loginAsGuest: (options?: { startOnboarding?: boolean } | React.MouseEvent | any) => Promise<void>;
  loginWithGoogle: (googleProfile?: { email: string; name: string; avatarUrl?: string }) => Promise<boolean>;
  startGoogleOAuth: (mode?: 'login' | 'register') => void;
  isGoogleAuthModalOpen: boolean;
  openGoogleAuthModal: (mode?: 'login' | 'register') => void;
  closeGoogleAuthModal: () => void;
  googleAuthMode: 'login' | 'register';
  register: (name: string, email: string, password?: string, overwrite?: boolean) => Promise<boolean>;
  cleanUser: (email: string) => Promise<boolean>;
  resetDb: () => Promise<boolean>;
  verifyOtp: (code: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (newPassword: string) => Promise<boolean>;
  cancelOtp: () => void;
  logout: () => void;
  setAuthView: (view: AuthView) => void;

  // Onboarding
  onboardingStep: number;
  onboardingUsername: string;
  selectedOccupancy: string | null;
  categories: WorkspaceCategory[];
  setCategories: (cats: WorkspaceCategory[]) => void;
  selectedRhythm: string | null;
  selectedStyle: string | null;
  startHour: string;
  endHour: string;
  focusHourStart: string;
  focusHourEnd: string;
  quietHourStart: string;
  quietHourEnd: string;
  quietHourEnabled: boolean;
  restMinutesPerTask: number;
  setOnboardingStep: (step: number) => void;
  setOnboardingUsername: (name: string) => void;
  setSelectedOccupancy: (occ: string | null) => void;
  addCategory: (cat: WorkspaceCategory) => void;
  updateCategory: (cat: WorkspaceCategory) => void;
  removeCategory: (id: string) => void;
  setSelectedRhythm: (rhythm: string | null) => void;
  setSelectedStyle: (style: string | null) => void;
  setQuietHours: (start: string, end: string, enabled?: boolean) => void;
  setTimeAllocation: (
    start: string,
    end: string,
    rest: number,
    focusStart?: string,
    focusEnd?: string,
    quietStart?: string,
    quietEnd?: string,
    quietEnabled?: boolean
  ) => void;
  completeOnboarding: () => void;

  // Tasks
  tasks: MobileTask[];
  addTask: (task: Omit<MobileTask, 'id'> & { id?: string }) => void;
  updateTask: (task: MobileTask) => void;
  removeTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  selectedCalendarDay: number;
  setSelectedCalendarDay: (day: number) => void;
  selectedDateTitle: string;
  selectedTaskForDetail: MobileTask | null;
  setSelectedTaskForDetail: (task: MobileTask | null) => void;

  // Planning & Rebalancer
  weeklyWorkloads: DailyWorkloadItem[];
  weekStartDay: WeekStartDay;
  setWeekStartDay: (day: WeekStartDay) => void;
  categoryBudgets: CategoryBudgetItem[];
  backlogTasks: BacklogTaskItem[];
  rebalanceProposal: RebalanceTaskProposal | null;
  rescheduleOverloadedTasks: () => void;
  keepCurrentSchedule: () => void;
  scheduleBacklogTask: (id: string, targetTime: string) => void;

  // Dashboard Reschedule Suggestion Alert
  rescheduleAlertResolved: boolean;
  rescheduleAlertDismissed: boolean;
  resolveRescheduleNow: () => void;
  dismissRescheduleLater: () => void;

  // UI state
  activeNavTab: ActiveNavTab;
  setActiveNavTab: (tab: ActiveNavTab) => void;
  inspectorView: ScreenInspectorView;
  setInspectorView: (view: ScreenInspectorView) => void;
  emptyStateMode: boolean;
  setEmptyStateMode: (empty: boolean) => void;
  devicePreview: DevicePreviewMode;
  setDevicePreview: (mode: DevicePreviewMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isTermsOpen: boolean;
  setIsTermsOpen: (open: boolean) => void;
  isAddTaskModalOpen: boolean;
  setIsAddTaskModalOpen: (open: boolean) => void;
  taskToEdit: MobileTask | null;
  initialTaskDate: string;
  setInitialTaskDate: (date: string) => void;
  openAddTaskModal: (taskToEdit?: MobileTask, defaultDate?: string) => void;
  closeAddTaskModal: () => void;

  // Toast
  toast: { message: string; type: 'success' | 'warning' | 'error' | 'info'; undoAction?: () => void } | null;
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info', undoAction?: () => void) => void;
  hideToast: () => void;

  // Navigation & Low-Friction Interaction
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isScrolled: boolean;
  setIsScrolled: (scrolled: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  isMobileKeyboardActive: boolean;
  setIsMobileKeyboardActive: (active: boolean) => void;
  calendarOffsetDays: number;
  activeCalendarDate: string;
  navigateDate: (direction: 'prev' | 'next' | 'today') => void;
  badgeCounts: {
    todayPlan: number;
    tasks: number;
    reschedule: number;
    insights: number;
    notifications: number;
  };
  draftContext: {
    isDirty: boolean;
    draftTitle?: string;
    onSaveDraft?: () => void;
    pendingNavTab?: ActiveNavTab | null;
  };
  setDraftContext: (ctx: { isDirty: boolean; draftTitle?: string; onSaveDraft?: () => void; pendingNavTab?: ActiveNavTab | null } | ((prev: { isDirty: boolean; draftTitle?: string; onSaveDraft?: () => void; pendingNavTab?: ActiveNavTab | null }) => { isDirty: boolean; draftTitle?: string; onSaveDraft?: () => void; pendingNavTab?: ActiveNavTab | null })) => void;
  isPreservationDialogOpen: boolean;
  setIsPreservationDialogOpen: (open: boolean) => void;
  safeNavigate: (tab: ActiveNavTab) => void;
  confirmPendingNavigation: (action: 'save' | 'discard' | 'cancel') => void;

  // Real-Time Data & Database Sync
  dbSyncStatus: 'connected' | 'syncing' | 'offline';
  isLiveDbSync: boolean;
  refreshTasksFromDb: () => Promise<void>;
  allocatedMinutes: number;

  // Settings & Real Database Preferences
  loadSettingsFromDb: () => Promise<void>;
  updateSettings: (newSettings: any, options?: { silent?: boolean }) => Promise<boolean>;

  // PWA & Web Notifications Engine
  notifications: AppNotification[];
  isNotificationPanelOpen: boolean;
  pwaPermission: NotificationPermission;
  unreadNotificationCount: number;
  openNotificationPanel: () => void;
  closeNotificationPanel: () => void;
  toggleNotificationPanel: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  addAppNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  requestPwaPermission: () => Promise<NotificationPermission>;
  triggerTaskReminder: (taskTitle: string, startHour: string, durationMinutes: number) => Promise<boolean>;
  triggerTaskLeadReminder: (taskTitle: string, startHour: string, leadHours: 1 | 3 | 6) => Promise<boolean>;
  triggerTop3DailyReminder: (top3Tasks: Array<{ title: string }>) => Promise<boolean>;
  triggerDailyQuietTimeSummary: (completedCount: number, restMinutes: number) => Promise<boolean>;
  triggerScheduleRecommendation: (workloadPercent: number, allocatedMinutes: number, capacityMinutes: number) => Promise<boolean>;
  triggerWorkloadAlert: (workloadPercent: number, allocatedMinutes: number, capacityMinutes: number, type?: 'high' | 'low') => Promise<boolean>;
  triggerDailySummary: (completedCount: number, restMinutes: number) => Promise<boolean>;
  triggerRestBufferAlert: (restMinutes: number) => Promise<boolean>;
  triggerWebPushTest: () => Promise<{ success: boolean; sentCount?: number; message?: string }>;
}

/**
 * Tab title naming resolution strictly following FoCient design specification:
 * - Landing page: "FoCient"
 * - All other pages: "[nama page] - FoCient"
 * - Zero decorative icons or emojis (no bell/alert icons)
 */
export function resolveDocumentTitle({
  authView,
  activeNavTab,
  inspectorView,
  language = 'id',
  isAuthenticated = false,
  pathname = '',
}: {
  authView?: AuthView;
  activeNavTab?: ActiveNavTab;
  inspectorView?: ScreenInspectorView;
  language?: Language;
  isAuthenticated?: boolean;
  pathname?: string;
}): string {
  // 1. Inspector Overrides (development testing)
  if (inspectorView && inspectorView !== 'fullFlow') {
    if (inspectorView === 'landing' || inspectorView === 'welcome') {
      return 'FoCient';
    }
    let inspectorPage = '';
    switch (inspectorView) {
      case 'login':
        inspectorPage = language === 'en' ? 'Log In' : 'Masuk';
        break;
      case 'register':
        inspectorPage = language === 'en' ? 'Sign Up' : 'Daftar';
        break;
      case 'forgotPassword':
        inspectorPage = language === 'en' ? 'Forgot Password' : 'Lupa Kata Sandi';
        break;
      case 'resetPassword':
        inspectorPage = language === 'en' ? 'Reset Password' : 'Reset Kata Sandi';
        break;
      case 'step1Workspace':
      case 'step2Rhythm':
      case 'step3Time':
      case 'step4Task':
      case 'step5Review':
        inspectorPage = 'Onboarding';
        break;
      case 'dashboard':
        inspectorPage = 'Dashboard';
        break;
      case 'todayPlan':
        inspectorPage = language === 'en' ? "Today's Plan" : 'Rencana Hari Ini';
        break;
      case 'taskList':
        inspectorPage = language === 'en' ? 'Tasks' : 'Daftar Tugas';
        break;
      case 'reschedule':
        inspectorPage = language === 'en' ? 'Reschedule' : 'Penyesuaian Jadwal';
        break;
      case 'insights':
        inspectorPage = language === 'en' ? 'Insights' : 'Refleksi';
        break;
      case 'settings':
        inspectorPage = language === 'en' ? 'Settings' : 'Pengaturan';
        break;
      case 'addTask':
        inspectorPage = language === 'en' ? 'Add Task' : 'Tambah Tugas';
        break;
      default:
        inspectorPage = '';
    }
    return inspectorPage ? `${inspectorPage} - FoCient` : 'FoCient';
  }

  const cleanPath = (pathname || '').toLowerCase();

  // 2. Landing page exception: strictly 'FoCient' without page name
  if (cleanPath === '/' || cleanPath === '/welcome') {
    return 'FoCient';
  }
  if (authView === 'landing' || authView === 'welcome') {
    return 'FoCient';
  }

  // 3. Auth views / pages & marketing pages
  let pageName = '';
  if (cleanPath.startsWith('/about')) {
    pageName = language === 'en' ? 'About Us' : 'Tentang Kami';
  } else if (cleanPath.startsWith('/guidance')) {
    pageName = language === 'en' ? 'Guidance' : 'Panduan';
  } else if (authView === 'login' || cleanPath.startsWith('/login') || cleanPath.startsWith('/auth/login')) {
    pageName = language === 'en' ? 'Log In' : 'Masuk';
  } else if (authView === 'register' || cleanPath.startsWith('/register') || cleanPath.startsWith('/auth/register')) {
    pageName = language === 'en' ? 'Sign Up' : 'Daftar';
  } else if (authView === 'forgotPassword' || cleanPath.startsWith('/forgot-password') || cleanPath.startsWith('/auth/forgot-password')) {
    pageName = language === 'en' ? 'Forgot Password' : 'Lupa Kata Sandi';
  } else if (authView === 'resetPassword' || cleanPath.startsWith('/reset-password') || cleanPath.startsWith('/auth/reset-password')) {
    pageName = language === 'en' ? 'Reset Password' : 'Reset Kata Sandi';
  } else if (authView === 'otp' || cleanPath.startsWith('/verify-otp') || cleanPath.startsWith('/auth/verify-otp') || cleanPath.startsWith('/auth/otp')) {
    pageName = language === 'en' ? 'Verify OTP' : 'Verifikasi OTP';
  } else if (authView === 'onboarding' || cleanPath.startsWith('/onboarding')) {
    pageName = 'Onboarding';
  } else {
    // 4. Main app authenticated screens / tabs
    if (activeNavTab === 'dashboard' || cleanPath.startsWith('/dashboard')) {
      pageName = 'Dashboard';
    } else if (activeNavTab === 'plan' || cleanPath.startsWith('/plan') || cleanPath.startsWith('/today')) {
      pageName = language === 'en' ? "Today's Plan" : 'Rencana Hari Ini';
    } else if (activeNavTab === 'tasks' || cleanPath.startsWith('/tasks')) {
      pageName = language === 'en' ? 'Tasks' : 'Daftar Tugas';
    } else if (activeNavTab === 'reschedule' || cleanPath.startsWith('/rescheduling')) {
      pageName = language === 'en' ? 'Reschedule' : 'Penyesuaian Jadwal';
    } else if (activeNavTab === 'insights' || cleanPath.startsWith('/insights')) {
      pageName = language === 'en' ? 'Insights' : 'Refleksi';
    } else if (activeNavTab === 'settings' || cleanPath.startsWith('/settings')) {
      pageName = language === 'en' ? 'Settings' : 'Pengaturan';
    } else if (activeNavTab === 'addTask') {
      pageName = language === 'en' ? 'Add Task' : 'Tambah Tugas';
    } else {
      pageName = 'Dashboard';
    }
  }

  return pageName ? `${pageName} - FoCient` : 'FoCient';
}

const FocientContext = createContext<FocientContextType | null>(null);

export function FocientProvider({ children }: { children: React.ReactNode }) {
  // Auth state
  const [user, setUser] = useState<UserSession | null>(() => {
    if (typeof window !== 'undefined') {
      return authClient.getUser();
    }
    return null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return authClient.isAuthenticated();
    }
    return false;
  });
  const [isOtpPending, setIsOtpPending] = useState<boolean>(false);
  const [pendingRegistration, setPendingRegistration] = useState<PendingRegistration | null>(() => {
    if (typeof window !== 'undefined') {
      return authClient.getPendingRegistration();
    }
    return null;
  });
  const [otpEmail, setOtpEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const pending = authClient.getPendingRegistration();
      if (pending?.email) return pending.email;
      const urlParams = new URLSearchParams(window.location.search);
      const emailParam = urlParams.get('email');
      if (emailParam) return emailParam;
    }
    return '';
  });
  const [otpPurpose, setOtpPurpose] = useState<'register' | 'forgotPassword'>('register');
  const [isResetPasswordPending, setIsResetPasswordPending] = useState<boolean>(false);
  const [authView, setAuthView] = useState<AuthView>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/login') || path.startsWith('/auth/login')) return 'login';
      if (path.startsWith('/register') || path.startsWith('/auth/register')) return 'register';
      if (path.startsWith('/forgot-password') || path.startsWith('/auth/forgot-password')) return 'forgotPassword';
      if (path.startsWith('/reset-password') || path.startsWith('/auth/reset-password')) return 'resetPassword';
      if (path.startsWith('/verify-otp') || path.startsWith('/auth/verify-otp') || path.startsWith('/auth/otp')) return 'otp';
      if (path.startsWith('/onboarding')) return 'onboarding';
      if (path.startsWith('/dashboard') || path.startsWith('/plan') || path.startsWith('/tasks') || path.startsWith('/insights') || path.startsWith('/settings') || path.startsWith('/rescheduling')) {
        return 'dashboard';
      }
    }
    return 'landing';
  });

  // Google OAuth state (Native GIS & Standard OAuth 2.0 Popup)
  const [isGoogleAuthModalOpen, setIsGoogleAuthModalOpen] = useState<boolean>(false);
  const [googleAuthMode, setGoogleAuthMode] = useState<'login' | 'register'>('login');

  const startGoogleOAuth = useCallback((mode: 'login' | 'register' = 'login') => {
    if (typeof window === 'undefined') return;
    setGoogleAuthMode(mode);

    // Standard centered Google OAuth 2.0 popup window dimensions
    const width = 500;
    const height = 620;
    const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
    const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));

    const popupUrl = `/api/auth/google?mode=${mode}`;
    const popup = window.open(
      popupUrl,
      'GoogleOAuthPopup',
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
    );

    if (popup) {
      popup.focus();
    }
  }, []);

  const openGoogleAuthModal = useCallback((mode: 'login' | 'register' = 'login') => {
    // Deprecated in-app modal redirecting directly to official Google OAuth popup flow
    startGoogleOAuth(mode);
  }, [startGoogleOAuth]);

  const closeGoogleAuthModal = useCallback(() => {
    setIsGoogleAuthModalOpen(false);
  }, []);

  // Restore authenticated session from localStorage and verify with /api/auth/me on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedUser = authClient.getUser();
    const token = authClient.getToken();

    if (token) {
      if (savedUser) {
        setUser(savedUser);
        setIsAuthenticated(true);
        if (savedUser.isOnboardingCompleted) {
          setOnboardingStep(5);
          if (savedUser.name) setOnboardingUsername(savedUser.name);
          if (savedUser.workHourStart || savedUser.startWorkTime) {
            setStartHour(savedUser.workHourStart || savedUser.startWorkTime || '');
          }
          if (savedUser.workHourEnd || savedUser.endWorkTime) {
            setEndHour(savedUser.workHourEnd || savedUser.endWorkTime || '17:00');
          }
          if (savedUser.workingRhythm) setSelectedRhythm(savedUser.workingRhythm);
          if (savedUser.schedulingStyle) setSelectedStyle(savedUser.schedulingStyle);
          if (savedUser.occupancy || savedUser.roleArchetype) {
            setSelectedOccupancy(savedUser.occupancy || savedUser.roleArchetype || null);
          }
          if (savedUser.restTimePerTask !== undefined) {
            setRestMinutesPerTask(savedUser.restTimePerTask);
          }
          if (savedUser.quietHourStart) setQuietHourStart(savedUser.quietHourStart);
          if (savedUser.quietHourEnd) setQuietHourEnd(savedUser.quietHourEnd);
          if (savedUser.quietHourEnabled !== undefined) setQuietHourEnabled(savedUser.quietHourEnabled);
          if (Array.isArray((savedUser as any).categories) && (savedUser as any).categories.length > 0) {
            setCategories(
              (savedUser as any).categories.map((c: any) => ({
                id: c.id,
                name: c.name,
                colorHex: c.colorToken || c.colorHex || '#0284C7',
                focusType: resolveCategoryFocusType(c),
                isDefault: Boolean(c.isDefault),
              }))
            );
          }
          try {
            const userTasks = window.localStorage.getItem(`focient_web_tasks_${savedUser.id}`);
            if (userTasks) {
              const parsed = JSON.parse(userTasks);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setTasks(parsed);
              }
            }
          } catch {}
        } else {
          setOnboardingStep(1);
          setSelectedOccupancy(null);
          setCategories([]);
          setSelectedRhythm(null);
          setSelectedStyle(null);
          setStartHour('');
          setEndHour('');
          setQuietHourStart('');
          setQuietHourEnd('');
          setQuietHourEnabled(false);
          setTasks([]);
          setBacklogTasks([]);
        }
      }

      // Verify token integrity and synchronize real profile with PostgreSQL backend
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.status === 401) {
            authClient.clearSession();
            setUser(null);
            setIsAuthenticated(false);
            setOnboardingStep(0);
            return null;
          }
          if (!res.ok) {
            throw new Error(`Auth verification failed (${res.status})`);
          }
          return res.json();
        })
        .then((data) => {
          if (data?.success && data?.user) {
            authClient.setSession(token, data.user);
            setUser(data.user);
            setIsAuthenticated(true);
            if (data.user.isOnboardingCompleted) {
              if (data.user.name) {
                setOnboardingUsername(data.user.name);
              }
              setOnboardingStep(5);
              if (data.user.workHourStart || data.user.startWorkTime) {
                setStartHour(data.user.workHourStart || data.user.startWorkTime);
              }
              if (data.user.workHourEnd || data.user.endWorkTime) {
                setEndHour(data.user.workHourEnd || data.user.endWorkTime);
              }
              if (data.user.workingRhythm) setSelectedRhythm(data.user.workingRhythm);
              if (data.user.schedulingStyle) setSelectedStyle(data.user.schedulingStyle);
              if (data.user.occupancy || data.user.roleArchetype) {
                setSelectedOccupancy(data.user.occupancy || data.user.roleArchetype);
              }
              if (data.user.restTimePerTask !== undefined) {
                setRestMinutesPerTask(data.user.restTimePerTask);
              }
              if (data.user.quietHourStart) setQuietHourStart(data.user.quietHourStart);
              if (data.user.quietHourEnd) setQuietHourEnd(data.user.quietHourEnd);
              if (data.user.quietHourEnabled !== undefined) setQuietHourEnabled(data.user.quietHourEnabled);
              if (Array.isArray(data.user.categories) && data.user.categories.length > 0) {
                setCategories(
                  data.user.categories.map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    colorHex: c.colorToken || c.colorHex || '#0284C7',
                    focusType: resolveCategoryFocusType(c),
                    isDefault: Boolean(c.isDefault),
                  }))
                );
              }
            } else {
              setOnboardingStep(1);
              setSelectedOccupancy(null);
              setCategories([]);
              setSelectedRhythm(null);
              setSelectedStyle(null);
              setStartHour('');
              setEndHour('');
              setQuietHourStart('');
              setQuietHourEnd('');
              setQuietHourEnabled(false);
              setTasks([]);
              setBacklogTasks([]);
            }
          } else {
            authClient.clearSession();
            setUser(null);
            setIsAuthenticated(false);
            setOnboardingStep(0);
          }
        })
        .catch(() => {
          // If server is temporarily unreachable, preserve validated cached user session
          if (!savedUser) {
            authClient.clearSession();
            setUser(null);
            setIsAuthenticated(false);
            setOnboardingStep(0);
          }
        });
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setOnboardingStep(0);
    }
  }, []);

  // Onboarding state (Clean starting state matching mobile app architecture)
  const [onboardingStep, setOnboardingStep] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const u = authClient.getUser();
      if (u) {
        if (u.isOnboardingCompleted === false && window.location.pathname.startsWith('/onboarding')) {
          return 1;
        }
        return 5;
      }
    }
    return 1;
  });
  const [onboardingUsername, setOnboardingUsername] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const u = authClient.getUser();
      if (u?.name) return u.name;
    }
    return '';
  });
  const [selectedOccupancy, setSelectedOccupancy] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const u = authClient.getUser();
      if (u?.isOnboardingCompleted && (u?.occupancy || u?.roleArchetype)) {
        return u.occupancy || u.roleArchetype || null;
      }
    }
    return null;
  });
  const [categories, setCategories] = useState<WorkspaceCategory[]>(() => {
    if (typeof window !== 'undefined') {
      const u = authClient.getUser();
      if (u?.isOnboardingCompleted && Array.isArray((u as any).categories) && (u as any).categories.length > 0) {
        return (u as any).categories.map((c: any) => ({
          id: c.id,
          name: c.name,
          colorHex: c.colorToken || c.colorHex || '#0284C7',
          focusType: resolveCategoryFocusType(c),
          isDefault: Boolean(c.isDefault),
        }));
      }
    }
    return [];
  });
  const [selectedRhythm, setSelectedRhythm] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const u = authClient.getUser();
      if (u?.isOnboardingCompleted && u?.workingRhythm) return u.workingRhythm;
    }
    return null;
  });
  const [selectedStyle, setSelectedStyle] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const u = authClient.getUser();
      if (u?.isOnboardingCompleted && u?.schedulingStyle) return u.schedulingStyle;
    }
    return null;
  });
  const [startHour, setStartHour] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const u = authClient.getUser();
      if (u?.isOnboardingCompleted && (u?.workHourStart || u?.startWorkTime)) {
        return u.workHourStart || u.startWorkTime || '';
      }
    }
    return '';
  });
  const [endHour, setEndHour] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const u = authClient.getUser();
      if (u?.isOnboardingCompleted && (u?.workHourEnd || u?.endWorkTime)) {
        return u.workHourEnd || u.endWorkTime || '';
      }
    }
    return '';
  });
  const [focusHourStart, setFocusHourStart] = useState<string>('');
  const [focusHourEnd, setFocusHourEnd] = useState<string>('');
  const [quietHourStart, setQuietHourStart] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const u = authClient.getUser();
      if (u?.quietHourStart) return u.quietHourStart;
    }
    return '';
  });
  const [quietHourEnd, setQuietHourEnd] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const u = authClient.getUser();
      if (u?.quietHourEnd) return u.quietHourEnd;
    }
    return '';
  });
  const [quietHourEnabled, setQuietHourEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const u = authClient.getUser();
      if (u?.quietHourEnabled !== undefined) return u.quietHourEnabled;
    }
    return true;
  });
  const [restMinutesPerTask, setRestMinutesPerTask] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const u = authClient.getUser();
      if (u?.restTimePerTask !== undefined) return u.restTimePerTask;
    }
    return 10;
  });

  // Tasks state (Initialized with real data from localStorage or empty)
  const [emptyStateMode, setEmptyStateMode] = useState<boolean>(false);
  const [tasks, setTasks] = useState<MobileTask[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const u = authClient.getUser();
        // New or onboarding users always start with 0 tasks
        if (u && u.isOnboardingCompleted === false) {
          return [];
        }
        if (u?.id) {
          const stored = window.localStorage.getItem(`focient_web_tasks_${u.id}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
          }
        } else {
          const stored = window.localStorage.getItem('focient_web_tasks');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
          }
        }
      } catch {}
    }
    return [];
  });
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(() => new Date().getDate());
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<MobileTask | null>(null);

  const [weekStartDay, setWeekStartDayState] = useState<WeekStartDay>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem('focient_week_start_day');
        if (saved === 'sunday' || saved === 'monday') return saved;
      } catch {}
    }
    return 'monday';
  });

  const setWeekStartDay = useCallback((day: WeekStartDay) => {
    setWeekStartDayState(day);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('focient_week_start_day', day);
      } catch {}
    }
    setUser((prev) => {
      if (!prev) return prev;
      const updated: UserSession = {
        ...prev,
        weekStartDay: day,
      };
      if (typeof window !== 'undefined') {
        try {
          authClient.setSession(authClient.getToken() || 'focient_token', updated);
        } catch {}
      }
      return updated;
    });
  }, []);

  // Planning state
  const [weeklyWorkloads, setWeeklyWorkloads] = useState<DailyWorkloadItem[]>(() => {
    let initialStart: WeekStartDay = 'monday';
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem('focient_week_start_day');
        if (saved === 'sunday' || saved === 'monday') initialStart = saved;
      } catch {}
    }
    let initialLang: Language = 'id';
    if (typeof window !== 'undefined') {
      try {
        const savedLang = window.localStorage.getItem('focient_language');
        if (savedLang === 'en' || savedLang === 'id') initialLang = savedLang;
      } catch {}
    }
    const keys = getWeekDayKeys(initialStart, initialLang);
    return keys.map((key, i) => ({
      dayKey: key,
      fullDayName: getDayOfWeekName(i, initialLang, initialStart),
      percentage: 0,
    }));
  });

  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudgetItem[]>([
    { name: 'Strategic', allocatedMinutes: 0, maxMinutes: 180, colorHex: '#7C3AED' },
    { name: 'Execution', allocatedMinutes: 0, maxMinutes: 240, colorHex: '#0284C7' },
    { name: 'Meeting', allocatedMinutes: 0, maxMinutes: 120, colorHex: '#B45309' },
    { name: 'Personal', allocatedMinutes: 0, maxMinutes: 90, colorHex: '#059669' },
  ]);

  const [backlogTasks, setBacklogTasks] = useState<BacklogTaskItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem('focient_web_backlog');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return [];
  });
  const [rebalanceProposal, setRebalanceProposal] = useState<RebalanceTaskProposal | null>(null);

  // Reschedule alert on dashboard
  const [rescheduleAlertResolved, setRescheduleAlertResolved] = useState<boolean>(false);
  const [rescheduleAlertDismissed, setRescheduleAlertDismissed] = useState<boolean>(false);

  // UI state
  const [activeNavTab, setActiveNavTab] = useState<ActiveNavTab>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/plan') || path.startsWith('/today')) return 'plan';
      if (path.startsWith('/tasks')) return 'tasks';
      if (path.startsWith('/rescheduling')) return 'reschedule';
      if (path.startsWith('/insights')) return 'insights';
      if (path.startsWith('/settings')) return 'settings';
      if (path.startsWith('/dashboard')) return 'dashboard';
    }
    return 'dashboard';
  });
  const [inspectorView, setInspectorView] = useState<ScreenInspectorView>('fullFlow');
  const [devicePreview, setDevicePreview] = useState<DevicePreviewMode>('responsive');
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem('focient_language');
        if (saved === 'en' || saved === 'id') return saved;
      } catch {}
    }
    return 'id';
  });

  const setLanguage = useCallback((action: Language | ((prev: Language) => Language)) => {
    setLanguageState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('focient_language', next);
        } catch {}
      }
      return next;
    });
  }, []);
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState<boolean>(false);
  const [taskToEdit, setTaskToEdit] = useState<MobileTask | null>(null);
  const [initialTaskDate, setInitialTaskDate] = useState<string>('');

  // Toast
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
    undoAction?: () => void;
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info', undoAction?: () => void) => {
      setToast({ message, type, undoAction });
      setTimeout(() => {
        setToast((current) => (current?.message === message ? null : current));
      }, 4500);
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Listen for Google OAuth postMessage completion from the popup window
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'FOCIENT_GOOGLE_AUTH_SUCCESS') {
        const { token, user: userSession, isNewUser } = event.data;
        if (token && userSession) {
          authClient.setSession(token, userSession);
          setUser(userSession);
          setIsAuthenticated(true);
          if (isNewUser || userSession.isOnboardingCompleted === false) {
            setOnboardingStep(1);
            setOnboardingUsername('');
            setSelectedOccupancy(null);
            setCategories([]);
            setSelectedRhythm(null);
            setSelectedStyle(null);
            setStartHour('');
            setEndHour('');
            setRestMinutesPerTask(10);
            setTasks([]);
            setBacklogTasks([]);
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem('focient_web_tasks');
              if (userSession.id) {
                window.localStorage.removeItem(`focient_web_tasks_${userSession.id}`);
              }
            }
            setAuthView('onboarding');
            showToast(
              language === 'id'
                ? 'Akun Google terhubung! Selamat datang di FoCient.'
                : 'Google account connected! Welcome to FoCient.',
              'success'
            );
          } else {
            setOnboardingUsername(userSession.name || userSession.email.split('@')[0]);
            setOnboardingStep(5);
            setActiveNavTab('dashboard');
            setAuthView('dashboard');
            showToast(
              language === 'id'
                ? `Selamat datang kembali, ${userSession.name}!`
                : `Welcome back, ${userSession.name}!`,
              'success'
            );
          }
        }
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [language, showToast]);

  // Database & Real-Time Sync State
  const [dbSyncStatus, setDbSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');
  const isLiveDbSync = dbSyncStatus === 'connected' || dbSyncStatus === 'syncing';

  // Calculate live allocated minutes across today's active tasks
  const allocatedMinutes = useMemo(() => {
    const today = new Date();
    return tasks
      .filter((t) => !t.isBacklog && t.status !== 'completed' && isTaskOnDate(t.dateDisplay, today, t))
      .reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
  }, [tasks]);

  // Dynamically compute categoryBudgets based on real user categories and active tasks for today
  useEffect(() => {
    const activeCats =
      categories.length > 0
        ? categories
        : [
            { id: 'c1', name: 'Strategic', colorHex: '#7C3AED', focusType: 'High' as const, isDefault: true },
            { id: 'c2', name: 'Execution', colorHex: '#0284C7', focusType: 'Medium' as const, isDefault: true },
            { id: 'c3', name: 'Meeting', colorHex: '#B45309', focusType: 'Medium' as const, isDefault: true },
            { id: 'c4', name: 'Personal', colorHex: '#059669', focusType: 'Low' as const, isDefault: true },
          ];

    const capacity = calculateCapacityMinutes(user?.workHourStart, user?.workHourEnd);
    const budgetPerCategory = Math.max(60, Math.round(capacity * 0.4));
    const today = new Date();

    const computedBudgets: CategoryBudgetItem[] = activeCats.map((cat) => {
      const allocated = tasks
        .filter((t) => !t.isBacklog && t.status !== 'completed' && t.categoryName === cat.name && isTaskOnDate(t.dateDisplay, today, t))
        .reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
      return {
        name: cat.name,
        allocatedMinutes: allocated,
        maxMinutes: budgetPerCategory,
        colorHex: cat.colorHex,
      };
    });

    setCategoryBudgets(computedBudgets);
  }, [tasks, categories, user?.workHourStart, user?.workHourEnd]);

  // Memoized unified backlog tasks combining tasks with isBacklog: true and any standalone backlog items
  const allBacklogTasks = useMemo(() => {
    const fromTasks: BacklogTaskItem[] = tasks
      .filter((t) => t.isBacklog && t.status !== 'completed')
      .map((t) => ({
        id: t.id,
        title: t.title,
        durationMinutes: t.durationMinutes,
        categoryName: t.categoryName,
        categoryColor: t.categoryColor,
        focusType: t.focusType,
        restMinutes: t.restMinutes,
      }));
    const taskIds = new Set(fromTasks.map((t) => t.id));
    const extra = backlogTasks.filter((b) => !taskIds.has(b.id));
    return [...fromTasks, ...extra];
  }, [tasks, backlogTasks]);

  // Dynamically compute weeklyWorkloads and rebalance proposals from real user tasks and capacity baseline
  useEffect(() => {
    const capacity = calculateCapacityMinutes(user?.workHourStart, user?.workHourEnd);
    const dayKeyList = getWeekDayKeys(weekStartDay, language);
    const dayKeys = dayKeyList.map((dayKey, index) => ({ dayKey, index }));

    const computedWorkloads: DailyWorkloadItem[] = dayKeys.map((day) => {
      const weekDayDate = getWeekDayDate(day.index, undefined, weekStartDay);
      const dayTasks = tasks.filter((t) => {
        if (t.isBacklog) return false;
        return isTaskOnDate(t.dateDisplay, weekDayDate, t);
      });

      const totalMinutes = dayTasks.reduce(
        (sum, t) => sum + (t.durationMinutes || 0) + (t.restMinutes || 0),
        0
      );

      const percentage = capacity > 0 ? Math.min(100, Math.round((totalMinutes / capacity) * 100)) : 0;

      return {
        dayKey: day.dayKey,
        fullDayName: getDayOfWeekName(day.index, language, weekStartDay),
        percentage,
      };
    });

    setWeeklyWorkloads(computedWorkloads);

    // 1. Conflict Check: Direct time schedule collision / overlapping tasks on any day
    let collisionCandidate: {
      candidateTask: MobileTask;
      conflictingWith: MobileTask;
      dayIndex: number;
      dayName: string;
      suggestedSlot: string;
      buffer: number;
    } | null = null;

    if (!rescheduleAlertResolved && !rescheduleAlertDismissed) {
      for (const day of dayKeys) {
        const weekDayDate = getWeekDayDate(day.index, undefined, weekStartDay);
        const dayTasks = tasks
          .filter(
            (t) =>
              !t.isBacklog &&
              t.status !== 'completed' &&
              isTaskOnDate(t.dateDisplay, weekDayDate, t) &&
              t.startHourDisplay &&
              t.startHourDisplay.includes(':')
          )
          .sort(
            (a, b) =>
              (parseTime24ToMinutes(a.startHourDisplay) ?? 0) -
              (parseTime24ToMinutes(b.startHourDisplay) ?? 0)
          );

        for (let i = 0; i < dayTasks.length - 1; i++) {
          const t1 = dayTasks[i];
          const t2 = dayTasks[i + 1];
          const t1Start = parseTime24ToMinutes(t1.startHourDisplay);
          const t2Start = parseTime24ToMinutes(t2.startHourDisplay);
          if (t1Start !== null && t2Start !== null) {
            const t1Duration = t1.durationMinutes || 30;
            const t1Buffer = t1.restMinutes ?? 10;
            const t1EarliestFree = t1Start + t1Duration + t1Buffer;
            if (t2Start < t1Start + t1Duration) {
              const shiftHour = String(Math.floor(t1EarliestFree / 60) % 24).padStart(2, '0');
              const shiftMin = String(t1EarliestFree % 60).padStart(2, '0');
              collisionCandidate = {
                candidateTask: t2,
                conflictingWith: t1,
                dayIndex: day.index,
                dayName: getDayOfWeekName(day.index, language, weekStartDay),
                suggestedSlot: `${shiftHour}:${shiftMin}`,
                buffer: t1Buffer,
              };
              break;
            }
          }
        }
        if (collisionCandidate) break;
      }
    }

    if (collisionCandidate) {
      setRebalanceProposal({
        id: collisionCandidate.candidateTask.id,
        title: collisionCandidate.candidateTask.title,
        previousSchedule: `${collisionCandidate.dayName}, ${collisionCandidate.candidateTask.startHourDisplay || '15:00'}`,
        newSchedule: `${collisionCandidate.dayName}, ${collisionCandidate.suggestedSlot} (${language === 'id' ? 'Jeda' : 'Buffer'}: ${collisionCandidate.buffer}m)`,
        taskDurationMinutes: collisionCandidate.candidateTask.durationMinutes,
        restDurationMinutes: collisionCandidate.buffer,
        categoryName: collisionCandidate.candidateTask.categoryName,
        categoryColor: collisionCandidate.candidateTask.categoryColor,
      });
      return;
    }

    // 2. Overload check (> 80% capacity is nearing / over threshold)
    const overloadedDay = computedWorkloads.find((d) => d.percentage > 80);
    if (overloadedDay && !rescheduleAlertResolved && !rescheduleAlertDismissed) {
      const dayIndex = dayKeys.find((dk) => dk.dayKey === overloadedDay.dayKey)?.index ?? 0;
      const dayDate = getWeekDayDate(dayIndex, undefined, weekStartDay);
      const dayTasks = tasks.filter((t) => {
        if (t.isBacklog || t.status === 'completed') return false;
        return isTaskOnDate(t.dateDisplay, dayDate, t);
      });

      const candidateTask = dayTasks.find((t) => t.priority !== 'top3') || dayTasks[0];
      if (candidateTask) {
        // Find a lighter day in the week with percentage < 65%
        const lighterDay =
          computedWorkloads.find((d) => d.percentage < 65 && d.dayKey !== overloadedDay.dayKey) ||
          computedWorkloads[(dayKeys.findIndex((dk) => dk.dayKey === overloadedDay.dayKey) + 1) % 7];

        const currentRhythm = user?.workingRhythm || (user as any)?.energyRhythm || selectedRhythm || 'Steady Pacer';
        const currentStyle = user?.schedulingStyle || selectedStyle || 'Structured';
        const isHighFocus = candidateTask.focusType === 'High' || candidateTask.focusType === 'Deep Focus';

        // Retain candidateTask's configured rest buffer or user's preference without restricting it
        const userRestPref = restMinutesPerTask > 0 ? restMinutesPerTask : (user?.restTimePerTask ?? 10);
        const taskRestBuffer = candidateTask.restMinutes !== undefined && candidateTask.restMinutes !== null
          ? candidateTask.restMinutes
          : userRestPref;

        let recommendedTimeSlot = '10:00';
        if (currentStyle === 'Structured') {
          if (isHighFocus) {
            recommendedTimeSlot = currentRhythm === 'Early Bird' ? '09:00' : currentRhythm === 'Night Owl' ? '18:30' : '10:00';
          } else {
            recommendedTimeSlot = '14:30';
          }
        } else {
          recommendedTimeSlot = isHighFocus ? '11:00' : '15:00';
        }

        setRebalanceProposal({
          id: candidateTask.id,
          title: candidateTask.title,
          previousSchedule: `${overloadedDay.fullDayName}, ${candidateTask.startHourDisplay || '14:00'}`,
          newSchedule: `${lighterDay.fullDayName}, ${recommendedTimeSlot} (${language === 'id' ? 'Jeda' : 'Buffer'}: ${taskRestBuffer}m)`,
          taskDurationMinutes: candidateTask.durationMinutes,
          restDurationMinutes: taskRestBuffer,
          categoryName: candidateTask.categoryName,
          categoryColor: candidateTask.categoryColor,
        });
      } else {
        setRebalanceProposal(null);
      }
    } else {
      setRebalanceProposal(null);
    }
  }, [tasks, user?.workHourStart, user?.workHourEnd, user?.workHoursLimit, user?.workingRhythm, user?.schedulingStyle, selectedRhythm, selectedStyle, language, weekStartDay, rescheduleAlertResolved, rescheduleAlertDismissed]);

  const refreshTasksFromDb = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      setDbSyncStatus('syncing');
      const token = authClient.getToken();
      const res = await fetch('/api/tasks', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: MobileTask[] = data.map((t: any) => ({
            id: t.id,
            title: t.title,
            durationMinutes: t.durationMinutes || 25,
            priority: (t.priority === 'TOP_3' || t.priority === 'top3') ? 'top3' : t.priority === 'LOW' ? 'low' : 'normal',
            energyLevel: t.energyLevel === 'HIGH' ? 'high' : t.energyLevel === 'LOW' ? 'low' : 'medium',
            status: (t.status === 'COMPLETED' || t.status === 'completed') ? 'completed' : 'todo',
            categoryName: t.categoryName || 'Execution',
            categoryColor: t.categoryColor || '#0284C7',
            focusType: (t.focusType === 'Deep Focus' ? 'High' : t.focusType === 'Light' ? 'Low' : t.focusType || 'High') as FocusType,
            restMinutes: t.restMinutes ?? 10,
            dateDisplay: t.dateDisplay || formatCurrentDate(new Date(), language),
            startHourDisplay: t.startHourDisplay || '10:00 AM',
            needRestAfter: true,
            isBacklog: Boolean(t.isBacklog),
          }));

          if (mapped.length > 0) {
            const activeTasks = mapped.filter((t) => !t.isBacklog);
            const backlog = mapped.filter((t) => t.isBacklog);

            setTasks(mapped);
            const mappedBacklogItems = backlog.map((t) => ({
              id: t.id,
              title: t.title,
              durationMinutes: t.durationMinutes,
              categoryName: t.categoryName,
              categoryColor: t.categoryColor,
              focusType: t.focusType,
              restMinutes: t.restMinutes,
            }));
            setBacklogTasks(mappedBacklogItems);

            if (typeof window !== 'undefined') {
              const activeUserId = user?.id || authClient.getUser()?.id;
              const storageKey = activeUserId ? `focient_web_tasks_${activeUserId}` : 'focient_web_tasks';
              window.localStorage.setItem(storageKey, JSON.stringify(mapped));
              window.localStorage.setItem('focient_web_backlog', JSON.stringify(mappedBacklogItems));
            }
          } else if (typeof window !== 'undefined') {
            const activeUser = user || authClient.getUser();
            // NEVER recover old sample tasks into an onboarding user session
            if (!activeUser || activeUser.isOnboardingCompleted === false) {
              setTasks([]);
              setBacklogTasks([]);
              setDbSyncStatus('connected');
              return;
            }
            const activeUserId = activeUser.id;
            const storageKey = activeUserId ? `focient_web_tasks_${activeUserId}` : null;
            if (storageKey) {
              const cached = window.localStorage.getItem(storageKey);
              if (cached) {
                try {
                  const parsed = JSON.parse(cached);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    setTasks(parsed);
                    for (const t of parsed) {
                      fetch('/api/tasks', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        body: JSON.stringify(t),
                      }).catch(() => {});
                    }
                  }
                } catch {}
              }
            }
          }
          setDbSyncStatus('connected');
        } else {
          setDbSyncStatus('connected');
        }
      } else {
        setDbSyncStatus('offline');
      }
    } catch {
      setDbSyncStatus('offline');
    }
  }, [user?.id, language]);

  const loadSettingsFromDb = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      const token = authClient.getToken();
      const res = await fetch('/api/settings', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const serverWeekStart = data.user.weekStartDay;
          if (serverWeekStart === 'sunday' || serverWeekStart === 'monday') {
            setWeekStartDayState(serverWeekStart);
            if (typeof window !== 'undefined') {
              try {
                window.localStorage.setItem('focient_week_start_day', serverWeekStart);
              } catch {}
            }
          }
          const updatedUserObj: UserSession = {
            ...(user || ({} as any)),
            ...data.user,
            workHourStart: data.user.startWorkTime || data.user.workHourStart || '09:00',
            workHourEnd: data.user.endWorkTime || data.user.workHourEnd || '17:00',
            dailyCapacityMinutes: data.user.dailyCapacityMinutes || 480,
            weekStartDay:
              serverWeekStart === 'sunday' || serverWeekStart === 'monday'
                ? serverWeekStart
                : weekStartDay || 'monday',
          };
          setUser(updatedUserObj);
          if (token) {
            authClient.setSession(token, updatedUserObj);
          }
          if (data.user.isOnboardingCompleted) {
            setOnboardingStep(5);
            if (data.user.roleArchetype) setSelectedOccupancy(data.user.roleArchetype);
            if (data.user.workingRhythm) setSelectedRhythm(data.user.workingRhythm);
            if (data.user.schedulingStyle) setSelectedStyle(data.user.schedulingStyle);
            if (data.user.startWorkTime) setStartHour(data.user.startWorkTime);
            if (data.user.endWorkTime) setEndHour(data.user.endWorkTime);
            if (data.user.restTimePerTask) setRestMinutesPerTask(data.user.restTimePerTask);
            if (Array.isArray(data.categories) && data.categories.length > 0) {
              setCategories(
                data.categories.map((c: any) => ({
                  id: c.id,
                  name: c.name,
                  colorHex: c.colorToken || c.colorHex || '#0284C7',
                  focusType: resolveCategoryFocusType(c),
                  isDefault: Boolean(c.isDefault),
                }))
              );
            }
          }
        }
      }
    } catch (err) {
      console.warn('loadSettingsFromDb warning:', err);
    }
  }, []);

  const updateSettings = useCallback(
    async (newSettings: any, options?: { silent?: boolean }): Promise<boolean> => {
      try {
        // Optimistic UI updates
        if (newSettings.name) {
          setUser((prev) => (prev ? { ...prev, name: newSettings.name } : null));
        }
        if (newSettings.roleArchetype) {
          setUser((prev) => (prev ? { ...prev, roleArchetype: newSettings.roleArchetype } : null));
          setSelectedOccupancy(newSettings.roleArchetype);
        }
        if (newSettings.startWorkTime) {
          setStartHour(newSettings.startWorkTime);
          setUser((prev) => (prev ? { ...prev, workHourStart: newSettings.startWorkTime } : null));
        }
        if (newSettings.endWorkTime) {
          setEndHour(newSettings.endWorkTime);
          setUser((prev) => (prev ? { ...prev, workHourEnd: newSettings.endWorkTime } : null));
        }
        if (newSettings.dailyCapacityMinutes) {
          setUser((prev) => (prev ? { ...prev, dailyCapacityMinutes: newSettings.dailyCapacityMinutes } : null));
        }
        if (newSettings.restTimePerTask) {
          setRestMinutesPerTask(newSettings.restTimePerTask);
        }
        if (newSettings.workingRhythm) {
          setSelectedRhythm(newSettings.workingRhythm);
          setUser((prev) => (prev ? { ...prev, workingRhythm: newSettings.workingRhythm } : null));
          if (newSettings.workingRhythm === 'Early Bird') {
            setFocusHourStart('07:00');
            setFocusHourEnd('12:00');
          } else if (newSettings.workingRhythm === 'Steady Pacer') {
            setFocusHourStart('09:00');
            setFocusHourEnd('15:00');
          } else if (newSettings.workingRhythm === 'Night Owl') {
            setFocusHourStart('18:00');
            setFocusHourEnd('00:00');
          }
          if (typeof window !== 'undefined') {
            const token = authClient.getToken();
            const curr = authClient.getUser();
            if (curr && token) {
              authClient.setSession(token, { ...curr, workingRhythm: newSettings.workingRhythm });
            }
          }
        }
        if (newSettings.schedulingStyle) setSelectedStyle(newSettings.schedulingStyle);
        if (newSettings.weekStartDay === 'sunday' || newSettings.weekStartDay === 'monday') {
          setWeekStartDay(newSettings.weekStartDay);
        }
        if (newSettings.quietHourStart || newSettings.preferences?.quietHoursStart) {
          setQuietHourStart(newSettings.quietHourStart || newSettings.preferences?.quietHoursStart);
        }
        if (newSettings.quietHourEnd || newSettings.preferences?.quietHoursEnd) {
          setQuietHourEnd(newSettings.quietHourEnd || newSettings.preferences?.quietHoursEnd);
        }

        // Persist to PostgreSQL via /api/settings
        const token = authClient.getToken();
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(newSettings),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser((prev) => (prev ? { ...data.user, ...prev } : data.user));
            if (data.user.weekStartDay === 'sunday' || data.user.weekStartDay === 'monday') {
              setWeekStartDayState(data.user.weekStartDay);
              if (typeof window !== 'undefined') {
                try {
                  window.localStorage.setItem('focient_week_start_day', data.user.weekStartDay);
                } catch {}
              }
            }
            if (typeof window !== 'undefined') {
              const token = authClient.getToken() || 'focient_token';
              const currentUser = authClient.getUser() || user;
              if (currentUser) {
                authClient.setSession(token, {
                  ...currentUser,
                  ...data.user,
                  ...(newSettings || {}),
                });
              }
            }
          }
          if (!options?.silent) {
            showToast(
              language === 'id' ? 'Pengaturan berhasil disimpan ke database' : 'Settings saved to database',
              'success'
            );
          }
          return true;
        }
        return false;
      } catch (error) {
        if (!options?.silent) {
          showToast(language === 'id' ? 'Gagal menyimpan pengaturan' : 'Failed to save settings', 'error');
        }
        return false;
      }
    },
    [language, showToast, user]
  );

  // Real-time synchronization & SSE listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    refreshTasksFromDb();
    loadSettingsFromDb();

    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/realtime');
      es.onopen = () => setDbSyncStatus('connected');
      es.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'sync' || msg.type === 'heartbeat') {
            setDbSyncStatus('connected');
          }
        } catch {}
      };
      es.onerror = () => setDbSyncStatus('offline');
    } catch {
      setDbSyncStatus('offline');
    }

    return () => {
      es?.close();
    };
  }, [refreshTasksFromDb]);

  // Browser Storage Persistence ($0 operational cost, local-first client)
  useEffect(() => {
    if (typeof window !== 'undefined' && !emptyStateMode) {
      try {
        const stored =
          window.localStorage.getItem(user?.id ? `focient_web_tasks_${user.id}` : 'focient_web_tasks') ||
          window.localStorage.getItem('focient_web_tasks');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTasks(parsed);
          }
        }
      } catch {
        // ignore
      }
    }
  }, [user?.id, emptyStateMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('focient_web_tasks', JSON.stringify(tasks));
        if (user?.id) {
          window.localStorage.setItem(`focient_web_tasks_${user.id}`, JSON.stringify(tasks));
        }
      } catch {
        // ignore
      }
    }
  }, [tasks, user?.id]);

  // Sync Empty State Mode
  const emptyStateFirstMount = useRef(true);
  useEffect(() => {
    if (emptyStateFirstMount.current) {
      emptyStateFirstMount.current = false;
      return;
    }
    if (emptyStateMode) {
      setTasks([]);
      setBacklogTasks([]);
      const currentKeys = getWeekDayKeys(weekStartDay, language);
      setWeeklyWorkloads(
        currentKeys.map((key, i) => ({
          dayKey: key,
          fullDayName: getDayOfWeekName(i, language, weekStartDay),
          percentage: 0,
        }))
      );
      setCategoryBudgets([
        { name: language === 'id' ? 'Fokus' : 'Focus', allocatedMinutes: 0, colorHex: '#2563EB' },
        { name: language === 'id' ? 'Komunikasi' : 'Sync', allocatedMinutes: 0, colorHex: '#0284C7' },
        { name: language === 'id' ? 'Administrasi' : 'Admin', allocatedMinutes: 0, colorHex: '#64748B' },
        { name: language === 'id' ? 'Pribadi' : 'Personal', allocatedMinutes: 0, colorHex: '#059669' },
      ]);
      setRebalanceProposal(null);
    } else {
      setTasks(kSampleTasks);
      setBacklogTasks(kSampleBacklog);
      const currentKeys = getWeekDayKeys(weekStartDay, language);
      const samplePercentages = [65, 75, 92, 55, 60, 20, 10];
      setWeeklyWorkloads(
        currentKeys.map((key, i) => ({
          dayKey: key,
          fullDayName: getDayOfWeekName(i, language, weekStartDay),
          percentage: samplePercentages[i] ?? 50,
        }))
      );
      setCategoryBudgets([
        { name: language === 'id' ? 'Fokus' : 'Focus', allocatedMinutes: 150, maxMinutes: 180, colorHex: '#2563EB' },
        { name: language === 'id' ? 'Komunikasi' : 'Sync', allocatedMinutes: 90, maxMinutes: 120, colorHex: '#0284C7' },
        { name: language === 'id' ? 'Administrasi' : 'Admin', allocatedMinutes: 60, maxMinutes: 90, colorHex: '#64748B' },
        { name: language === 'id' ? 'Pribadi' : 'Personal', allocatedMinutes: 60, maxMinutes: 90, colorHex: '#059669' },
      ]);
      setRebalanceProposal({
        id: 'reb-1',
        title: language === 'id' ? 'Selesaikan Laporan Mingguan' : 'Complete Weekly Report',
        previousSchedule: language === 'id' ? 'Rabu, 14:00 - 15:00' : 'Wednesday, 14:00 - 15:00',
        newSchedule: language === 'id' ? 'Kamis, 10:00 - 11:00 (Jeda: 15m)' : 'Thursday, 10:00 - 11:00 (Buffer: 15m)',
        taskDurationMinutes: 45,
        restDurationMinutes: 15,
        categoryName: language === 'id' ? 'Fokus' : 'Focus',
        categoryColor: '#2563EB',
      });
    }
  }, [emptyStateMode]);

  // Auth actions
  const login = useCallback(async (email: string, password = ''): Promise<boolean> => {
    try {
      const res = await authClient.login(email, password);
      if (res.success && res.user) {
        const onboardedUser: UserSession = {
          ...res.user,
          isOnboardingCompleted: true,
        };
        setUser(onboardedUser);
        setIsAuthenticated(true);
        setActiveNavTab('dashboard');
        setAuthView('dashboard');
        setOnboardingStep(5);
        authClient.setSession(res.token || authClient.getToken() || 'focient_token', onboardedUser);

        // Synchronize user work availability hours, rhythm, occupancy & rest buffer
        const start = onboardedUser.workHourStart || onboardedUser.startWorkTime || '09:00';
        const end = onboardedUser.workHourEnd || onboardedUser.endWorkTime || '17:00';
        setStartHour(start);
        setEndHour(end);
        if (onboardedUser.workingRhythm) setSelectedRhythm(onboardedUser.workingRhythm);
        if (onboardedUser.schedulingStyle) setSelectedStyle(onboardedUser.schedulingStyle);
        if (onboardedUser.occupancy || onboardedUser.roleArchetype) {
          setSelectedOccupancy(onboardedUser.occupancy || onboardedUser.roleArchetype || null);
        }
        if (onboardedUser.restTimePerTask !== undefined) {
          setRestMinutesPerTask(onboardedUser.restTimePerTask);
        }

        // Synchronize categories
        const cats = (res as any).categories || (res.user as any)?.categories;
        if (Array.isArray(cats) && cats.length > 0) {
          setCategories(
            cats.map((c: any) => ({
              id: c.id,
              name: c.name,
              colorHex: c.colorToken || c.colorHex || '#0284C7',
              focusType: resolveCategoryFocusType(c),
              isDefault: Boolean(c.isDefault),
            }))
          );
        } else {
          loadSettingsFromDb();
        }

        // Optimistically load user-scoped tasks from localStorage
        if (typeof window !== 'undefined') {
          try {
            const userTasks = window.localStorage.getItem(`focient_web_tasks_${onboardedUser.id}`);
            if (userTasks) {
              const parsed = JSON.parse(userTasks);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setTasks(parsed);
              }
            }
          } catch {}
        }

        // Refresh tasks from server / local database
        refreshTasksFromDb();

        return true;
      }
      throw new Error(res.message || (language === 'id' ? 'Email atau kata sandi tidak cocok' : 'Invalid email or password'));
    } catch (err: any) {
      throw err;
    }
  }, [language, loadSettingsFromDb, refreshTasksFromDb]);

  const loginAsGuest = useCallback(async (options?: { startOnboarding?: boolean } | React.MouseEvent | any) => {
    const isId = language === 'id';
    const guestId = `usr_guest_${Date.now()}`;
    const generalCategories = isId ? kOccupancyCategoryTemplatesId.General : kOccupancyCategoryTemplates.General;
    const shouldStartOnboarding = Boolean(options && typeof options === 'object' && 'startOnboarding' in options ? options.startOnboarding : true);

    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.token && data.user) {
          const guestUser: UserSession = {
            ...data.user,
            roleArchetype: 'General',
            occupancy: 'General',
            categories: generalCategories,
            isOnboardingCompleted: !shouldStartOnboarding,
          };
          authClient.setSession(data.token, guestUser);
          setUser(guestUser);
          setIsAuthenticated(true);
          setSelectedOccupancy('General');
          setCategories(generalCategories);
          if (shouldStartOnboarding) {
            setOnboardingStep(1);
            setActiveNavTab('dashboard');
            setAuthView('onboarding');
          } else {
            setActiveNavTab('dashboard');
            setAuthView('dashboard');
            setOnboardingStep(5);
          }
          showToast(
            isId
              ? shouldStartOnboarding
                ? 'Masuk ke Demonstrasi Onboarding FoCient (5 Langkah)'
                : 'Masuk sebagai Mode Tamu (Profil Umum)'
              : shouldStartOnboarding
              ? 'Entered FoCient Onboarding Demonstration (5 Steps)'
              : 'Signed in with Guest Session (General Role)',
            'info'
          );
          return;
        }
      }
    } catch {}

    const guestSession: UserSession = {
      id: guestId,
      name: isId ? 'Tamu FoCient' : 'FoCient Guest',
      email: `guest_${Date.now()}@demo.focient.local`,
      roleArchetype: 'General',
      occupancy: 'General',
      workingRhythm: 'Steady Pacer',
      schedulingStyle: 'Structured',
      workHourStart: '09:00',
      workHourEnd: '17:00',
      startWorkTime: '09:00',
      endWorkTime: '17:00',
      dailyCapacityMinutes: 480,
      restTimePerTask: 10,
      provider: 'guest',
      isOnboardingCompleted: !shouldStartOnboarding,
      categories: generalCategories,
    };

    authClient.setSession(`focient_token_${Date.now()}`, guestSession);
    setUser(guestSession);
    setIsAuthenticated(true);
    setSelectedOccupancy('General');
    setCategories(generalCategories);
    setStartHour('09:00');
    setEndHour('17:00');
    setSelectedRhythm('Steady Pacer');
    setSelectedStyle('Structured');
    setRestMinutesPerTask(10);
    if (shouldStartOnboarding) {
      setOnboardingStep(1);
      setActiveNavTab('dashboard');
      setAuthView('onboarding');
    } else {
      setOnboardingStep(5);
      setActiveNavTab('dashboard');
      setAuthView('dashboard');
    }

    const todayStr = formatCurrentDate(new Date(), 'en');
    const demoTasks: MobileTask[] = isId
      ? [
          {
            id: `t-demo-1-${Date.now()}`,
            title: 'Selesaikan Laporan Mingguan',
            durationMinutes: 45,
            priority: 'top3',
            energyLevel: 'high',
            status: 'todo',
            categoryName: 'Fokus',
            categoryColor: '#2563EB',
            restMinutes: 10,
            dateDisplay: todayStr,
            startHourDisplay: '09:30',
            focusType: 'High',
            needRestAfter: true,
          },
          {
            id: `t-demo-2-${Date.now()}`,
            title: 'Koordinasi Tim & Diskusi Jadwal',
            durationMinutes: 30,
            priority: 'top3',
            energyLevel: 'medium',
            status: 'todo',
            categoryName: 'Komunikasi',
            categoryColor: '#0284C7',
            restMinutes: 10,
            dateDisplay: todayStr,
            startHourDisplay: '11:00',
            focusType: 'Medium',
            needRestAfter: true,
          },
          {
            id: `t-demo-3-${Date.now()}`,
            title: 'Rapikan Dokumen & Arsip Kerja',
            durationMinutes: 30,
            priority: 'top3',
            energyLevel: 'low',
            status: 'todo',
            categoryName: 'Administrasi',
            categoryColor: '#64748B',
            restMinutes: 10,
            dateDisplay: todayStr,
            startHourDisplay: '14:00',
            focusType: 'Low',
            needRestAfter: true,
          },
          {
            id: `t-demo-4-${Date.now()}`,
            title: 'Jalan Santai & Istirahat Siang',
            durationMinutes: 45,
            priority: 'normal',
            energyLevel: 'low',
            status: 'completed',
            categoryName: 'Pribadi',
            categoryColor: '#059669',
            restMinutes: 0,
            dateDisplay: todayStr,
            startHourDisplay: '12:00',
            focusType: 'Low',
            needRestAfter: false,
          },
          {
            id: `t-demo-5-${Date.now()}`,
            title: 'Cek Email & Tindak Lanjut Pesan',
            durationMinutes: 20,
            priority: 'normal',
            energyLevel: 'low',
            status: 'todo',
            categoryName: 'Administrasi',
            categoryColor: '#64748B',
            restMinutes: 5,
            dateDisplay: todayStr,
            startHourDisplay: '15:00',
            focusType: 'Low',
            needRestAfter: false,
          },
        ]
      : [
          {
            id: `t-demo-1-${Date.now()}`,
            title: 'Complete Weekly Report',
            durationMinutes: 45,
            priority: 'top3',
            energyLevel: 'high',
            status: 'todo',
            categoryName: 'Focus',
            categoryColor: '#2563EB',
            restMinutes: 10,
            dateDisplay: todayStr,
            startHourDisplay: '09:30',
            focusType: 'High',
            needRestAfter: true,
          },
          {
            id: `t-demo-2-${Date.now()}`,
            title: 'Team Sync & Schedule Alignment',
            durationMinutes: 30,
            priority: 'top3',
            energyLevel: 'medium',
            status: 'todo',
            categoryName: 'Sync',
            categoryColor: '#0284C7',
            restMinutes: 10,
            dateDisplay: todayStr,
            startHourDisplay: '11:00',
            focusType: 'Medium',
            needRestAfter: true,
          },
          {
            id: `t-demo-3-${Date.now()}`,
            title: 'Organize Key Documents & Records',
            durationMinutes: 30,
            priority: 'top3',
            energyLevel: 'low',
            status: 'todo',
            categoryName: 'Admin',
            categoryColor: '#64748B',
            restMinutes: 10,
            dateDisplay: todayStr,
            startHourDisplay: '14:00',
            focusType: 'Low',
            needRestAfter: true,
          },
          {
            id: `t-demo-4-${Date.now()}`,
            title: 'Lunch Break & Relaxing Walk',
            durationMinutes: 45,
            priority: 'normal',
            energyLevel: 'low',
            status: 'completed',
            categoryName: 'Personal',
            categoryColor: '#059669',
            restMinutes: 0,
            dateDisplay: todayStr,
            startHourDisplay: '12:00',
            focusType: 'Low',
            needRestAfter: false,
          },
          {
            id: `t-demo-5-${Date.now()}`,
            title: 'Clean Email Inbox & Follow-ups',
            durationMinutes: 20,
            priority: 'normal',
            energyLevel: 'low',
            status: 'todo',
            categoryName: 'Admin',
            categoryColor: '#64748B',
            restMinutes: 5,
            dateDisplay: todayStr,
            startHourDisplay: '15:00',
            focusType: 'Low',
            needRestAfter: false,
          },
        ];

    setTasks(demoTasks);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(`focient_web_tasks_${guestId}`, JSON.stringify(demoTasks));
      } catch {}
    }

    const demoBacklog: BacklogTaskItem[] = isId
      ? [
          {
            id: 'backlog-1',
            title: 'Rencanakan Agenda Pekan Depan',
            durationMinutes: 30,
            categoryName: 'Fokus',
            categoryColor: '#2563EB',
            focusType: 'High',
          },
          {
            id: 'backlog-2',
            title: 'Arsip Catatan Rapat Bulanan',
            durationMinutes: 25,
            categoryName: 'Administrasi',
            categoryColor: '#64748B',
            focusType: 'Low',
          },
        ]
      : [
          {
            id: 'backlog-1',
            title: 'Plan Next Week Key Milestones',
            durationMinutes: 30,
            categoryName: 'Focus',
            categoryColor: '#2563EB',
            focusType: 'High',
          },
          {
            id: 'backlog-2',
            title: 'Archive Monthly Meeting Notes',
            durationMinutes: 25,
            categoryName: 'Admin',
            categoryColor: '#64748B',
            focusType: 'Low',
          },
        ];
    setBacklogTasks(demoBacklog);

    if (shouldStartOnboarding) {
      setOnboardingStep(1);
      setActiveNavTab('dashboard');
      setAuthView('onboarding');
      showToast(
        isId
          ? 'Masuk ke Demonstrasi Onboarding FoCient (5 Langkah)'
          : 'Entered FoCient Onboarding Demonstration (5 Steps)',
        'info'
      );
    } else {
      setOnboardingStep(5);
      setActiveNavTab('dashboard');
      setAuthView('dashboard');
      showToast(isId ? 'Masuk sebagai Mode Tamu (Profil Umum)' : 'Signed in with Guest Session (General Role)', 'info');
    }
  }, [language, showToast]);

  const loginWithGoogle = useCallback(
    async (googleProfile?: { email: string; name: string; avatarUrl?: string }): Promise<boolean> => {
      try {
        const res = await authClient.loginWithGoogle(googleProfile);
        if (res.success && res.user) {
          const googleUser: UserSession = {
            ...res.user,
            isOnboardingCompleted: true,
          };
          setUser(googleUser);
          setIsAuthenticated(true);
          setActiveNavTab('dashboard');
          setAuthView('dashboard');
          setOnboardingStep(5);
          authClient.setSession(authClient.getToken() || 'focient_token', googleUser);

          // Synchronize profile attributes
          const start = googleUser.workHourStart || googleUser.startWorkTime || '09:00';
          const end = googleUser.workHourEnd || googleUser.endWorkTime || '17:00';
          setStartHour(start);
          setEndHour(end);
          if (googleUser.workingRhythm) setSelectedRhythm(googleUser.workingRhythm);
          if (googleUser.schedulingStyle) setSelectedStyle(googleUser.schedulingStyle);
          if (googleUser.occupancy || googleUser.roleArchetype) {
            setSelectedOccupancy(googleUser.occupancy || googleUser.roleArchetype || null);
          }
          if (googleUser.restTimePerTask !== undefined) {
            setRestMinutesPerTask(googleUser.restTimePerTask);
          }

          loadSettingsFromDb();
          refreshTasksFromDb();

          showToast(
            language === 'id'
              ? `Selamat datang kembali, ${googleUser.name}!`
              : `Welcome back, ${googleUser.name}!`,
            'success'
          );
          return true;
        }
        showToast(res.message || (language === 'id' ? 'Gagal masuk dengan Google' : 'Google sign-in failed'), 'error');
        return false;
      } catch {
        showToast(language === 'id' ? 'Gagal masuk dengan Google' : 'Google sign-in failed', 'error');
        return false;
      }
    },
    [language, showToast, loadSettingsFromDb, refreshTasksFromDb]
  );

  const sendRegistrationOtp = useCallback(async (name: string, email: string, password = ''): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const pendingData = { name: cleanName, email: cleanEmail, password };

    setPendingRegistration(pendingData);
    authClient.setPendingRegistration(pendingData);
    setOtpEmail(cleanEmail);
    setOtpPurpose('register');
    setIsOtpPending(true);
    setAuthView('otp');

    try {
      const res = await authClient.sendOtp(cleanEmail, cleanName);
      if (res.success) {
        if (res.devCode) {
          const updated = { ...pendingData, devCode: res.devCode };
          setPendingRegistration(updated);
          authClient.setPendingRegistration(updated);
        }
        showToast(
          res.delivered
            ? (language === 'id' ? `Kode OTP verifikasi telah dikirim ke ${cleanEmail}` : `Verification OTP has been sent to ${cleanEmail}`)
            : (language === 'id' ? `Kode OTP telah dibuat untuk ${cleanEmail}` : `Verification OTP generated for ${cleanEmail}`),
          'info'
        );
        return true;
      }
      showToast(res.message || (language === 'id' ? 'Gagal mengirim kode verifikasi' : 'Failed to send verification code'), 'error');
      return false;
    } catch {
      showToast(
        language === 'id' ? `Kode OTP verifikasi telah dikirim ke ${cleanEmail}` : `Verification code sent to ${cleanEmail}`,
        'info'
      );
      return true;
    }
  }, [language, showToast]);

  const resendOtp = useCallback(async (): Promise<boolean> => {
    const emailToUse = otpEmail || pendingRegistration?.email || '';
    if (!emailToUse) return false;
    try {
      const res = await authClient.sendOtp(emailToUse, pendingRegistration?.name || '');
      if (res.devCode && pendingRegistration) {
        const updated = { ...pendingRegistration, devCode: res.devCode };
        setPendingRegistration(updated);
        authClient.setPendingRegistration(updated);
      }
      showToast(
        res.delivered
          ? (language === 'id' ? `Kode baru telah dikirim ke ${emailToUse}` : `A new verification code has been sent to ${emailToUse}`)
          : (language === 'id' ? `Kode baru telah dibuat untuk ${emailToUse}` : `A new verification code generated for ${emailToUse}`),
        'info'
      );
      return res.success;
    } catch {
      showToast(
        language === 'id' ? 'Kode baru telah dikirim' : 'A new verification code has been sent',
        'info'
      );
      return true;
    }
  }, [otpEmail, pendingRegistration, language, showToast]);

  const cleanUser = useCallback(async (email: string): Promise<boolean> => {
    return authClient.cleanUser(email);
  }, []);

  const resetDb = useCallback(async (): Promise<boolean> => {
    return authClient.resetDb();
  }, []);

  const register = useCallback(
    async (name: string, email: string, password = '', overwrite = false): Promise<boolean> => {
      try {
        const res = await authClient.register(name, email, password, overwrite);
        if (res.success && res.user) {
          setUser(res.user);
          setOtpEmail(email);
          setOnboardingUsername(name || email.split('@')[0]);
          setIsAuthenticated(true);
          setSelectedOccupancy(null);
          setCategories([]);
          setSelectedRhythm(null);
          setSelectedStyle(null);
          setStartHour('');
          setEndHour('');
          setQuietHourStart('');
          setQuietHourEnd('');
          setQuietHourEnabled(false);
          setTasks([]);
          setBacklogTasks([]);
          setNotifications([]);
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('focient_web_tasks');
            window.localStorage.removeItem('focient_notifications');
            if (res.user.id) {
              window.localStorage.removeItem(`focient_web_tasks_${res.user.id}`);
              window.localStorage.removeItem(`focient_notifications_${res.user.id}`);
            }
          }
          setOnboardingStep(1);
          setAuthView('onboarding');
          return true;
        }
        throw new Error(res.message || (language === 'id' ? 'Gagal mendaftar' : 'Registration failed'));
      } catch (err: unknown) {
        throw err;
      }
    },
    [language]
  );

  const verifyOtp = useCallback(async (code: string): Promise<boolean> => {
    if (code.length < 6) {
      showToast(
        language === 'id' ? 'Masukkan kode 6 digit lengkap' : 'Please enter the complete 6-digit code',
        'warning'
      );
      return false;
    }

    if (otpPurpose === 'forgotPassword') {
      setIsOtpPending(false);
      setIsResetPasswordPending(true);
      showToast(
        language === 'id' ? 'Kode terverifikasi. Silakan ubah kata sandi' : 'Code verified. Enter your new password',
        'success'
      );
      return true;
    }

    // Register purpose -> verify OTP code and complete user registration
    const currentPending = pendingRegistration || authClient.getPendingRegistration();
    const emailToUse = otpEmail || currentPending?.email || 'demo@focient.dev';
    const nameToUse = currentPending?.name || onboardingUsername || emailToUse.split('@')[0];
    const passwordToUse = currentPending?.password || '';

    try {
      const res = await authClient.verifyOtp(emailToUse, code, nameToUse, passwordToUse);
      if (res.success && res.user) {
        setIsOtpPending(false);
        setUser(res.user);
        setIsAuthenticated(true);
        setOnboardingStep(1);
        setOnboardingUsername('');
        setSelectedOccupancy(null);
        setCategories([]);
        setSelectedRhythm(null);
        setSelectedStyle(null);
        setStartHour('');
        setEndHour('');
        setRestMinutesPerTask(10);
        setTasks([]);
        setBacklogTasks([]);
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('focient_web_tasks');
          if (res.user?.id) {
            window.localStorage.removeItem(`focient_web_tasks_${res.user.id}`);
          }
        }
        authClient.clearPendingRegistration();
        showToast(
          language === 'id' ? 'Akun terverifikasi! Mari atur ruang kerja Anda' : 'Account verified! Let’s set up your workspace',
          'success'
        );
        return true;
      }
      showToast(
        res.message || (language === 'id' ? 'Kode OTP tidak cocok' : 'Invalid OTP code'),
        'error'
      );
      return false;
    } catch {
      showToast(
        language === 'id' ? 'Verifikasi gagal. Silakan coba kembali.' : 'Verification failed. Please try again.',
        'error'
      );
      return false;
    }
  }, [otpPurpose, pendingRegistration, otpEmail, onboardingUsername, language, showToast]);

  const forgotPassword = useCallback(async (email: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    setOtpEmail(cleanEmail);
    setOtpPurpose('forgotPassword');
    setIsOtpPending(false);
    setIsResetPasswordPending(true);

    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('focient_reset_email', cleanEmail);
      } catch {}
    }

    try {
      await authClient.forgotPassword(cleanEmail);
    } catch (err: any) {
      if (err?.message?.includes('tidak ditemukan') || err?.message?.includes('not found')) {
        showToast(
          language === 'id' ? 'Akun dengan email tersebut tidak ditemukan.' : 'Account with that email was not found.',
          'error'
        );
        throw err;
      }
      console.warn('Backend forgot-password notice:', err);
    }

    setAuthView('resetPassword');
    showToast(
      language === 'id'
        ? `Silakan masukkan kata sandi baru untuk akun ${cleanEmail}`
        : `Please enter a new password for ${cleanEmail}`,
      'info'
    );
    return true;
  }, [language, showToast]);

  const resetPassword = useCallback(async (newPassword: string): Promise<boolean> => {
    const emailToUse =
      otpEmail ||
      (typeof window !== 'undefined' ? sessionStorage.getItem('focient_reset_email') : null) ||
      '';

    if (!emailToUse) {
      showToast(
        language === 'id'
          ? 'Email tidak ditemukan. Silakan masukkan email di halaman lupa kata sandi.'
          : 'Email not found. Please re-enter your email in forgot password.',
        'error'
      );
      setAuthView('forgotPassword');
      return false;
    }

    try {
      await authClient.resetPassword(emailToUse, newPassword);
      setIsResetPasswordPending(false);
      setAuthView('login');
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem('focient_reset_email');
        } catch {}
      }
      showToast(
        language === 'id'
          ? 'Kata sandi berhasil diperbarui. Silakan masuk dengan kata sandi baru Anda.'
          : 'Password updated successfully. Please log in with your new password.',
        'success'
      );
      return true;
    } catch (err: any) {
      showToast(
        err?.message || (language === 'id' ? 'Gagal memperbarui kata sandi' : 'Failed to update password'),
        'error'
      );
      return false;
    }
  }, [otpEmail, language, showToast]);

  const cancelOtp = useCallback(() => {
    setIsOtpPending(false);
    setIsResetPasswordPending(false);
    setAuthView('login');
  }, []);

  const startOnboarding = useCallback(() => {
    setOnboardingStep(1);
    setAuthView('register');
  }, []);

  const logout = useCallback(async () => {
    await authClient.logout();
    authClient.clearSession();
    const currentUserId = user?.id;
    setUser(null);
    setIsAuthenticated(false);
    setIsOtpPending(false);
    setIsResetPasswordPending(false);
    setOnboardingStep(1);
    setActiveNavTab('dashboard');
    setAuthView('landing');
    setTasks([]);
    setBacklogTasks([]);
    setCategories([]);
    setNotifications([]);
    setSelectedOccupancy(null);
    setSelectedRhythm(null);
    setSelectedStyle(null);
    setStartHour('');
    setEndHour('');
    setRestMinutesPerTask(10);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('focient_web_tasks');
        window.localStorage.removeItem('focient_web_backlog');
        window.localStorage.removeItem('focient_notifications');
        if (currentUserId) {
          window.localStorage.removeItem(`focient_notifications_${currentUserId}`);
          window.localStorage.removeItem(`focient_web_tasks_${currentUserId}`);
        }
        window.sessionStorage.clear();
      } catch {}
      if (typeof document !== 'undefined') {
        document.title = 'FoCient';
      }
    }
    showToast(language === 'id' ? 'Berhasil keluar dari akun' : 'Logged out successfully', 'info');
  }, [user?.id, language, showToast]);

  // Onboarding actions
  const addCategory = useCallback((cat: WorkspaceCategory) => {
    setCategories((prev) => (prev.some((c) => c.name.toLowerCase() === cat.name.toLowerCase()) ? prev : [...prev, cat]));
  }, []);

  const updateCategory = useCallback((cat: WorkspaceCategory) => {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, ...cat } : c)));
  }, []);

  const removeCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleSetSelectedRhythm = useCallback((rhythm: string | null) => {
    setSelectedRhythm(rhythm);
    if (rhythm === 'Early Bird') {
      setFocusHourStart('07:00');
      setFocusHourEnd('12:00');
    } else if (rhythm === 'Steady Pacer') {
      setFocusHourStart('09:00');
      setFocusHourEnd('15:00');
    } else if (rhythm === 'Night Owl') {
      setFocusHourStart('18:00');
      setFocusHourEnd('00:00');
    }
    setUser((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        workingRhythm: rhythm || prev.workingRhythm,
      };
      if (typeof window !== 'undefined') {
        const token = authClient.getToken();
        if (token) {
          authClient.setSession(token, updated);
        }
      }
      return updated;
    });
  }, []);

  const setQuietHours = useCallback((start: string, end: string, enabled: boolean = true) => {
    setQuietHourStart(start);
    setQuietHourEnd(end);
    setQuietHourEnabled(enabled);
    setUser((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        quietHourStart: start,
        quietHourEnd: end,
        quietHourEnabled: enabled,
      };
      if (typeof window !== 'undefined') {
        const token = authClient.getToken();
        if (token) authClient.setSession(token, updated);
      }
      return updated;
    });
  }, []);

  const setTimeAllocation = useCallback((
    start: string,
    end: string,
    rest: number,
    focusStart?: string,
    focusEnd?: string,
    quietStart?: string,
    quietEnd?: string,
    quietEnabled?: boolean
  ) => {
    setStartHour(start);
    setEndHour(end);
    setRestMinutesPerTask(rest);
    if (focusStart) setFocusHourStart(focusStart);
    if (focusEnd) setFocusHourEnd(focusEnd);
    if (quietStart !== undefined) setQuietHourStart(quietStart);
    if (quietEnd !== undefined) setQuietHourEnd(quietEnd);
    if (quietEnabled !== undefined) setQuietHourEnabled(quietEnabled);
    setUser((prev) => {
      if (!prev) return prev;
      const capacity = calculateCapacityMinutes(start, end);
      return {
        ...prev,
        startWorkTime: start,
        endWorkTime: end,
        workHourStart: start,
        workHourEnd: end,
        restTimePerTask: rest,
        dailyCapacityMinutes: capacity,
        ...(quietStart !== undefined ? { quietHourStart: quietStart } : {}),
        ...(quietEnd !== undefined ? { quietHourEnd: quietEnd } : {}),
        ...(quietEnabled !== undefined ? { quietHourEnabled: quietEnabled } : {}),
      };
    });
  }, []);

  const completeOnboarding = useCallback(async () => {
    const computedCapacity = calculateCapacityMinutes(startHour, endHour);
    const categoryObjects =
      categories.length > 0
        ? categories.map((c) => ({
            name: c.name,
            colorHex: c.colorHex,
            focusType: resolveCategoryFocusType(c),
            isDefault: Boolean(c.isDefault),
          }))
        : (language === 'id' ? kOccupancyCategoryTemplatesId.General : kOccupancyCategoryTemplates.General).map((c) => ({
            name: c.name,
            colorHex: c.colorHex,
            focusType: c.focusType,
            isDefault: true,
          }));
    const categoryNames = categoryObjects.map((c) => c.name);
    const token = authClient.getToken();

    // 1. Optimistic immediate transition (0ms latency for button click response)
    const baseUser: any = user || {
      id: 'usr_' + Date.now(),
      email: 'user@focient.app',
      name: onboardingUsername || 'FoCient Member',
      username: onboardingUsername ? onboardingUsername.toLowerCase().replace(/\s+/g, '') : 'member',
      workHourStart: '09:00',
      workHourEnd: '17:00',
      dailyCapacityMinutes: computedCapacity,
    };
    const updatedUser: UserSession = {
      ...baseUser,
      name: onboardingUsername || baseUser.name,
      roleArchetype: selectedOccupancy || baseUser.roleArchetype || 'General',
      occupancy: selectedOccupancy || baseUser.occupancy || 'General',
      workingRhythm: selectedRhythm || baseUser.workingRhythm || 'Early Bird',
      schedulingStyle: selectedStyle || baseUser.schedulingStyle || 'Structured',
      startWorkTime: startHour || baseUser.workHourStart || '09:00',
      endWorkTime: endHour || baseUser.workHourEnd || '17:00',
      workHourStart: startHour || baseUser.workHourStart || '09:00',
      workHourEnd: endHour || baseUser.workHourEnd || '17:00',
      restTimePerTask: restMinutesPerTask,
      dailyCapacityMinutes: computedCapacity,
      quietHourStart: quietHourStart || baseUser.quietHourStart || '',
      quietHourEnd: quietHourEnd || baseUser.quietHourEnd || '',
      quietHourEnabled: quietHourEnabled !== undefined ? quietHourEnabled : true,
      isOnboardingCompleted: true,
    };
    setUser(updatedUser);
    authClient.setSession(token || 'focient_token', updatedUser);

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(`focient_web_tasks_${updatedUser.id}`, JSON.stringify(tasks));
      } catch {}
    }

    setOnboardingStep(5);
    setActiveNavTab('dashboard');
    setAuthView('dashboard');
    showToast(
      language === 'id'
        ? 'Setup ruang kerja selesai! Selamat berfokus tanpa rasa bersalah.'
        : 'Workspace ready! Enjoy your guilt-free focus journey.',
      'success'
    );

    // 2. Background persistence to server / DB
    const payload = {
      job: selectedOccupancy || user?.roleArchetype || 'General',
      roleArchetype: selectedOccupancy || user?.roleArchetype || 'General',
      occupancy: selectedOccupancy || user?.roleArchetype || 'General',
      workHoursLimit: computedCapacity / 60 || 8,
      startWorkTime: startHour || '09:00',
      endWorkTime: endHour || '17:00',
      selectedCategories: categoryObjects,
      workingRhythm: selectedRhythm || 'Early Bird',
      schedulingStyle: selectedStyle || 'Structured',
      restTimeMinutesPerTask: restMinutesPerTask,
      restTimePerTask: restMinutesPerTask,
      quietHourStart: quietHourStart || '',
      quietHourEnd: quietHourEnd || '',
      quietHourEnabled,
    };

    try {
      fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      }).catch((err) => {
        console.warn('Background sync on complete onboarding warning:', err);
      });
    } catch (err) {
      console.warn('Failed to post /api/onboarding/complete:', err);
    }
  }, [user, onboardingUsername, selectedOccupancy, selectedRhythm, selectedStyle, startHour, endHour, categories, restMinutesPerTask, quietHourStart, quietHourEnd, quietHourEnabled, tasks, language, showToast]);

  // -------------------------------------------------------------
  // PWA & WEB NOTIFICATIONS ENGINE
  // -------------------------------------------------------------
  // New accounts strictly start with 0 notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [pwaPermission, setPwaPermission] = useState<NotificationPermission>('default');

  // Load notifications from localStorage and API on mount / authentication change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      registerPwaServiceWorker();
      const currentPerm = getNotificationPermission();
      setPwaPermission(currentPerm);
      if (currentPerm === 'granted') {
        subscribeToWebPush().catch(() => {});
      }

      if (!isAuthenticated) {
        setNotifications([]);
        return;
      }

      try {
        const userScopedKey = user?.id ? `focient_notifications_${user.id}` : null;
        const saved = (userScopedKey && localStorage.getItem(userScopedKey)) || localStorage.getItem('focient_notifications');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNotifications(parsed);
          }
        }
      } catch (e) {
        // fallback
      }

      // Fetch from API in background only when logged in
      fetch('/api/notifications')
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && Array.isArray(data.notifications) && data.notifications.length > 0) {
            setNotifications(data.notifications);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, user?.id]);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!isAuthenticated) return;
      try {
        if (user?.id) {
          localStorage.setItem(`focient_notifications_${user.id}`, JSON.stringify(notifications));
        }
        localStorage.setItem('focient_notifications', JSON.stringify(notifications));
      } catch (e) {}
    }
  }, [notifications, isAuthenticated, user?.id]);

  const unreadNotificationCount = useMemo(() => {
    if (!isAuthenticated) return 0;
    return notifications.filter((n) => !n.read).length;
  }, [notifications, isAuthenticated]);

  // Synchronize browser tab title strictly formatted as "[nama page] - FoCient", or "FoCient" on landing page
  // Zero decorative icons or emojis (no bell/alert icons)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const newTitle = resolveDocumentTitle({
      authView,
      activeNavTab,
      inspectorView,
      language,
      isAuthenticated,
      pathname: currentPath,
    });
    document.title = newTitle;
  }, [authView, activeNavTab, inspectorView, language, isAuthenticated]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      const newTitle = resolveDocumentTitle({
        authView,
        activeNavTab,
        inspectorView,
        language,
        isAuthenticated,
        pathname: currentPath,
      });
      document.title = newTitle;
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [authView, activeNavTab, inspectorView, language, isAuthenticated]);

  const openNotificationPanel = useCallback(() => setIsNotificationPanelOpen(true), []);
  const closeNotificationPanel = useCallback(() => setIsNotificationPanelOpen(false), []);
  const toggleNotificationPanel = useCallback(() => setIsNotificationPanelOpen((prev) => !prev), []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readAll: true }),
    }).catch(() => {});
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    fetch(`/api/notifications?id=${id}`, { method: 'DELETE' }).catch(() => {});
  }, []);

  const recentDispatchedNotifsRef = useRef<Map<string, number>>(new Map());

  const addAppNotification = useCallback(
    (notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
      if (!isAuthenticated) return;

      const notifKey = `${notif.category}:${notif.title}:${notif.message}`;
      const now = Date.now();
      const lastDispatched = recentDispatchedNotifsRef.current.get(notifKey) || 0;

      // Strictly prevent duplicate notifications for the exact same event within 3 seconds
      if (now - lastDispatched < 3000) {
        return;
      }
      recentDispatchedNotifsRef.current.set(notifKey, now);

      const newNotification: AppNotification = {
        ...notif,
        id: `notif-${now}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => {
        // Prevent duplicate entries in state
        const isDuplicate = prev.some(
          (n) =>
            n.title === notif.title &&
            n.message === notif.message &&
            Math.abs(now - new Date(n.createdAt).getTime()) < 3000
        );
        if (isDuplicate) {
          return prev;
        }
        return [newNotification, ...prev];
      });



      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: notif.title,
          message: notif.message,
          category: notif.category,
        }),
      }).catch(() => {});
    },
    [isAuthenticated]
  );

  // Task actions with Real-Time Database Synchronization
  const addTask = useCallback(
    (newTask: Omit<MobileTask, 'id'> & { id?: string }) => {
      // If task is scheduled and quiet hours are active, prevent scheduling inside quiet hours
      if (
        !newTask.isBacklog &&
        newTask.startHourDisplay &&
        quietHourEnabled &&
        isTimeOverlappingQuietHours(newTask.startHourDisplay, newTask.durationMinutes, quietHourStart, quietHourEnd, quietHourEnabled)
      ) {
        showToast(
          language === 'id'
            ? `Waktu tugas (${newTask.startHourDisplay}) berada dalam Jam Tenang (${quietHourStart} - ${quietHourEnd}) untuk istirahat. Tugas tidak dapat ditambahkan.`
            : `Task time (${newTask.startHourDisplay}) overlaps with Quiet Hours (${quietHourStart} - ${quietHourEnd}) reserved for rest. Task cannot be scheduled.`,
          'error'
        );
        return;
      }

      // Prevention System: Prevent scheduling overlapping tasks on the same date
      if (!newTask.isBacklog && newTask.startHourDisplay && newTask.dateDisplay) {
        const tStartMin = parseTime24ToMinutes(newTask.startHourDisplay);
        if (tStartMin !== null) {
          const tEndMin = tStartMin + (newTask.durationMinutes || 30);
          const targetISODate = normalizeToISODate(newTask.dateDisplay);

          const conflict = tasks.find((t) => {
            if (t.isBacklog || t.status === 'completed' || !t.startHourDisplay || !t.dateDisplay) return false;
            if (normalizeToISODate(t.dateDisplay) !== targetISODate) return false;
            const exStart = parseTime24ToMinutes(t.startHourDisplay);
            if (exStart === null) return false;
            const exEnd = exStart + (t.durationMinutes || 30);
            return tStartMin < exEnd && tEndMin > exStart;
          });

          if (conflict) {
            const exStart = parseTime24ToMinutes(conflict.startHourDisplay) ?? 0;
            const exDuration = conflict.durationMinutes || 30;
            const exBuffer = conflict.restMinutes ?? (restMinutesPerTask || 10);
            const freeMin = exStart + exDuration + exBuffer;
            const suggestedHour = String(Math.floor(freeMin / 60) % 24).padStart(2, '0');
            const suggestedMin = String(freeMin % 60).padStart(2, '0');
            const suggestedSlot = `${suggestedHour}:${suggestedMin}`;

            showToast(
              language === 'id'
                ? `Jadwal bentrok: Tugas "${conflict.title}" sudah dijadwalkan pada jam ${conflict.startHourDisplay}. Saran waktu: Kerjakan pada jam ${suggestedSlot}.`
                : `Schedule conflict: Task "${conflict.title}" is already scheduled at ${conflict.startHourDisplay}. Suggested time: Work at ${suggestedSlot}.`,
              'error'
            );
            return;
          }
        }
      }

      const task: MobileTask = {
        ...newTask,
        id: newTask.id || `task-${Date.now()}`,
      };
      setTasks((prev) => [task, ...prev]);

      if (task.isBacklog) {
        setBacklogTasks((prev) => {
          const next = [
            {
              id: task.id,
              title: task.title,
              durationMinutes: task.durationMinutes,
              categoryName: task.categoryName,
              categoryColor: task.categoryColor,
              focusType: task.focusType,
              restMinutes: task.restMinutes,
            },
            ...prev.filter((b) => b.id !== task.id),
          ];
          if (typeof window !== 'undefined') {
            try {
              window.localStorage.setItem('focient_web_backlog', JSON.stringify(next));
            } catch {}
          }
          return next;
        });
      }

      // Asynchronous Real-Time Database Persistence
      if (typeof window !== 'undefined') {
        const token = authClient.getToken();
        const activeUser = user || authClient.getUser();
        if (activeUser?.id) {
          try {
            const currentStored = window.localStorage.getItem(`focient_web_tasks_${activeUser.id}`);
            const list = currentStored ? JSON.parse(currentStored) : [];
            window.localStorage.setItem(`focient_web_tasks_${activeUser.id}`, JSON.stringify([task, ...list.filter((t: any) => t.id !== task.id)]));
          } catch {}
        }

        fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(task),
        }).catch(() => {});
      }

      // Dispatch in-app notification for task addition to system
      const addedCopy = buildTaskAddedCopy(task.title, task.startHourDisplay || undefined, language);
      addAppNotification({
        title: addedCopy.title,
        message: addedCopy.body,
        category: 'task',
        actionUrl: task.isBacklog ? '/tasks' : '/plan',
        actionLabel: language === 'id'
          ? (task.isBacklog ? 'Lihat Tugas' : 'Lihat Jadwal')
          : (task.isBacklog ? 'View Tasks' : 'View Plan'),
      });

      showToast(
        language === 'id'
          ? (task.isBacklog
              ? `Tugas "${task.title}" disimpan ke backlog.`
              : `Tugas "${task.title}" ditambahkan ke jadwal.`)
          : (task.isBacklog
              ? `Task "${task.title}" saved to backlog.`
              : `Task "${task.title}" added to schedule successfully!`),
        'success'
      );
    },
    [language, showToast, quietHourStart, quietHourEnd, quietHourEnabled, user, addAppNotification]
  );

  const updateTask = useCallback(
    (updated: MobileTask) => {
      // If task is scheduled and quiet hours are active, prevent scheduling inside quiet hours
      if (
        !updated.isBacklog &&
        updated.startHourDisplay &&
        quietHourEnabled &&
        isTimeOverlappingQuietHours(updated.startHourDisplay, updated.durationMinutes, quietHourStart, quietHourEnd, quietHourEnabled)
      ) {
        showToast(
          language === 'id'
            ? `Waktu tugas (${updated.startHourDisplay}) berada dalam Jam Tenang (${quietHourStart} - ${quietHourEnd}) untuk istirahat. Tugas tidak dapat diperbarui ke jam tersebut.`
            : `Task time (${updated.startHourDisplay}) overlaps with Quiet Hours (${quietHourStart} - ${quietHourEnd}) reserved for rest. Cannot reschedule to quiet hours.`,
          'error'
        );
        return;
      }

      // Prevention System: Prevent scheduling overlapping tasks on the same date
      if (!updated.isBacklog && updated.startHourDisplay && updated.dateDisplay) {
        const tStartMin = parseTime24ToMinutes(updated.startHourDisplay);
        if (tStartMin !== null) {
          const tEndMin = tStartMin + (updated.durationMinutes || 30);
          const targetISODate = normalizeToISODate(updated.dateDisplay);

          const conflict = tasks.find((t) => {
            if (t.id === updated.id) return false;
            if (t.isBacklog || t.status === 'completed' || !t.startHourDisplay || !t.dateDisplay) return false;
            if (normalizeToISODate(t.dateDisplay) !== targetISODate) return false;
            const exStart = parseTime24ToMinutes(t.startHourDisplay);
            if (exStart === null) return false;
            const exEnd = exStart + (t.durationMinutes || 30);
            return tStartMin < exEnd && tEndMin > exStart;
          });

          if (conflict) {
            const exStart = parseTime24ToMinutes(conflict.startHourDisplay) ?? 0;
            const exDuration = conflict.durationMinutes || 30;
            const exBuffer = conflict.restMinutes ?? (restMinutesPerTask || 10);
            const freeMin = exStart + exDuration + exBuffer;
            const suggestedHour = String(Math.floor(freeMin / 60) % 24).padStart(2, '0');
            const suggestedMin = String(freeMin % 60).padStart(2, '0');
            const suggestedSlot = `${suggestedHour}:${suggestedMin}`;

            showToast(
              language === 'id'
                ? `Jadwal bentrok: Tugas "${conflict.title}" sudah dijadwalkan pada jam ${conflict.startHourDisplay}. Saran waktu: Kerjakan pada jam ${suggestedSlot}.`
                : `Schedule conflict: Task "${conflict.title}" is already scheduled at ${conflict.startHourDisplay}. Suggested time: Work at ${suggestedSlot}.`,
              'error'
            );
            return;
          }
        }
      }

      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

      if (updated.isBacklog) {
        setBacklogTasks((prev) => {
          const next = [
            {
              id: updated.id,
              title: updated.title,
              durationMinutes: updated.durationMinutes,
              categoryName: updated.categoryName,
              categoryColor: updated.categoryColor,
              focusType: updated.focusType,
              restMinutes: updated.restMinutes,
            },
            ...prev.filter((b) => b.id !== updated.id),
          ];
          if (typeof window !== 'undefined') {
            try {
              window.localStorage.setItem('focient_web_backlog', JSON.stringify(next));
            } catch {}
          }
          return next;
        });
      } else {
        setBacklogTasks((prev) => {
          const next = prev.filter((b) => b.id !== updated.id);
          if (typeof window !== 'undefined') {
            try {
              window.localStorage.setItem('focient_web_backlog', JSON.stringify(next));
            } catch {}
          }
          return next;
        });
      }

      // Asynchronous Real-Time Database Update
      if (typeof window !== 'undefined') {
        const token = authClient.getToken();
        fetch(`/api/tasks/${updated.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(updated),
        }).catch(() => {});
      }

      showToast(
        language === 'id'
          ? `Tugas "${updated.title}" diperbarui.`
          : `Task "${updated.title}" updated successfully!`,
        'success'
      );
    },
    [language, showToast, quietHourStart, quietHourEnd, quietHourEnabled]
  );

  const removeTask = useCallback(
    (id: string) => {
      const target = tasks.find((t) => t.id === id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setBacklogTasks((prev) => {
        const next = prev.filter((b) => b.id !== id);
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem('focient_web_backlog', JSON.stringify(next));
          } catch {}
        }
        return next;
      });
      if (selectedTaskForDetail?.id === id) {
        setSelectedTaskForDetail(null);
      }

      // Asynchronous Real-Time Database Deletion
      if (typeof window !== 'undefined') {
        const token = authClient.getToken();
        fetch(`/api/tasks/${id}`, {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }).catch(() => {});
      }

      showToast(
        language === 'id'
          ? `Tugas "${target?.title || 'Tugas'}" dihapus tanpa rasa bersalah.`
          : `Task "${target?.title || 'Task'}" removed without guilt.`,
        'info',
        target ? () => setTasks((prev) => [target, ...prev]) : undefined
      );
    },
    [tasks, selectedTaskForDetail, language, showToast]
  );

  const lastTaskToggleTimeRef = useRef<Map<string, number>>(new Map());

  const toggleTaskComplete = useCallback(
    (id: string) => {
      const now = Date.now();
      const lastToggled = lastTaskToggleTimeRef.current.get(id) || 0;
      // Debounce rapid repeated clicks on the same task checkbox (within 400ms)
      if (now - lastToggled < 400) return;
      lastTaskToggleTimeRef.current.set(id, now);

      const target = tasks.find((t) => t.id === id);
      if (!target) return;

      const nextStatus = target.status === 'completed' ? 'todo' : 'completed';

      // 1. Pure state update
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            return {
              ...t,
              status: nextStatus as 'completed' | 'todo',
            };
          }
          return t;
        })
      );

      // 2. Real-Time Database Persistence (strictly outside setState updater)
      if (typeof window !== 'undefined') {
        const token = authClient.getToken();
        fetch(`/api/tasks/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ status: nextStatus }),
        }).catch(() => {});
      }

      // 3. Exactly one guilt-free notification when completing a task (strictly outside setState updater)
      if (nextStatus === 'completed') {
        const completedCopy = buildTaskCompletedCopy(target.title, language);
        addAppNotification({
          title: completedCopy.title,
          message: completedCopy.body,
          category: 'task',
          actionUrl: '/plan',
          actionLabel: language === 'id' ? 'Lihat Jadwal' : 'View Plan',
        });
      }
    },
    [tasks, language, addAppNotification]
  );

  // Planning & Reschedule with Real-Time Database Support
  const rescheduleOverloadedTasks = useCallback(() => {
    if (rebalanceProposal) {
      const parts = rebalanceProposal.newSchedule.split(',');
      const targetDayName = parts[0]?.trim() || '';
      const timePart = parts[1]?.trim().split(' ')[0] || '10:00';
      const targetDayIdx = getDayOfWeekIndex(targetDayName);
      const targetExactDate = formatCurrentDate(getWeekDayDate(targetDayIdx, undefined, weekStartDay), language);
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === rebalanceProposal.id) {
            return {
              ...t,
              dateDisplay: targetExactDate || t.dateDisplay,
              startHourDisplay: timePart,
            };
          }
          return t;
        })
      );
      setRebalanceProposal(null);
      setRescheduleAlertResolved(true);

      // Persist rebalance to database
      if (typeof window !== 'undefined') {
        fetch('/api/schedule/rebalance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'rebalance',
            taskId: rebalanceProposal.id,
            targetDay: targetDayName,
          }),
        }).catch(() => {});
      }

      showToast(
        language === 'id'
          ? `Jadwal diseimbangkan kembali tanpa rasa bersalah! Tugas direlokasi ke ${targetDayName}.`
          : `Schedule rebalanced successfully! Task relocated to ${targetDayName}.`,
        'success'
      );
    } else {
      setWeeklyWorkloads((prev) =>
        prev.map((d) => (d.dayKey === 'Wed' ? { ...d, percentage: 65 } : d.dayKey === 'Thu' ? { ...d, percentage: 70 } : d))
      );
      setRebalanceProposal(null);
      showToast(
        language === 'id'
          ? 'Jadwal diseimbangkan kembali tanpa rasa bersalah! Beban kerja kini optimal.'
          : 'Schedule rebalanced successfully! Workload is now optimal.',
        'success'
      );
    }
  }, [rebalanceProposal, language, showToast]);

  const keepCurrentSchedule = useCallback(() => {
    setRebalanceProposal(null);
    setRescheduleAlertDismissed(true);
    showToast(
      language === 'id'
        ? 'Jadwal saat ini tetap dipertahankan. Anda bebas menyesuaikan kapan pun.'
        : 'Current schedule kept without guilt. You can adjust anytime.',
      'info'
    );
  }, [language, showToast]);

  const scheduleBacklogTask = useCallback(
    (id: string, targetTime: string) => {
      const fromBacklog = backlogTasks.find((b) => b.id === id);
      const fromTask = tasks.find((t) => t.id === id);
      const backlogItem = fromBacklog || (fromTask ? {
        id: fromTask.id,
        title: fromTask.title,
        durationMinutes: fromTask.durationMinutes,
        categoryName: fromTask.categoryName,
        categoryColor: fromTask.categoryColor,
        focusType: fromTask.focusType,
        restMinutes: fromTask.restMinutes,
      } : null);

      if (!backlogItem) return;

      setBacklogTasks((prev) => {
        const next = prev.filter((b) => b.id !== id);
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem('focient_web_backlog', JSON.stringify(next));
          } catch {}
        }
        return next;
      });

      const currentRhythm = user?.workingRhythm || (user as any)?.energyRhythm || selectedRhythm || 'Steady Pacer';
      const currentStyle = user?.schedulingStyle || selectedStyle || 'Structured';
      const isHighFocus = backlogItem.focusType === 'High' || backlogItem.focusType === 'Deep Focus';

      // Retain backlogItem's configured rest buffer or user's preference without restricting it
      const userRestPref = restMinutesPerTask > 0 ? restMinutesPerTask : (user?.restTimePerTask ?? 10);
      const taskRestBuffer = (backlogItem as any).restMinutes !== undefined && (backlogItem as any).restMinutes !== null
        ? (backlogItem as any).restMinutes
        : userRestPref;

      // Intelligent slot calculation respecting user's work hours, rhythm peak, and task intensity
      const workStartHour = parseInt((user?.workHourStart || '08:00').split(':')[0], 10);
      const workEndHour = parseInt((user?.workHourEnd || '17:00').split(':')[0], 10);

      let slotHour = '10:00';
      if (isHighFocus) {
        if (currentRhythm === 'Early Bird') {
          // Early bird peak: 07:00 - 12:00, within work hours
          const h = Math.max(workStartHour, 7);
          slotHour = `${String(h).padStart(2, '0')}:00`;
        } else if (currentRhythm === 'Night Owl') {
          // Night owl peak: 18:00 - 00:00
          const h = workEndHour >= 20 ? 18 : Math.max(workStartHour + 6, 16);
          slotHour = `${String(h).padStart(2, '0')}:00`;
        } else {
          // Steady Pacer peak: 09:00 - 15:00. High focus scheduled at 09:00 - 10:00 mid-morning peak, NEVER late at 15:00
          const h = Math.min(Math.max(workStartHour + 1, 9), 10);
          slotHour = `${String(h).padStart(2, '0')}:00`;
        }
      } else {
        // Low/Medium focus: afternoon slot
        const h = Math.min(Math.max(workStartHour + 5, 14), Math.max(workEndHour - 2, 14));
        slotHour = `${String(h).padStart(2, '0')}:30`;
      }

      const targetDate = targetTime.includes('Tomorrow') || targetTime.includes('Besok')
        ? formatCurrentDate(new Date(Date.now() + 86400000), language)
        : formatCurrentDate(new Date(), language);

      if (fromTask) {
        const updatedTask: MobileTask = {
          ...fromTask,
          isBacklog: false,
          dateDisplay: targetDate,
          startHourDisplay: slotHour,
          restMinutes: taskRestBuffer,
        };
        updateTask(updatedTask);
      } else {
        const scheduled: MobileTask = {
          id: backlogItem.id.startsWith('task-') ? backlogItem.id : `task-from-backlog-${Date.now()}`,
          title: backlogItem.title,
          durationMinutes: backlogItem.durationMinutes,
          priority: 'normal',
          energyLevel: isHighFocus ? 'high' : 'medium',
          status: 'todo',
          categoryName: backlogItem.categoryName,
          categoryColor: backlogItem.categoryColor,
          restMinutes: taskRestBuffer,
          dateDisplay: targetDate,
          startHourDisplay: slotHour,
          focusType: backlogItem.focusType,
          needRestAfter: true,
          isBacklog: false,
        };
        addTask(scheduled);
      }

      showToast(
        language === 'id'
          ? `Tugas "${backlogItem.title}" berhasil dijadwalkan (${targetDate}, ${slotHour}).`
          : `Task "${backlogItem.title}" scheduled for ${targetDate} at ${slotHour}!`,
        'success'
      );
    },
    [backlogTasks, tasks, user?.workingRhythm, user?.schedulingStyle, user?.restTimePerTask, selectedRhythm, selectedStyle, restMinutesPerTask, language, updateTask, addTask, showToast]
  );

  const resolveRescheduleNow = useCallback(() => {
    setRescheduleAlertResolved(true);
    showToast(
      language === 'id'
        ? 'Jadwal disesuaikan dengan jeda istirahat 10 menit tanpa rasa bersalah!'
        : 'Schedule adjusted without guilt! Rescheduled with a 10-minute rest buffer.',
      'success'
    );
  }, [language, showToast]);

  const dismissRescheduleLater = useCallback(() => {
    setRescheduleAlertDismissed(true);
    showToast(
      language === 'id'
        ? 'Penyesuaian jadwal ditunda. Sistem akan terus memantau kapasitas Anda.'
        : 'Schedule adjustment postponed. The system will monitor your available time.',
      'info'
    );
  }, [language, showToast]);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'id' : 'en'));
  }, []);

  const openAddTaskModal = useCallback((task?: MobileTask, defaultDate?: string) => {
    setTaskToEdit(task || null);
    setInitialTaskDate(defaultDate || '');
    setIsAddTaskModalOpen(true);
  }, []);

  const closeAddTaskModal = useCallback(() => {
    setTaskToEdit(null);
    setInitialTaskDate('');
    setIsAddTaskModalOpen(false);
  }, []);

  const selectedDateTitle = useMemo(() => {
    const today = new Date();
    const d = new Date(today.getFullYear(), today.getMonth(), selectedCalendarDay);
    return formatCurrentDate(d, language);
  }, [selectedCalendarDay, language]);

  // Navigation & Responsiveness state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const toggleCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen((prev) => !prev);
  }, []);

  const [isMobileKeyboardActive, setIsMobileKeyboardActive] = useState<boolean>(false);

  // Date Navigation State
  const [calendarOffsetDays, setCalendarOffsetDays] = useState<number>(0);

  const navigateDate = useCallback((direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setCalendarOffsetDays(0);
      setSelectedCalendarDay(new Date().getDate());
    } else if (direction === 'prev') {
      setCalendarOffsetDays((prev) => prev - 1);
      setSelectedCalendarDay((prev) => Math.max(1, prev - 1));
    } else if (direction === 'next') {
      setCalendarOffsetDays((prev) => prev + 1);
      setSelectedCalendarDay((prev) => Math.min(31, prev + 1));
    }
  }, []);

  const activeCalendarDate = useMemo(() => {
    const base = new Date();
    const target = new Date(base.getTime() + calendarOffsetDays * 86400000);

    const monthShort = target.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short' });
    const dayName = target.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { weekday: 'short' });

    if (calendarOffsetDays === 0) {
      return language === 'id' ? `Hari Ini, ${target.getDate()} ${monthShort}` : `Today, ${monthShort} ${target.getDate()}`;
    } else if (calendarOffsetDays === -1) {
      return language === 'id' ? `Kemarin, ${target.getDate()} ${monthShort}` : `Yesterday, ${monthShort} ${target.getDate()}`;
    } else if (calendarOffsetDays === 1) {
      return language === 'id' ? `Besok, ${target.getDate()} ${monthShort}` : `Tomorrow, ${monthShort} ${target.getDate()}`;
    }

    return language === 'id'
      ? `${dayName}, ${target.getDate()} ${monthShort}`
      : `${dayName}, ${monthShort} ${target.getDate()}`;
  }, [calendarOffsetDays, language]);

  // -------------------------------------------------------------
  // PWA & WEB NOTIFICATIONS ENGINE (Actions & Background Scheduler)
  // -------------------------------------------------------------
  const requestPwaPermission = useCallback(async () => {
    const perm = await requestNotificationPermission();
    setPwaPermission(perm);
    if (perm === 'granted') {
      subscribeToWebPush().catch(() => {});
    }
    return perm;
  }, []);

  const triggerTaskReminder = useCallback(
    async (taskTitle: string, startHour: string, durationMinutes: number): Promise<boolean> => {
      const copy = buildTaskReminderCopy(taskTitle, startHour, durationMinutes, language);
      addAppNotification({
        title: copy.title,
        message: copy.body,
        category: 'task',
        actionUrl: '/plan',
        actionLabel: language === 'id' ? 'Buka Rencana' : 'View Plan',
      });
      triggerServerWebPush({
        title: copy.title,
        body: copy.body,
        url: '/plan',
        tag: `task-${Date.now()}`,
        category: 'task',
      }).catch(() => {});
      return await showPwaNotification({
        title: copy.title,
        body: copy.body,
        tag: `task-${Date.now()}`,
        url: '/plan',
      });
    },
    [language, addAppNotification]
  );

  const triggerTaskLeadReminder = useCallback(
    async (taskTitle: string, startHour: string, leadHours: 1 | 3 | 6): Promise<boolean> => {
      const copy = buildTaskLeadReminderCopy(taskTitle, startHour, leadHours, language);
      addAppNotification({
        title: copy.title,
        message: copy.body,
        category: 'task',
        actionUrl: '/plan',
        actionLabel: language === 'id' ? 'Buka Rencana' : 'View Plan',
      });
      triggerServerWebPush({
        title: copy.title,
        body: copy.body,
        url: '/plan',
        tag: `task-lead-${leadHours}h-${Date.now()}`,
        category: 'task',
      }).catch(() => {});
      return await showPwaNotification({
        title: copy.title,
        body: copy.body,
        tag: `task-lead-${leadHours}h-${Date.now()}`,
        url: '/plan',
      });
    },
    [language, addAppNotification]
  );

  const triggerTop3DailyReminder = useCallback(
    async (top3Tasks: Array<{ title: string }>): Promise<boolean> => {
      const copy = buildTop3DailyReminderCopy(top3Tasks, language);
      addAppNotification({
        title: copy.title,
        message: copy.body,
        category: 'task',
        actionUrl: '/plan',
        actionLabel: language === 'id' ? 'Buka Rencana' : 'Start Day',
      });
      triggerServerWebPush({
        title: copy.title,
        body: copy.body,
        url: '/plan',
        tag: `top3-daily-${Date.now()}`,
        category: 'task',
      }).catch(() => {});
      return await showPwaNotification({
        title: copy.title,
        body: copy.body,
        tag: `top3-daily-${Date.now()}`,
        url: '/plan',
      });
    },
    [language, addAppNotification]
  );

  const triggerDailyQuietTimeSummary = useCallback(
    async (completedCount: number, restMinutes: number): Promise<boolean> => {
      const effectiveQuietStart = quietHourEnabled && quietHourStart ? quietHourStart : undefined;
      const copy = buildDailyQuietTimeSummaryCopy(completedCount, restMinutes, effectiveQuietStart, language);
      addAppNotification({
        title: copy.title,
        message: copy.body,
        category: 'summary',
        actionUrl: '/insights',
        actionLabel: language === 'id' ? 'Buka Refleksi' : 'View Insights',
      });
      triggerServerWebPush({
        title: copy.title,
        body: copy.body,
        url: '/insights',
        tag: 'daily-quiet-summary',
        category: 'summary',
      }).catch(() => {});
      return await showPwaNotification({
        title: copy.title,
        body: copy.body,
        tag: 'daily-quiet-summary',
        url: '/insights',
      });
    },
    [language, quietHourEnabled, quietHourStart, addAppNotification]
  );

  const triggerScheduleRecommendation = useCallback(
    async (workloadPercent: number, allocatedMinutes: number, capacityMinutes: number): Promise<boolean> => {
      const copy = buildScheduleRecommendationCopy(workloadPercent, allocatedMinutes, capacityMinutes, language);
      addAppNotification({
        title: copy.title,
        message: copy.body,
        category: 'workload',
        actionUrl: '/dashboard',
        actionLabel: language === 'id' ? 'Buka Beranda' : 'View Dashboard',
      });
      triggerServerWebPush({
        title: copy.title,
        body: copy.body,
        url: '/dashboard',
        tag: 'schedule-recommendation',
        category: 'workload',
      }).catch(() => {});
      return await showPwaNotification({
        title: copy.title,
        body: copy.body,
        tag: 'schedule-recommendation',
        url: '/dashboard',
      });
    },
    [language, addAppNotification]
  );

  const triggerWorkloadAlert = useCallback(
    async (workloadPercent: number, allocatedMinutes: number, capacityMinutes: number, type: 'high' | 'low' = 'high'): Promise<boolean> => {
      const copy = buildWorkloadAlertCopy(workloadPercent, allocatedMinutes, capacityMinutes, type, language);
      addAppNotification({
        title: copy.title,
        message: copy.body,
        category: 'workload',
        actionUrl: type === 'high' ? '/reschedule' : '/tasks',
        actionLabel: language === 'id' ? (type === 'high' ? 'Atur Ulang' : 'Pilih Tugas') : (type === 'high' ? 'Reschedule' : 'Pick Tasks'),
      });
      triggerServerWebPush({
        title: copy.title,
        body: copy.body,
        url: type === 'high' ? '/reschedule' : '/tasks',
        tag: `workload-${type}-warning`,
        category: 'workload',
      }).catch(() => {});
      return await showPwaNotification({
        title: copy.title,
        body: copy.body,
        tag: `workload-${type}-warning`,
        url: type === 'high' ? '/reschedule' : '/tasks',
      });
    },
    [language, addAppNotification]
  );

  const triggerDailySummary = useCallback(
    async (completedCount: number, restMinutes: number): Promise<boolean> => {
      return await triggerDailyQuietTimeSummary(completedCount, restMinutes);
    },
    [triggerDailyQuietTimeSummary]
  );

  const triggerRestBufferAlert = useCallback(
    async (restMinutes: number): Promise<boolean> => {
      const copy = buildRestBufferCopy(restMinutes, language);
      addAppNotification({
        title: copy.title,
        message: copy.body,
        category: 'rest',
        actionUrl: '/plan',
        actionLabel: language === 'id' ? 'Lihat Jadwal' : 'View Schedule',
      });
      triggerServerWebPush({
        title: copy.title,
        body: copy.body,
        url: '/plan',
        tag: 'rest-buffer',
        category: 'rest',
      }).catch(() => {});
      return await showPwaNotification({
        title: copy.title,
        body: copy.body,
        tag: 'rest-buffer',
        url: '/plan',
      });
    },
    [language, addAppNotification]
  );

  const triggerWebPushTest = useCallback(
    async (): Promise<{ success: boolean; sentCount?: number; message?: string }> => {
      try {
        await subscribeToWebPush();
      } catch (e) {
        // subscription error fallback
      }

      const title =
        language === 'id'
          ? 'Pengingat Ritme Fokus (Web Push)'
          : 'Focus Rhythm Reminder (Web Push)';
      const body =
        language === 'id'
          ? 'Notifikasi latar belakang PWA berhasil terkirim via Web Push VAPID.'
          : 'PWA background notification successfully dispatched via VAPID Web Push.';

      const result = await triggerServerWebPush({
        title,
        body,
        url: '/dashboard',
        tag: 'focient-push-test',
      });

      addAppNotification({
        title,
        message: body,
        category: 'task',
        actionUrl: '/dashboard',
        actionLabel: language === 'id' ? 'Buka Dashboard' : 'Open Dashboard',
      });

      if (!result.success || result.sentCount === 0) {
        await showPwaNotification({
          title,
          body,
          url: '/dashboard',
          tag: 'focient-push-test-fallback',
        });
      }

      return result;
    },
    [language, addAppNotification]
  );

  // Client-side Auto-Scheduler interval (checks upcoming tasks, lead reminders, top 3, workload & quiet time summary every 30 seconds)
  const scheduledTaskRemindersRef = useRef<Set<string>>(new Set());
  const lastWorkloadAlertTimeRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isAuthenticated) {
      scheduledTaskRemindersRef.current.clear();
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeInMinutes = currentHours * 60 + currentMinutes;
      const currentHourStr = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
      const today = new Date();
      const todayDateString = today.toDateString();

      const todayScheduled = tasks.filter(
        (t) => !t.isBacklog && isTaskOnDate(t.dateDisplay, today, t)
      );
      const todayPendingTasks = todayScheduled.filter((t) => t.status !== 'completed');
      const completedCount = todayScheduled.filter((t) => t.status === 'completed').length;
      const restMinutes = todayScheduled.reduce((sum, t) => sum + (t.restMinutes || 0), 0);

      const capMin = calculateCapacityMinutes(user?.workHourStart, user?.workHourEnd);
      const allocatedMin = todayPendingTasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
      const pct = capMin > 0 ? Math.round((allocatedMin / capMin) * 100) : 0;

      // 1. Check Daily Quiet Time Summary (or 23:59 if quiet hours not set)
      const quietSummaryKey = `quiet-summary-${todayDateString}`;
      const quietStartMin = quietHourEnabled && quietHourStart ? parseTime24ToMinutes(quietHourStart) : null;
      const isQuietSummaryTime =
        quietStartMin !== null
          ? currentTimeInMinutes >= quietStartMin - 15 && currentTimeInMinutes <= quietStartMin + 20
          : currentTimeInMinutes >= 1438; // 23:58 - 23:59 fallback

      if (isQuietSummaryTime && !scheduledTaskRemindersRef.current.has(quietSummaryKey)) {
        scheduledTaskRemindersRef.current.add(quietSummaryKey);
        triggerDailyQuietTimeSummary(completedCount, restMinutes);
      }

      // Respect quiet hours: suppress disruptive task and workload alarms during quiet period
      if (quietHourEnabled && quietHourStart && quietHourEnd) {
        if (isTimeOverlappingQuietHours(currentHourStr, 1, quietHourStart, quietHourEnd, quietHourEnabled)) {
          return;
        }
      }

      // 2. Daily Top 3 Priority Task Reminder (Start of day / morning)
      const todayTop3 = todayPendingTasks.filter((t) => t.priority === 'top3');
      if (todayTop3.length > 0) {
        const top3DailyKey = `top3-daily-${todayDateString}`;
        const workStartMin = parseTime24ToMinutes(user?.workHourStart || user?.startWorkTime || '09:00') || 540;
        if (currentTimeInMinutes >= Math.max(420, workStartMin - 30) && !scheduledTaskRemindersRef.current.has(top3DailyKey)) {
          scheduledTaskRemindersRef.current.add(top3DailyKey);
          triggerTop3DailyReminder(todayTop3);
        }
      }

      // 3. Task Advance Reminders (6h, 3h, 1h) and Starting Reminder (0-5m)
      for (const task of todayPendingTasks) {
        if (!task.startHourDisplay) continue;
        const taskMinutes = parseTime24ToMinutes(task.startHourDisplay);
        if (taskMinutes === null) continue;
        const minutesUntilStart = taskMinutes - currentTimeInMinutes;

        // 6 hours before (360 min, window 350 - 365)
        if (minutesUntilStart >= 350 && minutesUntilStart <= 365) {
          const lead6Key = `lead6h-${task.id}-${todayDateString}`;
          if (!scheduledTaskRemindersRef.current.has(lead6Key)) {
            scheduledTaskRemindersRef.current.add(lead6Key);
            triggerTaskLeadReminder(task.title, task.startHourDisplay, 6);
          }
        }

        // 3 hours before (180 min, window 170 - 185)
        if (minutesUntilStart >= 170 && minutesUntilStart <= 185) {
          const lead3Key = `lead3h-${task.id}-${todayDateString}`;
          if (!scheduledTaskRemindersRef.current.has(lead3Key)) {
            scheduledTaskRemindersRef.current.add(lead3Key);
            triggerTaskLeadReminder(task.title, task.startHourDisplay, 3);
          }
        }

        // 1 hour before (60 min, window 50 - 65)
        if (minutesUntilStart >= 50 && minutesUntilStart <= 65) {
          const lead1Key = `lead1h-${task.id}-${todayDateString}`;
          if (!scheduledTaskRemindersRef.current.has(lead1Key)) {
            scheduledTaskRemindersRef.current.add(lead1Key);
            triggerTaskLeadReminder(task.title, task.startHourDisplay, 1);
          }
        }

        // Starting now (within 0 - 5 minutes of start time)
        if (minutesUntilStart >= 0 && minutesUntilStart <= 5) {
          const reminderKey = `start-${task.id}-${todayDateString}`;
          if (!scheduledTaskRemindersRef.current.has(reminderKey)) {
            scheduledTaskRemindersRef.current.add(reminderKey);
            triggerTaskReminder(task.title, task.startHourDisplay, task.durationMinutes);
          }
        }
      }

      // 4. Workload Alerts (Both Too High >90% and Too Low <30%)
      const workStartMin = parseTime24ToMinutes(user?.workHourStart || user?.startWorkTime || '09:00') || 540;
      const workEndMin = parseTime24ToMinutes(user?.workHourEnd || user?.endWorkTime || '17:00') || 1020;

      // High Workload (>90%, throttled to every 45 min)
      if (pct >= 90 && Date.now() - lastWorkloadAlertTimeRef.current > 45 * 60 * 1000) {
        lastWorkloadAlertTimeRef.current = Date.now();
        triggerWorkloadAlert(pct, allocatedMin, capMin, 'high');
      }

      // Low Workload (<30%, active working hours only, once per day)
      if (
        pct < 30 &&
        currentTimeInMinutes >= workStartMin + 60 &&
        currentTimeInMinutes <= workEndMin &&
        !scheduledTaskRemindersRef.current.has(`low-workload-${todayDateString}`)
      ) {
        scheduledTaskRemindersRef.current.add(`low-workload-${todayDateString}`);
        triggerWorkloadAlert(pct, allocatedMin, capMin, 'low');
      }

      // 5. Simple Schedule Allocation Recommendation (active working hours, once per day)
      const schedRecomKey = `sched-recom-${todayDateString}`;
      if (
        currentTimeInMinutes >= workStartMin &&
        currentTimeInMinutes <= workEndMin &&
        !scheduledTaskRemindersRef.current.has(schedRecomKey)
      ) {
        scheduledTaskRemindersRef.current.add(schedRecomKey);
        triggerScheduleRecommendation(pct, allocatedMin, capMin);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [
    isAuthenticated,
    tasks,
    quietHourEnabled,
    quietHourStart,
    quietHourEnd,
    user,
    language,
    addAppNotification,
    triggerTaskReminder,
    triggerTaskLeadReminder,
    triggerTop3DailyReminder,
    triggerDailyQuietTimeSummary,
    triggerWorkloadAlert,
    triggerScheduleRecommendation,
  ]);

  // Dynamic Badge Counts
  const badgeCounts = useMemo(() => {
    const today = new Date();
    const selDate = new Date(today.getFullYear(), today.getMonth(), selectedCalendarDay);
    const todayActive = tasks.filter((t) => !t.isBacklog && t.status !== 'completed' && isTaskOnDate(t.dateDisplay, today, t)).length;
    const selectedActive = tasks.filter((t) => !t.isBacklog && t.status !== 'completed' && isTaskOnDate(t.dateDisplay, selDate, t)).length;

    // Synchronize todayPlan badge with the active planning context:
    // If today has active tasks, count today's tasks.
    // If today has 0 tasks, count the tasks of the active planned day (e.g. tomorrow / selected day).
    const todayPlanCount =
      todayActive > 0
        ? todayActive
        : selectedActive > 0
        ? selectedActive
        : tasks.filter((t) => !t.isBacklog && t.status !== 'completed').length;

    const tasksCount = tasks.filter((t) => !t.isBacklog && t.status !== 'completed').length + allBacklogTasks.length;
    const rescheduleCount = rebalanceProposal && !rescheduleAlertResolved && !rescheduleAlertDismissed ? 1 : 0;
    const insightsCount = weeklyWorkloads.filter((w) => w.percentage > 90).length;
    return {
      todayPlan: todayPlanCount,
      tasks: tasksCount,
      reschedule: rescheduleCount,
      insights: insightsCount,
      notifications: unreadNotificationCount,
    };
  }, [tasks, selectedCalendarDay, backlogTasks.length, rebalanceProposal, rescheduleAlertResolved, rescheduleAlertDismissed, weeklyWorkloads, unreadNotificationCount]);

  // Context Preservation & Safe Navigation
  const [draftContext, setDraftContext] = useState<{
    isDirty: boolean;
    draftTitle?: string;
    onSaveDraft?: () => void;
    pendingNavTab?: ActiveNavTab | null;
  }>({
    isDirty: false,
    draftTitle: undefined,
    onSaveDraft: undefined,
    pendingNavTab: null,
  });

  const [isPreservationDialogOpen, setIsPreservationDialogOpen] = useState<boolean>(false);

  const safeNavigate = useCallback(
    (tab: ActiveNavTab) => {
      if (tab === activeNavTab) return;
      if (draftContext.isDirty) {
        setDraftContext((prev) => ({ ...prev, pendingNavTab: tab }));
        setIsPreservationDialogOpen(true);
      } else {
        setActiveNavTab(tab);
      }
    },
    [activeNavTab, draftContext.isDirty]
  );

  const confirmPendingNavigation = useCallback(
    (action: 'save' | 'discard' | 'cancel') => {
      if (action === 'save') {
        if (draftContext.onSaveDraft) {
          draftContext.onSaveDraft();
        }
        showToast(
          language === 'id' ? 'Draf berhasil disimpan dengan aman' : 'Draft safely saved',
          'success'
        );
        if (draftContext.pendingNavTab) {
          setActiveNavTab(draftContext.pendingNavTab);
        }
        setDraftContext({ isDirty: false, draftTitle: undefined, onSaveDraft: undefined, pendingNavTab: null });
        setIsPreservationDialogOpen(false);
      } else if (action === 'discard') {
        showToast(
          language === 'id' ? 'Perubahan draf dibatalkan' : 'Draft changes discarded',
          'info'
        );
        if (draftContext.pendingNavTab) {
          setActiveNavTab(draftContext.pendingNavTab);
        }
        setDraftContext({ isDirty: false, draftTitle: undefined, onSaveDraft: undefined, pendingNavTab: null });
        setIsPreservationDialogOpen(false);
      } else {
        setDraftContext((prev) => ({ ...prev, pendingNavTab: null }));
        setIsPreservationDialogOpen(false);
      }
    },
    [draftContext, language, showToast]
  );

  // Global listeners for scroll elevation & Command+K palette
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsPreservationDialogOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <FocientContext.Provider
      value={{
        user,
        isAuthenticated,
        isOtpPending,
        otpEmail,
        setOtpEmail,
        otpPurpose,
        setOtpPurpose,
        pendingRegistration,
        sendRegistrationOtp,
        resendOtp,
        isResetPasswordPending,
        authView,
        startOnboarding,
        login,
        loginAsGuest,
        loginWithGoogle,
        startGoogleOAuth,
        isGoogleAuthModalOpen,
        openGoogleAuthModal,
        closeGoogleAuthModal,
        googleAuthMode,
        register,
        cleanUser,
        resetDb,
        verifyOtp,
        forgotPassword,
        resetPassword,
        cancelOtp,
        logout,
        setAuthView,

        onboardingStep,
        onboardingUsername,
        selectedOccupancy,
        categories,
        setCategories,
        selectedRhythm,
        selectedStyle,
        startHour,
        endHour,
        focusHourStart,
        focusHourEnd,
        quietHourStart,
        quietHourEnd,
        quietHourEnabled,
        restMinutesPerTask,
        setOnboardingStep,
        setOnboardingUsername,
        setSelectedOccupancy,
        addCategory,
        updateCategory,
        removeCategory,
        setSelectedRhythm: handleSetSelectedRhythm,
        setSelectedStyle,
        setQuietHours,
        setTimeAllocation,
        completeOnboarding,

        tasks,
        addTask,
        updateTask,
        removeTask,
        toggleTaskComplete,
        selectedCalendarDay,
        setSelectedCalendarDay,
        selectedDateTitle,
        selectedTaskForDetail,
        setSelectedTaskForDetail,

        weeklyWorkloads,
        weekStartDay,
        setWeekStartDay,
        categoryBudgets,
        backlogTasks: allBacklogTasks,
        rebalanceProposal,
        rescheduleOverloadedTasks,
        keepCurrentSchedule,
        scheduleBacklogTask,

        rescheduleAlertResolved,
        rescheduleAlertDismissed,
        resolveRescheduleNow,
        dismissRescheduleLater,

        activeNavTab,
        setActiveNavTab,
        inspectorView,
        setInspectorView,
        emptyStateMode,
        setEmptyStateMode,
        devicePreview,
        setDevicePreview,
        language,
        setLanguage,
        toggleLanguage,
        isTermsOpen,
        setIsTermsOpen,
        isAddTaskModalOpen,
        setIsAddTaskModalOpen,
        taskToEdit,
        initialTaskDate,
        setInitialTaskDate,
        openAddTaskModal,
        closeAddTaskModal,

        toast,
        showToast,
        hideToast,

        isSidebarCollapsed,
        toggleSidebar,
        setSidebarCollapsed: setIsSidebarCollapsed,
        isScrolled,
        setIsScrolled,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        toggleCommandPalette,
        isMobileKeyboardActive,
        setIsMobileKeyboardActive,
        calendarOffsetDays,
        activeCalendarDate,
        navigateDate,
        badgeCounts,
        draftContext,
        setDraftContext,
        isPreservationDialogOpen,
        setIsPreservationDialogOpen,
        safeNavigate,
        confirmPendingNavigation,

        // Real-Time Data & Database Sync
        dbSyncStatus,
        isLiveDbSync,
        refreshTasksFromDb,
        allocatedMinutes,

        // Settings & Real Database Preferences
        loadSettingsFromDb,
        updateSettings,

        // PWA & Web Notifications Engine
        notifications,
        isNotificationPanelOpen,
        pwaPermission,
        unreadNotificationCount,
        openNotificationPanel,
        closeNotificationPanel,
        toggleNotificationPanel,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        addAppNotification,
        requestPwaPermission,
        triggerTaskReminder,
        triggerTaskLeadReminder,
        triggerTop3DailyReminder,
        triggerDailyQuietTimeSummary,
        triggerScheduleRecommendation,
        triggerWorkloadAlert,
        triggerDailySummary,
        triggerRestBufferAlert,
        triggerWebPushTest,
      }}
    >
      <FoCientI18nProvider locale={language} onLocaleChange={setLanguage}>
        {children}
      </FoCientI18nProvider>
    </FocientContext.Provider>
  );
}

export function useFocient() {
  const context = useContext(FocientContext);
  if (!context) {
    throw new Error('useFocient must be used within a FocientProvider');
  }
  return context;
}
