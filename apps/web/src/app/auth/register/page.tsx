'use client';

import React from 'react';
import { FocientProvider } from '../../../state/focient-store';
import { RegisterScreen } from '../../../screens/auth/RegisterScreen';
import { MobileFrame } from '../../../screens/components/MobileFrame';
import { ScreenInspectorOverlay } from '../../../screens/inspector/ScreenInspectorOverlay';

export default function RegisterPage() {
  return (
    <FocientProvider>
      <div className="min-h-screen bg-slate-100 flex flex-col relative font-sans antialiased text-slate-900">
        <ScreenInspectorOverlay />
        <MobileFrame>
          <RegisterScreen />
        </MobileFrame>
      </div>
    </FocientProvider>
  );
}
