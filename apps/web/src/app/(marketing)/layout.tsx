import React from 'react';
import { MarketingHeader } from '../../screens/landing/MarketingHeader';
import { MarketingFooter } from '../../screens/landing/MarketingFooter';
import { TermsModal } from '../../screens/auth/TermsModal';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col">
      <MarketingHeader />
      <main className="flex-1">
        {children}
      </main>
      <MarketingFooter />
      <TermsModal />
    </div>
  );
}
