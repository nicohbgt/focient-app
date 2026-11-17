'use client';

import React from 'react';
import { FocientProvider } from '../../state/focient-store';
import { InsightsScreen } from '../../screens/insights/InsightsScreen';
import { MainAppShell } from '../../screens/components/MainAppShell';
import { MobileFrame } from '../../screens/components/MobileFrame';
import { AddTaskModal } from '../../screens/tasks/AddTaskModal';
import { TaskDetailModal } from '../../screens/tasks/TaskDetailModal';

export default function InsightsPage() {
  return (
    <FocientProvider>
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900">
        <MobileFrame>
          <MainAppShell>
            <InsightsScreen />
          </MainAppShell>
        </MobileFrame>
        <AddTaskModal />
        <TaskDetailModal />
      </div>
    </FocientProvider>
  );
}
