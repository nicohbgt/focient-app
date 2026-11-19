'use client';

import React, { useState } from 'react';
import { useFocient } from '../../state/focient-store';
import { ArrowLeftIcon, ArrowRightIcon, ClockIcon, TargetIcon } from '../../components/icons';
import { TimePicker24 } from '../../components/primitive/TimePicker24';
import { calculateQuietHoursDuration } from '../../lib/date-utils';

export const Step3TimeScreen: React.FC = () => {
  const {
    startHour,
    endHour,
    quietHourStart,
    quietHourEnd,
    quietHourEnabled,
    selectedRhythm,
    restMinutesPerTask,
    setTimeAllocation,
    setOnboardingStep,
    language,
  } = useFocient();

  // Work availability starts in 00:00 state for each text box
  const [localStart, setLocalStart] = useState(startHour || '00:00');
  const [localEnd, setLocalEnd] = useState(endHour || '00:00');

  // Quiet Hours (Jam Tenang untuk istirahat tanpa tugas)
  const [localQuietStart, setLocalQuietStart] = useState(quietHourStart || '00:00');
  const [localQuietEnd, setLocalQuietEnd] = useState(quietHourEnd || '00:00');
  const [quietEnabled, setQuietEnabled] = useState(Boolean(quietHourEnabled));

  // 10m as default rest buffer
  const [restMinutes, setRestMinutes] = useState(restMinutesPerTask > 0 ? restMinutesPerTask : 10);
  const [isCustomRest, setIsCustomRest] = useState(false);
  const [customRestInput, setCustomRestInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const REST_BUFFER_PRESETS = [0, 5, 10, 15, 30, 45] as const;

  const calculateHours = (start: string, end: string) => {
    if (!start || !end || (start === '00:00' && end === '00:00')) return null;
    try {
      const [sh, sm] = start.split(':').map((n) => parseInt(n, 10));
      const [eh, em] = end.split(':').map((n) => parseInt(n, 10));
      const startMin = sh * 60 + (sm || 0);
      const endMin = eh * 60 + (em || 0);
      if (endMin <= startMin) return null;
      return ((endMin - startMin) / 60).toFixed(1).replace('.0', '');
    } catch {
      return null;
    }
  };

  const workHoursDiff = calculateHours(localStart, localEnd);
  const quietHoursDiff = quietEnabled ? calculateQuietHoursDuration(localQuietStart, localQuietEnd) : null;

  const handleNext = () => {
    if (!localStart || !localEnd || (localStart === '00:00' && localEnd === '00:00')) {
      setError(
        language === 'id'
          ? 'Silakan tentukan jam mulai dan selesai ketersediaan kerja'
          : 'Please configure your work availability start and end times'
      );
      return;
    }
    if (!workHoursDiff) {
      setError(
        language === 'id'
          ? 'Jam selesai ketersediaan kerja harus setelah jam mulai'
          : 'Work availability end time must be after start time'
      );
      return;
    }
    if (quietEnabled && localQuietStart && localQuietEnd && !(localQuietStart === '00:00' && localQuietEnd === '00:00')) {
      if (localQuietStart === localQuietEnd) {
        setError(
          language === 'id'
            ? 'Jam mulai dan selesai jam tenang tidak boleh sama'
            : 'Quiet hours start and end times cannot be identical'
        );
        return;
      }
    }
    setError(null);
    setTimeAllocation(
      localStart,
      localEnd,
      restMinutes,
      undefined,
      undefined,
      localQuietStart,
      localQuietEnd,
      quietEnabled
    );
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
          {language === 'id' ? 'Atur Waktu Kerjamu' : 'Set Your Work Time'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {language === 'id'
            ? 'Tentukan jam mulai kerja, jam selesai, dan waktu istirahat.'
            : 'Set your work hours and break time.'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Concept 1: Work Availability (Work Hours) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  <label className="text-xs font-bold text-slate-900">
                    {language === 'id' ? 'Jam Kerja Harian' : 'Daily Work Hours'}
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {language === 'id'
                    ? 'Rentang waktu yang tersedia untuk tugas pekerjaan.'
                    : 'Time window available for your work tasks.'}
                </p>
              </div>

              {workHoursDiff ? (
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {workHoursDiff} {language === 'id' ? 'Jam / Hari' : 'Hours / Day'}
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {language === 'id' ? 'Belum diatur' : 'Not set'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {language === 'id' ? 'Mulai Kerja' : 'Start Time'}
                </span>
                <TimePicker24
                  value={localStart}
                  onChange={(val) => {
                    setLocalStart(val);
                    setError(null);
                  }}
                  placeholder="00:00"
                  language={language}
                  size="lg"
                />
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {language === 'id' ? 'Selesai Kerja' : 'End Time'}
                </span>
                <TimePicker24
                  value={localEnd}
                  onChange={(val) => {
                    setLocalEnd(val);
                    setError(null);
                  }}
                  placeholder="00:00"
                  language={language}
                  size="lg"
                />
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic">
              {language === 'id'
                ? '*Work Availability hanya berlaku untuk tugas dalam konteks pekerjaan Anda.'
                : '*Work Availability strictly applies to tasks within your configured job context.'}
            </p>
          </div>

          {/* Quiet Hours (Jam Tenang untuk Istirahat Tanpa Tugas) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-700 shrink-0" />
                  <label className="text-xs font-bold text-slate-900">
                    {language === 'id' ? 'Jam Tenang Malam' : 'Quiet Hours'}
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {language === 'id'
                    ? 'Waktu istirahat malam agar tidak ada tugas yang dijadwalkan.'
                    : 'Set aside resting hours so no tasks are scheduled.'}
                </p>
              </div>

              {quietHoursDiff ? (
                <span className="text-xs font-bold text-slate-800 bg-slate-200/80 px-2.5 py-0.5 rounded-full border border-slate-300">
                  {quietHoursDiff} {language === 'id' ? 'Jam Istirahat' : 'Hours Rest'}
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {language === 'id' ? 'Belum diatur' : 'Not set'}
                </span>
              )}
            </div>

            {/* Toggle Enable Quiet Hours */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-50/80 transition-colors">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  {language === 'id' ? 'Aktifkan Batasan Jam Tenang' : 'Enable Quiet Hours Protection'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {language === 'id'
                    ? 'Mencegah penjadwalan tugas selama jam istirahat ini'
                    : 'Blocks task additions during this rest window'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={quietEnabled}
                onChange={(e) => setQuietEnabled(e.target.checked)}
                className="rounded border-slate-300 text-slate-800 focus:ring-slate-500 w-4 h-4 cursor-pointer"
              />
            </label>

            {quietEnabled && (
              <div className="space-y-3 pt-1 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {language === 'id' ? 'Mulai Jam Tenang' : 'Quiet Start Time'}
                    </span>
                    <TimePicker24
                      value={localQuietStart}
                      onChange={(val) => {
                        setLocalQuietStart(val);
                        setError(null);
                      }}
                      placeholder="00:00"
                      language={language}
                      size="lg"
                    />
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {language === 'id' ? 'Selesai Jam Tenang' : 'Quiet End Time'}
                    </span>
                    <TimePicker24
                      value={localQuietEnd}
                      onChange={(val) => {
                        setLocalQuietEnd(val);
                        setError(null);
                      }}
                      placeholder="00:00"
                      language={language}
                      size="lg"
                    />
                  </div>
                </div>

                

                <p className="text-[10px] text-slate-500 italic">
                  {language === 'id'
                    ? '*Sistem akan menolak penambahan atau penjadwalan tugas pada rentang waktu ini untuk memastikan waktu istirahat Anda terlindungi.'
                    : '*The system will prevent scheduling tasks within this window to ensure your rest is protected.'}
                </p>
              </div>
            )}

          {/* Concept 4: Rest Buffer */}
          <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                  <span className="text-xs font-bold text-teal-950">
                    {language === 'id' ? 'Jeda Istirahat' : 'Rest Buffer'}
                  </span>
                </div>
                <p className="text-[11px] text-teal-800 mt-0.5">
                  {language === 'id'
                    ? 'Jeda yang disediakan di antara alokasi pekerjaan.'
                    : 'Buffer provided between work task allocations.'}
                </p>
              </div>

              <span className="text-xs font-extrabold text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-full border border-teal-300 tabular-nums">
                {restMinutes} {language === 'id' ? 'Menit' : 'Minutes'}
              </span>
            </div>

            {/* Rest Buffer Pills (0, 5, 10, 15, 30, 45, custom) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar touch-pan-x whitespace-nowrap">
              {REST_BUFFER_PRESETS.map((preset) => {
                const isSelected = !isCustomRest && restMinutes === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setRestMinutes(preset);
                      setIsCustomRest(false);
                      setCustomRestInput('');
                    }}
                    className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300'
                    }`}
                  >
                    {preset}m
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setIsCustomRest(true);
                  if (!customRestInput && restMinutes) {
                    setCustomRestInput(String(restMinutes));
                  }
                }}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isCustomRest
                    ? 'border-teal-600 bg-teal-600 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300'
                }`}
              >
                {language === 'id' ? 'Kustom' : 'Custom'}
              </button>
            </div>
            {isCustomRest && (
              <div className="flex items-center gap-2 pt-2 animate-fade-in">
                <input
                  type="number"
                  min="0"
                  max="180"
                  autoFocus
                  value={customRestInput}
                  onChange={(e) => {
                    setCustomRestInput(e.target.value);
                    const parsed = parseInt(e.target.value, 10);
                    if (!isNaN(parsed) && parsed >= 0) {
                      setRestMinutes(parsed);
                    }
                  }}
                  placeholder={language === 'id' ? 'Jeda istirahat (menit)' : 'Rest buffer (minutes)'}
                  className="w-44 px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                <span className="text-xs text-slate-500 font-medium">
                  {language === 'id' ? 'Menit' : 'Minutes'}
                </span>
              </div>
            )}
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
    </div>
  );
};
