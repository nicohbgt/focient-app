'use client';

import React, { useState } from 'react';
import { useFocient } from '../../state/focient-store';
import { ArrowLeftIcon, ArrowRightIcon, ClockIcon } from '../../components/icons';

export const Step3TimeScreen: React.FC = () => {
  const {
    startHour,
    endHour,
    restMinutesPerTask,
    setTimeAllocation,
    setOnboardingStep,
    language,
  } = useFocient();

  const [localStart, setLocalStart] = useState(startHour || '09:00');
  const [localEnd, setLocalEnd] = useState(endHour || '17:00');
  const [restMinutes, setRestMinutes] = useState(restMinutesPerTask || 20);
  const [error, setError] = useState<string | null>(null);

  const calculateHours = () => {
    try {
      const [sh, sm] = localStart.split(':').map((n) => parseInt(n, 10));
      const [eh, em] = localEnd.split(':').map((n) => parseInt(n, 10));
      const startMin = sh * 60 + (sm || 0);
      const endMin = eh * 60 + (em || 0);
      if (endMin <= startMin) return null;
      return ((endMin - startMin) / 60).toFixed(1).replace('.0', '');
    } catch {
      return null;
    }
  };

  const hoursDiff = calculateHours();

  const handleNext = () => {
    if (!hoursDiff) {
      setError(
        language === 'id'
          ? 'Jam selesai kerja harus setelah jam mulai'
          : 'End work time must be after start work time'
      );
      return;
    }
    setError(null);
    setTimeAllocation(localStart, localEnd, restMinutes);
    setOnboardingStep(4);
  };

  return (
    <div className="min-h-full flex flex-col justify-center px-4 py-8 max-w-lg mx-auto w-full animate-fade-in">
      {/* Top Header & Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span>{language === 'id' ? 'Langkah 3 dari 5' : 'Step 3 of 5'}</span>
          <button
            type="button"
            onClick={() => setOnboardingStep(2)}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800"
          >
            <ArrowLeftIcon size="xs" />
            <span>{language === 'id' ? 'Sebelumnya' : 'Back'}</span>
          </button>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div className="bg-blue-600 h-full w-3/5 transition-all duration-300 rounded-full" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          {language === 'id' ? 'Alokasi Waktu Harian' : 'Time Allocation Setup'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {language === 'id'
            ? 'Atur batas jam kerja aktif dan jeda istirahat untuk melindungi energi Anda.'
            : 'Set your daily active work hours and rest intervals to protect your energy.'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Active Hours Range */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                {language === 'id' ? 'Jam Kerja Aktif' : 'Daily Active Hours'}
              </label>
              {hoursDiff && (
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {hoursDiff} {language === 'id' ? 'Jam / Hari' : 'Hours / Day'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-[11px] text-slate-500 mb-1">
                  {language === 'id' ? 'Mulai Kerja' : 'Start Time'}
                </span>
                <input
                  type="time"
                  value={localStart}
                  onChange={(e) => {
                    setLocalStart(e.target.value);
                    setError(null);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-800"
                />
              </div>

              <div>
                <span className="block text-[11px] text-slate-500 mb-1">
                  {language === 'id' ? 'Selesai Kerja' : 'End Time'}
                </span>
                <input
                  type="time"
                  value={localEnd}
                  onChange={(e) => {
                    setLocalEnd(e.target.value);
                    setError(null);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Rest Time Slider */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <ClockIcon size="xs" />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  {language === 'id' ? 'Jeda Istirahat Pasca-Tugas' : 'Rest Buffer After Each Task'}
                </span>
              </div>
              <span className="text-xs font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 tabular-nums">
                {restMinutes} {language === 'id' ? 'Menit' : 'Minutes'}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="30"
              step="5"
              value={restMinutes}
              onChange={(e) => setRestMinutes(parseInt(e.target.value, 10))}
              className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />

            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold tabular-nums">
              <span>0m</span>
              <span>10m</span>
              <span>20m (Recommended)</span>
              <span>30m</span>
            </div>

            <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
              {language === 'id'
                ? 'Jeda istirahat 15–20 menit terbukti menjaga kejernihan kognitif dan mencegah kelelahan mental.'
                : 'A 15–20 minute resting buffer is scientifically proven to preserve cognitive focus and prevent burnout.'}
            </p>
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>{language === 'id' ? 'Lanjutkan ke Tugas Pertama' : 'Continue to First Task'}</span>
            <ArrowRightIcon size="sm" />
          </button>
        </div>
      </div>
    </div>
  );
};
