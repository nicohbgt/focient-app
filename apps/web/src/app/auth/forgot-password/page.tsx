'use client';

import React from 'react';
import { FocientProvider } from '../../../state/focient-store';
import { ForgotPasswordScreen } from '../../../screens/auth/ForgotPasswordScreen';
import { MobileFrame } from '../../../screens/components/MobileFrame';
import { ScreenInspectorOverlay } from '../../../screens/inspector/ScreenInspectorOverlay';

export default function ForgotPasswordPage() {
  return (
    <FocientProvider>
      <div className="min-h-screen bg-slate-100 flex flex-col relative font-sans antialiased text-slate-900">
        <ScreenInspectorOverlay />
        <MobileFrame>
          <ForgotPasswordScreen />
        </MobileFrame>
      </div>
    </FocientProvider>
  );
}
