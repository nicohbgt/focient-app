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
      badgeEn: '07:00 - 12:00',
      badgeId: '07:00 - 12:00',
      descEn: 'Most alert and focused in the morning.',
      descId: 'Paling berenergi dan fokus di pagi hari.',
      icon: <SunIcon size="sm" />,
    },
    {
      id: 'Steady Pacer',
      titleEn: 'Steady Pacer',
      titleId: 'Steady Pacer',
      badgeEn: '09:00 - 15:00',
      badgeId: '09:00 - 15:00',
      descEn: 'Steady energy all day with regular short breaks.',
      descId: 'Energi stabil sepanjang hari dengan jeda santai.',
      icon: <ActivityIcon size="sm" />,
    },
    {
      id: 'Night Owl',
      titleEn: 'Night Owl',
      titleId: 'Night Owl',
      badgeEn: '18:00 - 00:00',
      badgeId: '18:00 - 00:00',
      descEn: "Peak focus in late afternoon or evening when it's quiet.",
      descId: 'Paling fokus di sore atau malam hari saat suasana lebih tenang.',
      icon: <MoonIcon size="sm" />,
    },
  ];

  const styles = [
    {
      id: 'Structured',
      titleEn: 'Structured',
      titleId: 'Terstruktur',
      descEn: 'Prioritizes high-focus tasks early in your peak energy window in sequential time blocks. Rest buffer per task remains fully customizable by you.',
      descId: 'Mengelompokkan tugas intensitas tinggi di awal jam energi puncak secara berurutan. Jeda istirahat per tugas tetap bebas kamu atur sepenuhnya.',
    },
    {
      id: 'Flexible',
      titleEn: 'Flexible',
      titleId: 'Fleksibel',
      descEn: 'Distributes work evenly across the day, alternating high and low focus tasks. You retain complete freedom to set any rest buffer per task.',
      descId: 'Menyebar beban secara seimbang dengan menyelingi tugas berat dan ringan sepanjang hari. Bebas tentukan jeda istirahat per tugas sesuai kenyamananmu.',
    },
  ];

  const handleNext = () => {
    if (!selectedRhythm || !selectedStyle) {
      setError(
        language === 'id'
          ? 'Pilih ritme energi dan gaya jadwalmu dulu ya'
          : 'Please select both your energy rhythm and schedule style'
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
          {language === 'id' ? 'Tentukan Ritme Kerjamu' : 'Choose Your Work Rhythm'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {language === 'id'
            ? 'Kapan waktu terbaikmu untuk fokus dan bagaimana gaya kerjamu?'
            : 'When do you focus best, and how do you prefer to plan your day?'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Daily Energy Rhythm */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">
              {language === 'id' ? 'Ritme Energi Harian' : 'Daily Energy Rhythm'}
            </label>
            {!selectedRhythm && (
              <span className="text-[11px] text-slate-400 font-medium">
                {language === 'id' ? 'Belum dipilih' : 'Not selected'}
              </span>
            )}
          </div>
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

          {/* Rhythm Prioritization Note */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            {language === 'id'
              ? 'Jam ritme energi berfungsi sebagai referensi jam fokus utama (tugas berat diprioritaskan di jam ini). Alokasi tugas kamu tetap mengikuti jam kerja aktif dan jam istirahat (quiet hours) yang kamu tentukan di langkah berikutnya.'
              : 'Energy rhythm hours act as a peak-focus reference (heavy tasks are prioritized during this window). Your actual schedule remains strictly governed by your active work hours and quiet hours in the next step.'}
          </div>
        </div>

        {/* Scheduling Style */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">
              {language === 'id' ? 'Gaya Penjadwalan' : 'Scheduling Style'}
            </label>
            {!selectedStyle && (
              <span className="text-[11px] text-slate-400 font-medium">
                {language === 'id' ? 'Belum dipilih' : 'Not selected'}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {styles.map((s) => {
              const isSelected = selectedStyle === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedStyle(s.id);
                    setError(null);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all text-left flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="mb-1.5">
                      <span className="text-sm font-bold text-slate-900">
                        {language === 'id' ? s.titleId : s.titleEn}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      {language === 'id' ? s.descId : s.descEn}
                    </div>
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
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm shadow-sm transition-all text-center"
        >
          <span>{language === 'id' ? 'Lanjut' : 'Continue'}</span>
        </button>
      </div>
    </div>
  );
};
