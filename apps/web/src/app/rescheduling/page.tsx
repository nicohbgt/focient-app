'use client';

import React from 'react';
import { FocientProvider } from '../../state/focient-store';
import { TodayPlanScreen } from '../../screens/plan/TodayPlanScreen';
import { MainAppShell } from '../../screens/components/MainAppShell';
import { MobileFrame } from '../../screens/components/MobileFrame';
import { AddTaskModal } from '../../screens/tasks/AddTaskModal';
import { TaskDetailModal } from '../../screens/tasks/TaskDetailModal';

export default function ReschedulingPage() {
  return (
    <FocientProvider>
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900">
        <MobileFrame>
          <MainAppShell>
            <TodayPlanScreen />
          </MainAppShell>
        </MobileFrame>
        <AddTaskModal />
        <TaskDetailModal />
      </div>
    </FocientProvider>
  );
}
