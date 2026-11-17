'use client';

import { ForgotPasswordScreen } from '../../../screens/auth/ForgotPasswordScreen';
import { FocientProvider } from '../../../state/focient-store';
import { MobileFrame } from '../../../screens/components/MobileFrame';

export default function ForgotPasswordPage() {
  return (
    <FocientProvider>
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center">
        <MobileFrame>
          <ForgotPasswordScreen />
        </MobileFrame>
      </div>
    </FocientProvider>
  );
}
