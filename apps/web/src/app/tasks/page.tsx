'use client';

import React from 'react';
import { FocientProvider } from '../../state/focient-store';
import { TaskListScreen } from '../../screens/tasks/TaskListScreen';
import { AppNavigation } from '../../screens/components/AppNavigation';
import { MobileFrame } from '../../screens/components/MobileFrame';
import { ScreenInspectorOverlay } from '../../screens/inspector/ScreenInspectorOverlay';
import { AddTaskModal } from '../../screens/tasks/AddTaskModal';
import { TaskDetailModal } from '../../screens/tasks/TaskDetailModal';

export default function TasksPage() {
  return (
    <FocientProvider>
      <div className="min-h-screen bg-neutral-canvas flex flex-col font-sans antialiased text-slate-900">
        <ScreenInspectorOverlay />
        <AppNavigation />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <MobileFrame>
            <TaskListScreen />
          </MobileFrame>
        </main>
        <AddTaskModal />
        <TaskDetailModal />
      </div>
    </FocientProvider>
  );
}
