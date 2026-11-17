'use client';

import { ResetPasswordScreen } from '../../../screens/auth/ResetPasswordScreen';
import { FocientProvider } from '../../../state/focient-store';
import { MobileFrame } from '../../../screens/components/MobileFrame';

export default function ResetPasswordPage() {
  return (
    <FocientProvider>
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center">
        <MobileFrame>
          <ResetPasswordScreen />
        </MobileFrame>
      </div>
    </FocientProvider>
  );
}
