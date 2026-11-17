'use client';

import React from 'react';
import { FocientProvider } from '../../state/focient-store';
import { TaskListScreen } from '../../screens/tasks/TaskListScreen';
import { MainAppShell } from '../../screens/components/MainAppShell';
import { MobileFrame } from '../../screens/components/MobileFrame';
import { AddTaskModal } from '../../screens/tasks/AddTaskModal';
import { TaskDetailModal } from '../../screens/tasks/TaskDetailModal';

export default function TasksPage() {
  return (
    <FocientProvider>
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900">
        <MobileFrame>
          <MainAppShell>
            <TaskListScreen />
          </MainAppShell>
        </MobileFrame>
        <AddTaskModal />
        <TaskDetailModal />
      </div>
    </FocientProvider>
  );
}
