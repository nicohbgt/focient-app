'use client';

import React from 'react';
import { FocientProvider } from '../../state/focient-store';
import { DashboardScreen } from '../../screens/dashboard/DashboardScreen';
import { MainAppShell } from '../../screens/components/MainAppShell';
import { MobileFrame } from '../../screens/components/MobileFrame';
import { AddTaskModal } from '../../screens/tasks/AddTaskModal';
import { TaskDetailModal } from '../../screens/tasks/TaskDetailModal';

export default function DashboardPage() {
  return (
    <FocientProvider>
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900">
        <MobileFrame>
          <MainAppShell>
            <DashboardScreen />
          </MainAppShell>
        </MobileFrame>
        <AddTaskModal />
        <TaskDetailModal />
      </div>
    </FocientProvider>
  );
}
