'use client';

import React, { useEffect } from 'react';
import { FocientProvider, useFocient } from '../state/focient-store';
import { LandingPageScreen } from '../screens/landing/LandingPageScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
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
import { InsightsScreen } from '../screens/insights/InsightsScreen';
import { ReschedulingScreen } from '../screens/rescheduling/ReschedulingScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { AddTaskModal } from '../screens/tasks/AddTaskModal';
import { TaskDetailModal } from '../screens/tasks/TaskDetailModal';
import { MobileFrame } from '../screens/components/MobileFrame';
import { AppNavigation } from '../screens/components/AppNavigation';
import { MainAppShell } from '../screens/components/MainAppShell';

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
      case 'landing':
      case 'welcome':
        return <LandingPageScreen />;
      case 'login':
        return <LoginScreen />;
      case 'register':
        return <RegisterScreen />;
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
          <MainAppShell>
            <DashboardScreen />
          </MainAppShell>
        );
      case 'todayPlan':
        return (
          <MainAppShell>
            <TodayPlanScreen />
          </MainAppShell>
        );
      case 'taskList':
        return (
          <MainAppShell>
            <TaskListScreen />
          </MainAppShell>
        );
      case 'reschedule':
        return (
          <MainAppShell>
            <ReschedulingScreen />
          </MainAppShell>
        );
      case 'insights':
        return (
          <MainAppShell>
            <InsightsScreen />
          </MainAppShell>
        );
      case 'settings':
        return (
          <MainAppShell>
            <SettingsScreen />
          </MainAppShell>
        );
      case 'addTask':
      case 'taskDetail':
        return (
          <MainAppShell>
            <DashboardScreen />
          </MainAppShell>
        );
      case 'fullFlow':
      default:
        break;
    }

    // 2. Application Flow State Machine (Always starts at Landing Page on cold start / dev run)
    if (authView === 'landing' || authView === 'welcome') {
      return <LandingPageScreen />;
    }
    if (authView === 'login') {
      return <LoginScreen />;
    }
    if (authView === 'register') {
      return <RegisterScreen />;
    }
    if (authView === 'forgotPassword') {
      return <ForgotPasswordScreen />;
    }
    if (authView === 'resetPassword' || isResetPasswordPending) {
      return <ResetPasswordScreen />;
    }
    if (authView === 'onboarding' || (isAuthenticated && onboardingStep < 5 && authView !== 'dashboard')) {
      return <OnboardingFlow />;
    }

    // 3. Authenticated Dashboard & Feature Navigation
    return (
      <MainAppShell>
        {activeNavTab === 'dashboard' && <DashboardScreen />}
        {activeNavTab === 'plan' && <TodayPlanScreen />}
        {activeNavTab === 'tasks' && <TaskListScreen />}
        {activeNavTab === 'reschedule' && <TodayPlanScreen />}
        {activeNavTab === 'insights' && <InsightsScreen />}
        {activeNavTab === 'settings' && <SettingsScreen />}
        {activeNavTab === 'addTask' && <DashboardScreen />}
      </MainAppShell>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col relative font-sans antialiased text-slate-900">
      {/* Screen Presentation (Fluid Responsive Layout) */}
      <MobileFrame>{renderActiveScreen()}</MobileFrame>

      {/* Global Modals */}
      <TermsModal />
      <AddTaskModal />
      <TaskDetailModal />
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
