'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MainAppShell } from '../../screens/components/MainAppShell';
import { AddTaskModal } from '../../screens/tasks/AddTaskModal';
import { TaskDetailModal } from '../../screens/tasks/TaskDetailModal';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isOnboarding = pathname.startsWith('/onboarding');

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center font-sans antialiased text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        <main className="w-full max-w-2xl px-4 py-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <MainAppShell>
      {children}
      <AddTaskModal />
      <TaskDetailModal />
    </MainAppShell>
  );
}
