'use client';

import React, { useState } from 'react';
import { useFocient } from '../../state/focient-store';
import { ArrowLeftIcon, ArrowRightIcon, SparklesIcon, SunIcon, MoonIcon, ActivityIcon } from '../../components/icons';

export const Step2RhythmScreen: React.FC = () => {
  const {
    selectedRhythm,
    setSelectedRhythm,
    selectedStyle,
    setSelectedStyle,
    setOnboardingStep,
    language,
  } = useFocient();

  const [error, setError] = useState<string | null>(null);

  const rhythms = [
    {
      id: 'Early Bird',
      titleEn: 'Early Bird',
      titleId: 'Early Bird',
      badgeEn: '08:00 - 12:00',
      badgeId: '08:00 - 12:00',
      descEn: 'Peak cognitive focus in the morning. Best for strategic planning and deep problem solving.',
      descId: 'Puncak fokus kognitif di pagi hari. Cocok untuk perencanaan strategis dan pemecahan masalah rumit.',
      icon: <SunIcon size="sm" />,
    },
    {
      id: 'Steady Pacer',
      titleEn: 'Steady Pacer',
      titleId: 'Steady Pacer',
      badgeEn: 'All-Day Rhythm',
      badgeId: 'Ritme Seharian',
      descEn: 'Balanced energy throughout the day with regular interval pauses to sustain momentum.',
      descId: 'Tingkat energi seimbang sepanjang hari dengan jeda berkala untuk menjaga momentum.',
      icon: <ActivityIcon size="sm" />,
    },
    {
      id: 'Night Owl',
      titleEn: 'Night Owl',
      titleId: 'Night Owl',
      badgeEn: '16:00 - 21:00',
      badgeId: '16:00 - 21:00',
      descEn: 'Flow state thrives in late afternoon and evening when interruptions decline.',
      descId: 'Kondisi flow state optimal di sore hingga malam hari saat gangguan eksternal berkurang.',
      icon: <MoonIcon size="sm" />,
    },
  ];

  const styles = [
    {
      id: 'Structured',
      titleEn: 'Structured',
      titleId: 'Terstruktur',
      descEn: 'Clear time-boxed slots with planned buffer rests.',
      descId: 'Slot waktu terencana jelas dengan jeda istirahat teratur.',
    },
    {
      id: 'Flexible',
      titleEn: 'Flexible',
      titleId: 'Fleksibel',
      descEn: 'Fluid sequencing that adapts naturally to the flow of work.',
      descId: 'Urutan mengalir dinamis yang menyesuaikan laju kerja tanpa beban.',
    },
  ];

  const handleNext = () => {
    if (!selectedRhythm || !selectedStyle) {
      setError(
        language === 'id'
          ? 'Pilih ritme energi harian dan gaya penjadwalan Anda'
          : 'Please select both your energy rhythm and scheduling style'
      );
      return;
    }
    setError(null);
    setOnboardingStep(3);
  };

  return (
    <div className="min-h-full flex flex-col justify-center px-4 py-8 max-w-lg mx-auto w-full animate-fade-in">
      {/* Top Header & Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span>{language === 'id' ? 'Langkah 2 dari 5' : 'Step 2 of 5'}</span>
          <button
            type="button"
            onClick={() => setOnboardingStep(1)}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800"
          >
            <ArrowLeftIcon size="xs" />
            <span>{language === 'id' ? 'Sebelumnya' : 'Back'}</span>
          </button>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div className="bg-blue-600 h-full w-2/5 transition-all duration-300 rounded-full" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          {language === 'id' ? 'Ritme Kerja Harian' : 'Working Rhythm Setup'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {language === 'id'
            ? 'Selaraskan penempatan tugas dengan waktu puncak energi alami Anda.'
            : 'Align task placement with your natural peak energy levels.'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Section 1: Daily Energy Rhythm */}
        <div className="space-y-4 mb-6">
          <label className="block text-xs font-semibold text-slate-700">
            {language === 'id' ? '1. Ritme Energi Harian' : '1. Daily Energy Rhythm'}
          </label>
          <div className="space-y-2.5">
            {rhythms.map((r) => {
              const isSelected = selectedRhythm === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedRhythm(r.id);
                    setError(null);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {r.icon}
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        {language === 'id' ? r.titleId : r.titleEn}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {language === 'id' ? r.badgeId : r.badgeEn}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-8">
                    {language === 'id' ? r.descId : r.descEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Scheduling Style */}
        <div className="space-y-3 mb-6">
          <label className="block text-xs font-semibold text-slate-700">
            {language === 'id' ? '2. Gaya Penjadwalan' : '2. Scheduling Style'}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {styles.map((s) => {
              const isSelected = selectedStyle === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedStyle(s.id);
                    setError(null);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all text-left ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="text-sm font-bold text-slate-900 mb-1">
                    {language === 'id' ? s.titleId : s.titleEn}
                  </div>
                  <div className="text-xs text-slate-600 leading-snug">
                    {language === 'id' ? s.descId : s.descEn}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={handleNext}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <span>{language === 'id' ? 'Lanjutkan ke Alokasi Waktu' : 'Continue to Time Allocation'}</span>
          <ArrowRightIcon size="sm" />
        </button>
      </div>
    </div>
  );
};
