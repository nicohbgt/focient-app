import React from 'react';
import { TermsModal } from '../../screens/auth/TermsModal';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center py-8 font-sans antialiased text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <main className="w-full max-w-md px-4">
        {children}
      </main>
      <TermsModal />
    </div>
  );
}
