'use client';

import React from 'react';
import { FocientProvider } from '../../state/focient-store';
import { TodayPlanScreen } from '../../screens/plan/TodayPlanScreen';
import { AppNavigation } from '../../screens/components/AppNavigation';
import { MobileFrame } from '../../screens/components/MobileFrame';
import { ScreenInspectorOverlay } from '../../screens/inspector/ScreenInspectorOverlay';
import { AddTaskModal } from '../../screens/tasks/AddTaskModal';
import { TaskDetailModal } from '../../screens/tasks/TaskDetailModal';

export default function PlanPage() {
  return (
    <FocientProvider>
      <div className="min-h-screen bg-neutral-canvas flex flex-col font-sans antialiased text-slate-900">
        <ScreenInspectorOverlay />
        <AppNavigation />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <MobileFrame>
            <TodayPlanScreen />
          </MobileFrame>
        </main>
        <AddTaskModal />
        <TaskDetailModal />
      </div>
    </FocientProvider>
  );
}
