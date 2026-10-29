'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { authClient, UserSession } from '../lib/auth-client';

export type TaskStatus = 'todo' | 'inProgress' | 'completed';
export type TaskPriority = 'top3' | 'normal' | 'low';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type FocusType = 'Light' | 'Medium' | 'Deep Focus';

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
}

export type ScreenInspectorView =
  | 'fullFlow'
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
  | 'taskDetail';

export type ActiveNavTab = 'dashboard' | 'plan' | 'addTask' | 'tasks' | 'insights' | 'reschedule';
export type Language = 'en' | 'id';

export const kOccupancyCategoryTemplates: Record<string, WorkspaceCategory[]> = {
  General: [
    { id: 'cat-gen-1', name: 'Strategic', colorHex: '#7C3AED', focusType: 'Deep Focus', isDefault: true },
    { id: 'cat-gen-2', name: 'Execution', colorHex: '#0284C7', focusType: 'Deep Focus', isDefault: true },
    { id: 'cat-gen-3', name: 'Meeting', colorHex: '#B45309', focusType: 'Medium', isDefault: true },
    { id: 'cat-gen-4', name: 'Operation', colorHex: '#0D9488', focusType: 'Light', isDefault: true },
    { id: 'cat-gen-5', name: 'Personal', colorHex: '#059669', focusType: 'Light', isDefault: true },
  ],
  'Software Engineer': [
    { id: 'cat-swe-1', name: 'Deep Work', colorHex: '#7C3AED', focusType: 'Deep Focus', isDefault: true },
    { id: 'cat-swe-2', name: 'Code Review', colorHex: '#0284C7', focusType: 'Medium', isDefault: true },
    { id: 'cat-swe-3', name: 'Sprint Meeting', colorHex: '#B45309', focusType: 'Medium', isDefault: true },
    { id: 'cat-swe-4', name: 'Bug Fixing', colorHex: '#E11D48', focusType: 'Deep Focus', isDefault: true },
    { id: 'cat-swe-5', name: 'Learning', colorHex: '#0D9488', focusType: 'Light', isDefault: true },
  ],
  'Product Designer': [
    { id: 'cat-des-1', name: 'Design Sprint', colorHex: '#7C3AED', focusType: 'Deep Focus', isDefault: true },
    { id: 'cat-des-2', name: 'User Research', colorHex: '#0284C7', focusType: 'Medium', isDefault: true },
    { id: 'cat-des-3', name: 'Design Review', colorHex: '#B45309', focusType: 'Medium', isDefault: true },
    { id: 'cat-des-4', name: 'Asset Handover', colorHex: '#0D9488', focusType: 'Light', isDefault: true },
    { id: 'cat-des-5', name: 'Inspiration', colorHex: '#059669', focusType: 'Light', isDefault: true },
  ],
  Freelancer: [
    { id: 'cat-fre-1', name: 'Client Delivery', colorHex: '#7C3AED', focusType: 'Deep Focus', isDefault: true },
    { id: 'cat-fre-2', name: 'Proposal & Pitch', colorHex: '#0284C7', focusType: 'Deep Focus', isDefault: true },
    { id: 'cat-fre-3', name: 'Admin & Invoice', colorHex: '#B45309', focusType: 'Light', isDefault: true },
    { id: 'cat-fre-4', name: 'Skill Up', colorHex: '#0D9488', focusType: 'Medium', isDefault: true },
    { id: 'cat-fre-5', name: 'Personal Care', colorHex: '#059669', focusType: 'Light', isDefault: true },
  ],
  Student: [
    { id: 'cat-stu-1', name: 'Lecture & Study', colorHex: '#7C3AED', focusType: 'Deep Focus', isDefault: true },
    { id: 'cat-stu-2', name: 'Assignment', colorHex: '#0284C7', focusType: 'Deep Focus', isDefault: true },
    { id: 'cat-stu-3', name: 'Study Group', colorHex: '#B45309', focusType: 'Medium', isDefault: true },
    { id: 'cat-stu-4', name: 'Research', colorHex: '#0D9488', focusType: 'Medium', isDefault: true },
    { id: 'cat-stu-5', name: 'Rest', colorHex: '#059669', focusType: 'Light', isDefault: true },
  ],
};

export const kSampleTasks: MobileTask[] = [
  {
    id: 't-1',
    title: 'Create the Annual OKR',
    durationMinutes: 25,
    priority: 'top3',
    energyLevel: 'high',
    status: 'todo',
    categoryName: 'Strategic',
    categoryColor: '#7C3AED',
    restMinutes: 20,
    dateDisplay: 'October, 5th 2026',
    startHourDisplay: '10:00',
    focusType: 'Deep Focus',
    needRestAfter: true,
  },
  {
    id: 't-2',
    title: 'Design Architecture Monorepo',
    durationMinutes: 45,
    priority: 'top3',
    energyLevel: 'high',
    status: 'todo',
    categoryName: 'Execution',
    categoryColor: '#0284C7',
    restMinutes: 15,
    dateDisplay: 'October, 5th 2026',
    startHourDisplay: '11:00',
    focusType: 'Deep Focus',
    needRestAfter: true,
  },
  {
    id: 't-3',
    title: 'Finalize Security Audit',
    durationMinutes: 33,
    priority: 'top3',
    energyLevel: 'high',
    status: 'todo',
    categoryName: 'Execution',
    categoryColor: '#0284C7',
    restMinutes: 15,
    dateDisplay: 'October, 5th 2026',
    startHourDisplay: '13:00',
    focusType: 'Deep Focus',
    needRestAfter: true,
  },
  {
    id: 't-4',
    title: 'Meeting Client Sync',
    durationMinutes: 30,
    priority: 'normal',
    energyLevel: 'medium',
    status: 'todo',
    categoryName: 'Meeting',
    categoryColor: '#B45309',
    restMinutes: 10,
    dateDisplay: 'October, 5th 2026',
    startHourDisplay: '14:00',
    focusType: 'Light',
    needRestAfter: true,
  },
  {
    id: 't-5',
    title: 'Implement Color Palette Token',
    durationMinutes: 25,
    priority: 'normal',
    energyLevel: 'medium',
    status: 'todo',
    categoryName: 'Execution',
    categoryColor: '#0284C7',
    restMinutes: 10,
    dateDisplay: 'October, 5th 2026',
    startHourDisplay: '14:30',
    focusType: 'Medium',
    needRestAfter: true,
  },
  {
    id: 't-6',
    title: 'Review PRs & Code Cleanliness',
    durationMinutes: 25,
    priority: 'normal',
    energyLevel: 'medium',
    status: 'todo',
    categoryName: 'Execution',
    categoryColor: '#0284C7',
    restMinutes: 10,
    dateDisplay: 'October, 5th 2026',
    startHourDisplay: '15:30',
    focusType: 'Medium',
    needRestAfter: true,
  },
  {
    id: 't-7',
    title: 'Buffer Rest Check & Rhythm Sync',
    durationMinutes: 25,
    priority: 'normal',
    energyLevel: 'medium',
    status: 'todo',
    categoryName: 'Strategic',
    categoryColor: '#7C3AED',
    restMinutes: 10,
    dateDisplay: 'October, 5th 2026',
    startHourDisplay: '16:00',
    focusType: 'Light',
    needRestAfter: true,
  },
  {
    id: 't-8',
    title: 'Update API Contract DTOs',
    durationMinutes: 20,
    priority: 'normal',
    energyLevel: 'medium',
    status: 'todo',
    categoryName: 'Execution',
    categoryColor: '#0284C7',
    restMinutes: 10,
    dateDisplay: 'October, 5th 2026',
    startHourDisplay: '16:30',
    focusType: 'Medium',
    needRestAfter: true,
  },
  {
    id: 't-9',
    title: 'Message to best friend',
    durationMinutes: 15,
    priority: 'low',
    energyLevel: 'low',
    status: 'todo',
    categoryName: 'Personal',
    categoryColor: '#059669',
    restMinutes: 5,
    dateDisplay: 'October, 5th 2026',
    startHourDisplay: '14:30',
    focusType: 'Light',
    needRestAfter: false,
  },
  {
    id: 't-10',
    title: 'Clean email inbox & triage',
    durationMinutes: 15,
    priority: 'low',
    energyLevel: 'low',
    status: 'todo',
    categoryName: 'Operation',
    categoryColor: '#0D9488',
    restMinutes: 5,
    dateDisplay: 'October, 5th 2026',
    startHourDisplay: '17:00',
    focusType: 'Light',
    needRestAfter: false,
  },
  // October 3rd, 2026 tasks matching mockups
  {
    id: 't-oct3-1',
    title: '30min Incline Walking Cardio',
    durationMinutes: 30,
    priority: 'normal',
    energyLevel: 'medium',
    status: 'completed',
    categoryName: 'Personal',
    categoryColor: '#059669',
    restMinutes: 10,
    dateDisplay: 'October, 3rd 2026',
    startHourDisplay: '08:30',
    focusType: 'Medium',
    needRestAfter: true,
  },
  {
    id: 't-oct3-2',
    title: '45min Leg Day - Strength',
    durationMinutes: 45,
    priority: 'normal',
    energyLevel: 'high',
    status: 'completed',
    categoryName: 'Personal',
    categoryColor: '#059669',
    restMinutes: 15,
    dateDisplay: 'October, 3rd 2026',
    startHourDisplay: '09:15',
    focusType: 'Deep Focus',
    needRestAfter: true,
  },
  {
    id: 't-oct3-3',
    title: 'Project Progress Discussion',
    durationMinutes: 60,
    priority: 'top3',
    energyLevel: 'high',
    status: 'todo',
    categoryName: 'Meeting',
    categoryColor: '#B45309',
    restMinutes: 10,
    dateDisplay: 'October, 3rd 2026',
    startHourDisplay: '11:40',
    focusType: 'Deep Focus',
    needRestAfter: true,
  },
  {
    id: 't-oct3-4',
    title: 'Design Team Weekly Check-in',
    durationMinutes: 30,
    priority: 'top3',
    energyLevel: 'medium',
    status: 'todo',
    categoryName: 'Meeting',
    categoryColor: '#B45309',
    restMinutes: 10,
    dateDisplay: 'October, 3rd 2026',
    startHourDisplay: '13:00',
    focusType: 'Medium',
    needRestAfter: true,
  },
  {
    id: 't-oct3-5',
    title: 'Product Flow UX Review',
    durationMinutes: 40,
    priority: 'normal',
    energyLevel: 'medium',
    status: 'todo',
    categoryName: 'Strategic',
    categoryColor: '#7C3AED',
    restMinutes: 10,
    dateDisplay: 'October, 3rd 2026',
    startHourDisplay: '14:30',
    focusType: 'Deep Focus',
    needRestAfter: true,
  },
];

export const kSampleBacklog: BacklogTaskItem[] = [
  {
    id: 'backlog-1',
    title: 'Audit token color contrast for AAA standard',
    durationMinutes: 45,
    categoryName: 'Strategic',
    categoryColor: '#7C3AED',
    focusType: 'Deep Focus',
  },
  {
    id: 'backlog-2',
    title: 'Draft User Onboarding Documentation',
    durationMinutes: 30,
    categoryName: 'Execution',
    categoryColor: '#0284C7',
    focusType: 'Medium',
  },
  {
    id: 'backlog-3',
    title: 'Optimize SVG icons for light bundle',
    durationMinutes: 20,
    categoryName: 'Operation',
    categoryColor: '#0D9488',
    focusType: 'Light',
  },
];

interface FocientContextType {
  // Auth
  user: UserSession | null;
  isAuthenticated: boolean;
  isOtpPending: boolean;
  otpEmail: string;
  otpPurpose: 'register' | 'forgotPassword';
  isResetPasswordPending: boolean;
  authView: 'welcome' | 'login' | 'register' | 'otp' | 'forgotPassword' | 'resetPassword';
  login: (email: string, password?: string) => Promise<boolean>;
  loginAsGuest: () => void;
  register: (name: string, email: string, password?: string) => Promise<boolean>;
  verifyOtp: (code: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (newPassword: string) => Promise<boolean>;
  cancelOtp: () => void;
  logout: () => void;
  setAuthView: (view: 'welcome' | 'login' | 'register' | 'otp' | 'forgotPassword' | 'resetPassword') => void;

  // Onboarding
  onboardingStep: number;
  onboardingUsername: string;
  selectedOccupancy: string | null;
  categories: WorkspaceCategory[];
  selectedRhythm: string | null;
  selectedStyle: string | null;
  startHour: string;
  endHour: string;
  restMinutesPerTask: number;
  setOnboardingStep: (step: number) => void;
  setOnboardingUsername: (name: string) => void;
  setSelectedOccupancy: (occ: string | null) => void;
  addCategory: (cat: WorkspaceCategory) => void;
  removeCategory: (id: string) => void;
  setSelectedRhythm: (rhythm: string | null) => void;
  setSelectedStyle: (style: string | null) => void;
  setTimeAllocation: (start: string, end: string, rest: number) => void;
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
  devicePreview: 'responsive' | 'mobile';
  setDevicePreview: (mode: 'responsive' | 'mobile') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isTermsOpen: boolean;
  setIsTermsOpen: (open: boolean) => void;
  isAddTaskModalOpen: boolean;
  setIsAddTaskModalOpen: (open: boolean) => void;
  taskToEdit: MobileTask | null;
  openAddTaskModal: (taskToEdit?: MobileTask) => void;
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
}

const FocientContext = createContext<FocientContextType | null>(null);

export function FocientProvider({ children }: { children: React.ReactNode }) {
  // Auth state
  const [user, setUser] = useState<UserSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isOtpPending, setIsOtpPending] = useState<boolean>(false);
  const [otpEmail, setOtpEmail] = useState<string>('demo@focient.dev');
  const [otpPurpose, setOtpPurpose] = useState<'register' | 'forgotPassword'>('register');
  const [isResetPasswordPending, setIsResetPasswordPending] = useState<boolean>(false);
  const [authView, setAuthView] = useState<'welcome' | 'login' | 'register' | 'otp' | 'forgotPassword' | 'resetPassword'>('welcome');

  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [onboardingUsername, setOnboardingUsername] = useState<string>('Alex Johnson');
  const [selectedOccupancy, setSelectedOccupancy] = useState<string | null>('General');
  const [categories, setCategories] = useState<WorkspaceCategory[]>(kOccupancyCategoryTemplates['General']);
  const [selectedRhythm, setSelectedRhythm] = useState<string | null>('Early Bird');
  const [selectedStyle, setSelectedStyle] = useState<string | null>('Structured');
  const [startHour, setStartHour] = useState<string>('09:00 AM');
  const [endHour, setEndHour] = useState<string>('05:00 PM');
  const [restMinutesPerTask, setRestMinutesPerTask] = useState<number>(20);

  // Tasks state
  const [emptyStateMode, setEmptyStateMode] = useState<boolean>(false);
  const [tasks, setTasks] = useState<MobileTask[]>(kSampleTasks);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(3);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<MobileTask | null>(null);

  // Planning state
  const [weeklyWorkloads, setWeeklyWorkloads] = useState<DailyWorkloadItem[]>([
    { dayKey: 'Mon', fullDayName: 'Monday', percentage: 65 },
    { dayKey: 'Tue', fullDayName: 'Tuesday', percentage: 75 },
    { dayKey: 'Wed', fullDayName: 'Wednesday', percentage: 92 }, // Overloaded
    { dayKey: 'Thu', fullDayName: 'Thursday', percentage: 55 },
    { dayKey: 'Fri', fullDayName: 'Friday', percentage: 60 },
    { dayKey: 'Sat', fullDayName: 'Saturday', percentage: 20 },
    { dayKey: 'Sun', fullDayName: 'Sunday', percentage: 10 },
  ]);

  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudgetItem[]>([
    { name: 'Strategic', allocatedMinutes: 150, maxMinutes: 180, colorHex: '#7C3AED' },
    { name: 'Execution', allocatedMinutes: 180, maxMinutes: 240, colorHex: '#0284C7' },
    { name: 'Meeting', allocatedMinutes: 90, maxMinutes: 120, colorHex: '#B45309' },
    { name: 'Personal', allocatedMinutes: 60, maxMinutes: 90, colorHex: '#059669' },
  ]);

  const [backlogTasks, setBacklogTasks] = useState<BacklogTaskItem[]>(kSampleBacklog);
  const [rebalanceProposal, setRebalanceProposal] = useState<RebalanceTaskProposal | null>({
    id: 'reb-1',
    title: 'Design Architecture Monorepo',
    previousSchedule: 'Wednesday, 14:00 - 15:00',
    newSchedule: 'Thursday, 10:00 - 11:00 (Buffer: 15m)',
    taskDurationMinutes: 45,
    restDurationMinutes: 15,
    categoryName: 'Execution',
    categoryColor: '#0284C7',
  });

  // Reschedule alert on dashboard
  const [rescheduleAlertResolved, setRescheduleAlertResolved] = useState<boolean>(false);
  const [rescheduleAlertDismissed, setRescheduleAlertDismissed] = useState<boolean>(false);

  // UI state
  const [activeNavTab, setActiveNavTab] = useState<ActiveNavTab>('dashboard');
  const [inspectorView, setInspectorView] = useState<ScreenInspectorView>('fullFlow');
  const [devicePreview, setDevicePreview] = useState<'responsive' | 'mobile'>('responsive');
  const [language, setLanguage] = useState<Language>('en');
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState<boolean>(false);
  const [taskToEdit, setTaskToEdit] = useState<MobileTask | null>(null);

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

  // Sync Empty State Mode
  useEffect(() => {
    if (emptyStateMode) {
      setTasks([]);
      setBacklogTasks([]);
      setWeeklyWorkloads([
        { dayKey: 'Mon', fullDayName: 'Monday', percentage: 0 },
        { dayKey: 'Tue', fullDayName: 'Tuesday', percentage: 0 },
        { dayKey: 'Wed', fullDayName: 'Wednesday', percentage: 0 },
        { dayKey: 'Thu', fullDayName: 'Thursday', percentage: 0 },
        { dayKey: 'Fri', fullDayName: 'Friday', percentage: 0 },
        { dayKey: 'Sat', fullDayName: 'Saturday', percentage: 0 },
        { dayKey: 'Sun', fullDayName: 'Sunday', percentage: 0 },
      ]);
      setCategoryBudgets([
        { name: 'Strategic', allocatedMinutes: 0, colorHex: '#7C3AED' },
        { name: 'Execution', allocatedMinutes: 0, colorHex: '#0284C7' },
        { name: 'Meeting', allocatedMinutes: 0, colorHex: '#B45309' },
      ]);
      setRebalanceProposal(null);
    } else {
      setTasks(kSampleTasks);
      setBacklogTasks(kSampleBacklog);
      setWeeklyWorkloads([
        { dayKey: 'Mon', fullDayName: 'Monday', percentage: 65 },
        { dayKey: 'Tue', fullDayName: 'Tuesday', percentage: 75 },
        { dayKey: 'Wed', fullDayName: 'Wednesday', percentage: 92 },
        { dayKey: 'Thu', fullDayName: 'Thursday', percentage: 55 },
        { dayKey: 'Fri', fullDayName: 'Friday', percentage: 60 },
        { dayKey: 'Sat', fullDayName: 'Saturday', percentage: 20 },
        { dayKey: 'Sun', fullDayName: 'Sunday', percentage: 10 },
      ]);
      setCategoryBudgets([
        { name: 'Strategic', allocatedMinutes: 150, maxMinutes: 180, colorHex: '#7C3AED' },
        { name: 'Execution', allocatedMinutes: 180, maxMinutes: 240, colorHex: '#0284C7' },
        { name: 'Meeting', allocatedMinutes: 90, maxMinutes: 120, colorHex: '#B45309' },
        { name: 'Personal', allocatedMinutes: 60, maxMinutes: 90, colorHex: '#059669' },
      ]);
      setRebalanceProposal({
        id: 'reb-1',
        title: 'Design Architecture Monorepo',
        previousSchedule: 'Wednesday, 14:00 - 15:00',
        newSchedule: 'Thursday, 10:00 - 11:00 (Buffer: 15m)',
        taskDurationMinutes: 45,
        restDurationMinutes: 15,
        categoryName: 'Execution',
        categoryColor: '#0284C7',
      });
    }
  }, [emptyStateMode]);

  // Auth actions
  const login = useCallback(async (email: string, password = ''): Promise<boolean> => {
    const userSession: UserSession = {
      id: 'usr-1',
      name: email.split('@')[0] || 'Alex Johnson',
      email,
      workHourStart: '09:00',
      workHourEnd: '17:00',
      dailyCapacityMinutes: 480,
    };
    authClient.setSession('focient_jwt_session_token', userSession);
    setUser(userSession);
    setIsAuthenticated(true);
    showToast(language === 'id' ? 'Berhasil masuk ke FoCient' : 'Welcome back to FoCient!', 'success');
    return true;
  }, [language, showToast]);

  const loginAsGuest = useCallback(() => {
    const guestSession: UserSession = {
      id: 'usr-guest',
      name: 'Alex Johnson',
      email: 'alex@focient.dev',
      workHourStart: '09:00',
      workHourEnd: '17:00',
      dailyCapacityMinutes: 480,
    };
    authClient.setSession('focient_guest_jwt_token', guestSession);
    setUser(guestSession);
    setIsAuthenticated(true);
    showToast(language === 'id' ? 'Masuk sebagai Mode Tamu' : 'Signed in with Guest Session', 'info');
  }, [language, showToast]);

  const register = useCallback(async (name: string, email: string, password = ''): Promise<boolean> => {
    setOtpEmail(email);
    setOnboardingUsername(name || email.split('@')[0]);
    setOtpPurpose('register');
    setIsOtpPending(true);
    showToast(
      language === 'id'
        ? `Kode verifikasi 6-digit dikirim ke ${email}`
        : `6-digit verification code sent to ${email}`,
      'info'
    );
    return true;
  }, [language, showToast]);

  const verifyOtp = useCallback(async (code: string): Promise<boolean> => {
    if (code.length < 6) {
      showToast(
        language === 'id' ? 'Masukkan kode 6 digit lengkap' : 'Please enter the complete 6-digit code',
        'warning'
      );
      return false;
    }

    setIsOtpPending(false);

    if (otpPurpose === 'forgotPassword') {
      setIsResetPasswordPending(true);
      showToast(
        language === 'id' ? 'Kode terverifikasi. Silakan ubah kata sandi' : 'Code verified. Enter your new password',
        'success'
      );
      return true;
    }

    // Register purpose -> authenticate and proceed to onboarding
    const newSession: UserSession = {
      id: `usr-${Date.now()}`,
      name: onboardingUsername || otpEmail.split('@')[0],
      email: otpEmail,
      workHourStart: '09:00',
      workHourEnd: '17:00',
      dailyCapacityMinutes: 480,
    };
    authClient.setSession('focient_jwt_session_token', newSession);
    setUser(newSession);
    setIsAuthenticated(true);
    setOnboardingStep(1);
    showToast(
      language === 'id' ? 'Akun terverifikasi! Mari atur ruang kerja Anda' : 'Account verified! Let’s set up your workspace',
      'success'
    );
    return true;
  }, [otpPurpose, onboardingUsername, otpEmail, language, showToast]);

  const forgotPassword = useCallback(async (email: string): Promise<boolean> => {
    setOtpEmail(email);
    setOtpPurpose('forgotPassword');
    setIsOtpPending(true);
    showToast(
      language === 'id'
        ? `Kode pemulihan sandi dikirim ke ${email}`
        : `Password recovery code sent to ${email}`,
      'info'
    );
    return true;
  }, [language, showToast]);

  const resetPassword = useCallback(async (newPassword: string): Promise<boolean> => {
    setIsResetPasswordPending(false);
    setAuthView('login');
    showToast(
      language === 'id'
        ? 'Kata sandi berhasil diperbarui. Silakan login'
        : 'Password updated successfully. Please log in',
      'success'
    );
    return true;
  }, [language, showToast]);

  const cancelOtp = useCallback(() => {
    setIsOtpPending(false);
    setIsResetPasswordPending(false);
  }, []);

  const logout = useCallback(() => {
    authClient.clearSession();
    setUser(null);
    setIsAuthenticated(false);
    setIsOtpPending(false);
    setIsResetPasswordPending(false);
    setAuthView('welcome');
    showToast(language === 'id' ? 'Berhasil keluar' : 'Logged out', 'info');
  }, [language, showToast]);

  // Onboarding actions
  const addCategory = useCallback((cat: WorkspaceCategory) => {
    setCategories((prev) => (prev.some((c) => c.name.toLowerCase() === cat.name.toLowerCase()) ? prev : [...prev, cat]));
  }, []);

  const removeCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const setTimeAllocation = useCallback((start: string, end: string, rest: number) => {
    setStartHour(start);
    setEndHour(end);
    setRestMinutesPerTask(rest);
  }, []);

  const completeOnboarding = useCallback(() => {
    setOnboardingStep(5);
    setActiveNavTab('dashboard');
    showToast(
      language === 'id'
        ? 'Setup ruang kerja selesai! Selamat berfokus tanpa rasa bersalah.'
        : 'Workspace ready! Enjoy your guilt-free focus journey.',
      'success'
    );
  }, [language, showToast]);

  // Task actions
  const addTask = useCallback(
    (newTask: Omit<MobileTask, 'id'> & { id?: string }) => {
      const task: MobileTask = {
        ...newTask,
        id: newTask.id || `task-${Date.now()}`,
      };
      setTasks((prev) => [task, ...prev]);
      showToast(
        language === 'id'
          ? `Tugas "${task.title}" ditambahkan ke jadwal.`
          : `Task "${task.title}" added to schedule successfully!`,
        'success'
      );
    },
    [language, showToast]
  );

  const updateTask = useCallback(
    (updated: MobileTask) => {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      showToast(
        language === 'id'
          ? `Tugas "${updated.title}" diperbarui.`
          : `Task "${updated.title}" updated successfully!`,
        'success'
      );
    },
    [language, showToast]
  );

  const removeTask = useCallback(
    (id: string) => {
      const target = tasks.find((t) => t.id === id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (selectedTaskForDetail?.id === id) {
        setSelectedTaskForDetail(null);
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

  const toggleTaskComplete = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const isNowCompleted = t.status !== 'completed';
            return {
              ...t,
              status: isNowCompleted ? 'completed' : 'todo',
            };
          }
          return t;
        })
      );
    },
    []
  );

  // Planning & Reschedule
  const rescheduleOverloadedTasks = useCallback(() => {
    setWeeklyWorkloads((prev) =>
      prev.map((d) => (d.dayKey === 'Wed' ? { ...d, percentage: 65 } : d.dayKey === 'Thu' ? { ...d, percentage: 70 } : d))
    );
    setRebalanceProposal(null);
    showToast(
      language === 'id'
        ? 'Jadwal diseimbangkan kembali tanpa rasa bersalah! Beban Rabu kini optimal (65%).'
        : 'Schedule rebalanced successfully! Wednesday workload reduced to 65% (Optimal).',
      'success'
    );
  }, [language, showToast]);

  const keepCurrentSchedule = useCallback(() => {
    setRebalanceProposal(null);
    showToast(
      language === 'id'
        ? 'Jadwal saat ini tetap dipertahankan. Anda bebas menyesuaikan kapan pun.'
        : 'Current schedule kept without guilt. You can adjust anytime.',
      'info'
    );
  }, [language, showToast]);

  const scheduleBacklogTask = useCallback(
    (id: string, targetTime: string) => {
      const backlogItem = backlogTasks.find((b) => b.id === id);
      if (!backlogItem) return;
      setBacklogTasks((prev) => prev.filter((b) => b.id !== id));
      const scheduled: MobileTask = {
        id: `task-from-backlog-${Date.now()}`,
        title: backlogItem.title,
        durationMinutes: backlogItem.durationMinutes,
        priority: 'normal',
        energyLevel: 'medium',
        status: 'todo',
        categoryName: backlogItem.categoryName,
        categoryColor: backlogItem.categoryColor,
        restMinutes: 10,
        dateDisplay: targetTime.includes('Tomorrow') ? 'October, 6th 2026' : 'October, 5th 2026',
        startHourDisplay: targetTime.includes('10:00') ? '10:00' : '15:00',
        focusType: backlogItem.focusType,
        needRestAfter: true,
      };
      setTasks((prev) => [...prev, scheduled]);
      showToast(
        language === 'id'
          ? `Tugas "${backlogItem.title}" dijadwalkan untuk ${targetTime}`
          : `Task "${backlogItem.title}" scheduled for ${targetTime}!`,
        'success'
      );
    },
    [backlogTasks, language, showToast]
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

  const openAddTaskModal = useCallback((task?: MobileTask) => {
    setTaskToEdit(task || null);
    setIsAddTaskModalOpen(true);
  }, []);

  const closeAddTaskModal = useCallback(() => {
    setTaskToEdit(null);
    setIsAddTaskModalOpen(false);
  }, []);

  const selectedDateTitle = useMemo(() => {
    const s = selectedCalendarDay;
    const suffix = s === 1 || s === 21 || s === 31 ? 'st' : s === 2 || s === 22 ? 'nd' : s === 3 || s === 23 ? 'rd' : 'th';
    return language === 'id' ? `Oktober, ${s}${suffix} 2026` : `October, ${s}${suffix} 2026`;
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
      setSelectedCalendarDay(3);
    } else if (direction === 'prev') {
      setCalendarOffsetDays((prev) => prev - 1);
      setSelectedCalendarDay((prev) => Math.max(1, prev - 1));
    } else if (direction === 'next') {
      setCalendarOffsetDays((prev) => prev + 1);
      setSelectedCalendarDay((prev) => Math.min(31, prev + 1));
    }
  }, []);

  const activeCalendarDate = useMemo(() => {
    const base = new Date(2026, 9, 24);
    const target = new Date(base.getTime() + calendarOffsetDays * 86400000);

    if (calendarOffsetDays === 0) {
      return language === 'id' ? 'Hari Ini, 24 Okt' : 'Today, Oct 24';
    } else if (calendarOffsetDays === -1) {
      return language === 'id' ? 'Kemarin, 23 Okt' : 'Yesterday, Oct 23';
    } else if (calendarOffsetDays === 1) {
      return language === 'id' ? 'Besok, 25 Okt' : 'Tomorrow, Oct 25';
    }

    const dayName =
      language === 'id'
        ? ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][target.getDay()]
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][target.getDay()];
    const monthName =
      language === 'id'
        ? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][target.getMonth()]
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][target.getMonth()];

    return `${dayName}, ${target.getDate()} ${monthName}`;
  }, [calendarOffsetDays, language]);

  // Dynamic Badge Counts
  const badgeCounts = useMemo(() => {
    const todayPlanCount = tasks.filter((t) => t.status !== 'completed').length;
    const tasksCount = todayPlanCount + backlogTasks.length;
    const rescheduleCount = rebalanceProposal && !rescheduleAlertResolved && !rescheduleAlertDismissed ? 1 : 0;
    const insightsCount = weeklyWorkloads.filter((w) => w.percentage > 90).length;
    return {
      todayPlan: todayPlanCount,
      tasks: tasksCount,
      reschedule: rescheduleCount,
      insights: insightsCount,
    };
  }, [tasks, backlogTasks.length, rebalanceProposal, rescheduleAlertResolved, rescheduleAlertDismissed, weeklyWorkloads]);

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
        otpPurpose,
        isResetPasswordPending,
        authView,
        login,
        loginAsGuest,
        register,
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
        selectedRhythm,
        selectedStyle,
        startHour,
        endHour,
        restMinutesPerTask,
        setOnboardingStep,
        setOnboardingUsername,
        setSelectedOccupancy,
        addCategory,
        removeCategory,
        setSelectedRhythm,
        setSelectedStyle,
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
        categoryBudgets,
        backlogTasks,
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
      }}
    >
      {children}
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
