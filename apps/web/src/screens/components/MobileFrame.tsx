'use client';

import React from 'react';
import { useFocient } from '../../state/focient-store';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const { devicePreview } = useFocient();

  if (devicePreview === 'responsive') {
    return <div className="min-h-screen w-full">{children}</div>;
  }

  return (
    <div className="min-h-screen w-full bg-slate-900 py-6 sm:py-10 px-4 flex items-center justify-center">
      {/* Mobile Device Mockup Frame */}
      <div className="relative w-full max-w-[420px] h-[880px] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700/60 ring-1 ring-white/10 flex flex-col overflow-hidden">
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-2 ring-1 ring-slate-800" />
          <div className="w-2 h-2 rounded-full bg-blue-950" />
        </div>

        {/* Screen Bezel / Canvas */}
        <div className="relative flex-1 bg-slate-50 rounded-[40px] overflow-hidden flex flex-col">
          {/* Simulated Mobile Status Bar */}
          <div className="h-10 pt-2 px-6 flex items-center justify-between text-[11px] font-bold text-slate-800 shrink-0 z-30 select-none">
            <span>09:41</span>
            <div className="flex items-center gap-1.5 text-xs">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* Screen Content Body */}
          <div className="flex-1 overflow-y-auto">{children}</div>

          {/* Bottom Home Indicator Bar */}
          <div className="h-5 flex items-center justify-center bg-transparent shrink-0">
            <div className="w-32 h-1 rounded-full bg-slate-400/80" />
          </div>
        </div>
      </div>
    </div>
  );
};
