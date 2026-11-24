'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TodayPlanScreen } from '../../screens/plan/TodayPlanScreen';
import { MainAppShell } from '../../screens/components/MainAppShell';

export default function PlanPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/today');
  }, [router]);

  return (
    <MainAppShell>
      <TodayPlanScreen />
    </MainAppShell>
  );
}
