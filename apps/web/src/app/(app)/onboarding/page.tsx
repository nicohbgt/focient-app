'use client';

import { useRouter } from 'next/navigation';
import { OnboardingValidationForm } from '../../../components/organism/OnboardingValidationForm.js';

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = (data: {
    workHoursLimit: number;
    startWorkTime: string;
    endWorkTime: string;
    selectedCategories: string[];
  }) => {
    // Save onboarding preferences to local session
    if (typeof window !== 'undefined') {
      localStorage.setItem('focient_onboarding', JSON.stringify(data));
    }
    router.push('/today');
  };

  return (
    <div className="min-h-screen bg-neutral-canvas py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-focus-subtle text-focus font-semibold text-xs tracking-wider uppercase mb-3">
            FoCient Setup
          </div>
          <h1 className="text-3xl font-semibold text-neutral-text tracking-tight">
            Atur Batas Waktu & Kapasitas Harian
          </h1>
          <p className="mt-2 text-sm text-neutral-text/75 font-normal">
            Batas jam kerja melindungi ritme energi Anda dari kelelahan mental (anti-burnout).
          </p>
        </div>

        <div className="bg-neutral-card p-6 md:p-8 rounded-xl border border-neutral-border shadow-focient-1">
          <OnboardingValidationForm onSubmit={handleComplete} />
        </div>
      </div>
    </div>
  );
}
