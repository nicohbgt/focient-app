'use client';

import React from 'react';
import { FocientProvider } from '../../state/focient-store';
import { SettingsScreen } from '../../screens/settings/SettingsScreen';
import { MainAppShell } from '../../screens/components/MainAppShell';
import { MobileFrame } from '../../screens/components/MobileFrame';
import { AddTaskModal } from '../../screens/tasks/AddTaskModal';
import { TaskDetailModal } from '../../screens/tasks/TaskDetailModal';

export default function SettingsPage() {
  return (
    <FocientProvider>
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900">
        <MobileFrame>
          <MainAppShell>
            <SettingsScreen />
          </MainAppShell>
        </MobileFrame>
        <AddTaskModal />
        <TaskDetailModal />
      </div>
    </FocientProvider>
  );
}
