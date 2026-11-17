'use client';

import React from 'react';
import { FocientProvider } from '../../state/focient-store';
import { OnboardingFlow } from '../../screens/onboarding/OnboardingFlow';
import { MobileFrame } from '../../screens/components/MobileFrame';

export default function OnboardingPage() {
  return (
    <FocientProvider>
      <div className="min-h-screen bg-slate-100 flex flex-col relative font-sans antialiased text-slate-900">
        <MobileFrame>
          <OnboardingFlow />
        </MobileFrame>
      </div>
    </FocientProvider>
  );
}
