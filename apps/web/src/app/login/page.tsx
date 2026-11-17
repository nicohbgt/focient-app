'use client';

import { LoginScreen } from '../../screens/auth/LoginScreen';
import { FocientProvider } from '../../state/focient-store';
import { MobileFrame } from '../../screens/components/MobileFrame';

export default function LoginPage() {
  return (
    <FocientProvider>
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center">
        <MobileFrame>
          <LoginScreen />
        </MobileFrame>
      </div>
    </FocientProvider>
  );
}
