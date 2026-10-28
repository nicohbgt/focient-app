'use client';

import React, { useEffect } from 'react';
import { FocientProvider, useFocient } from '../state/focient-store';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OtpScreen } from '../screens/auth/OtpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { TermsModal } from '../screens/auth/TermsModal';
import { OnboardingFlow } from '../screens/onboarding/OnboardingFlow';
import { Step1WorkspaceScreen } from '../screens/onboarding/Step1WorkspaceScreen';
import { Step2RhythmScreen } from '../screens/onboarding/Step2RhythmScreen';
import { Step3TimeScreen } from '../screens/onboarding/Step3TimeScreen';
import { Step4TaskScreen } from '../screens/onboarding/Step4TaskScreen';
import { Step5ReviewScreen } from '../screens/onboarding/Step5ReviewScreen';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { TodayPlanScreen } from '../screens/plan/TodayPlanScreen';
import { TaskListScreen } from '../screens/tasks/TaskListScreen';
import { AddTaskModal } from '../screens/tasks/AddTaskModal';
import { TaskDetailModal } from '../screens/tasks/TaskDetailModal';
import { ScreenInspectorOverlay } from '../screens/inspector/ScreenInspectorOverlay';
import { MobileFrame } from '../screens/components/MobileFrame';
import { AppNavigation } from '../screens/components/AppNavigation';

function FocientAppContent() {
  const {
    isAuthenticated,
    isOtpPending,
    isResetPasswordPending,
    authView,
    onboardingStep,
    activeNavTab,
    inspectorView,
    toast,
    hideToast,
    openAddTaskModal,
    setSelectedTaskForDetail,
    tasks,
  } = useFocient();

  // If inspecting addTask or taskDetail directly, make sure mock modals open
  useEffect(() => {
    if (inspectorView === 'addTask') {
      openAddTaskModal();
    } else if (inspectorView === 'taskDetail') {
      const sample = tasks[0] || null;
      setSelectedTaskForDetail(sample);
    }
  }, [inspectorView, tasks, openAddTaskModal, setSelectedTaskForDetail]);

  const renderActiveScreen = () => {
    // 1. Direct Inspector Overrides
    switch (inspectorView) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'login':
        return <LoginScreen />;
      case 'register':
        return <RegisterScreen />;
      case 'otp':
        return <OtpScreen />;
      case 'forgotPassword':
        return <ForgotPasswordScreen />;
      case 'resetPassword':
        return <ResetPasswordScreen />;
      case 'step1Workspace':
        return <Step1WorkspaceScreen />;
      case 'step2Rhythm':
        return <Step2RhythmScreen />;
      case 'step3Time':
        return <Step3TimeScreen />;
      case 'step4Task':
        return <Step4TaskScreen />;
      case 'step5Review':
        return <Step5ReviewScreen />;
      case 'dashboard':
        return (
          <div className="flex flex-col min-h-screen">
            <AppNavigation />
            <main className="flex-1 p-4 sm:p-6 md:p-8">
              <DashboardScreen />
            </main>
          </div>
        );
      case 'todayPlan':
        return (
          <div className="flex flex-col min-h-screen">
            <AppNavigation />
            <main className="flex-1 p-4 sm:p-6 md:p-8">
              <TodayPlanScreen />
            </main>
          </div>
        );
      case 'taskList':
        return (
          <div className="flex flex-col min-h-screen">
            <AppNavigation />
            <main className="flex-1 p-4 sm:p-6 md:p-8">
              <TaskListScreen />
            </main>
          </div>
        );
      case 'addTask':
      case 'taskDetail':
        return (
          <div className="flex flex-col min-h-screen">
            <AppNavigation />
            <main className="flex-1 p-4 sm:p-6 md:p-8">
              <DashboardScreen />
            </main>
          </div>
        );
      case 'fullFlow':
      default:
        break;
    }

    // 2. Full End-to-End Dynamic Workflow
    if (!isAuthenticated) {
      if (isOtpPending) return <OtpScreen />;
      if (isResetPasswordPending) return <ResetPasswordScreen />;

      switch (authView) {
        case 'welcome':
          return <WelcomeScreen />;
        case 'login':
          return <LoginScreen />;
        case 'register':
          return <RegisterScreen />;
        case 'otp':
          return <OtpScreen />;
        case 'forgotPassword':
          return <ForgotPasswordScreen />;
        case 'resetPassword':
          return <ResetPasswordScreen />;
        default:
          return <WelcomeScreen />;
      }
    }

    // Authenticated: Multi-Step Onboarding if not completed
    if (onboardingStep < 5) {
      return <OnboardingFlow />;
    }

    // Authenticated & Onboarded: Main Focus Application
    return (
      <div className="flex flex-col min-h-screen bg-neutral-canvas">
        <AppNavigation />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {activeNavTab === 'dashboard' && <DashboardScreen />}
          {activeNavTab === 'plan' && <TodayPlanScreen />}
          {activeNavTab === 'tasks' && <TaskListScreen />}
          {activeNavTab === 'addTask' && <DashboardScreen />}
        </main>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col relative font-sans antialiased text-slate-900">
      {/* Floating Developer Screen Inspector */}
      <ScreenInspectorOverlay />

      {/* Screen Presentation (Full Responsive vs Realistic Mobile Frame) */}
      <MobileFrame>{renderActiveScreen()}</MobileFrame>

      {/* Global Modals */}
      <TermsModal />
      <AddTaskModal />
      <TaskDetailModal />

      {/* Global Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-focient-4 animate-slide-up border border-slate-700 max-w-sm w-full mx-4"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="flex-1 truncate">{toast.message}</span>
          {toast.undoAction && (
            <button
              type="button"
              onClick={() => {
                toast.undoAction?.();
                hideToast();
              }}
              className="text-blue-400 hover:text-blue-300 font-bold px-1.5 py-0.5 rounded hover:bg-slate-800"
            >
              Undo
            </button>
          )}
          <button
            type="button"
            onClick={hideToast}
            className="text-slate-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <FocientProvider>
      <FocientAppContent />
    </FocientProvider>
  );
}
