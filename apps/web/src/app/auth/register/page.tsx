'use client';

import { RegisterScreen } from '../../../screens/auth/RegisterScreen';
import { FocientProvider } from '../../../state/focient-store';
import { MobileFrame } from '../../../screens/components/MobileFrame';

export default function RegisterPage() {
  return (
    <FocientProvider>
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center">
        <MobileFrame>
          <RegisterScreen />
        </MobileFrame>
      </div>
    </FocientProvider>
  );
}
