'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFocient } from '../../../state/focient-store';
import { SparklesIcon, CheckIcon, TargetIcon, ClockIcon, ActivityIcon, ChevronDownIcon, ChevronUpIcon } from '../../../components/icons';

export default function GuidancePage() {
  const router = useRouter();
  const { language, loginAsGuest } = useFocient();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleDemo = async () => {
    await loginAsGuest();
    router.push('/today');
  };

  const steps = [
    {
      step: '01',
      titleId: 'Pilih Maksimal 3 Tugas Utama (Top 3)',
      titleEn: 'Select Maximum 3 Priorities (Top 3)',
      descId: 'Di pagi hari, pilih maksimal 3 tugas terpenting yang ingin kamu selesaikan. Tugas-tugas lainnya biarkan tersimpan aman di Backlog tanpa mengaburkan pandanganmu.',
      descEn: 'Each morning, isolate up to 3 high-impact tasks. The rest safely reside in your calm backlog without cluttering your cognitive viewport.',
      icon: <TargetIcon size="md" />,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      step: '02',
      titleId: 'Perhatikan Meter Kapasitas Harian',
      titleEn: 'Monitor Your Daily Capacity Meter',
      descId: 'FoCient secara otomatis menghitung durasi tugas ditambah jeda istirahat. Jika total waktu mendekati atau melebihi 8 jam, meter akan menyarankanmu memindahkan tugas ke hari lain.',
      descEn: 'FoCient automatically computes total duration plus buffer breaks. If scheduled work approaches the 8-hour cap, the capacity meter suggests delegating or deferring.',
      icon: <ClockIcon size="md" />,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      step: '03',
      titleId: 'Eksekusi Satu Tugas Sekaligus (Single-Task Flow)',
      titleEn: 'Execute in Single-Task Flow',
      descId: 'Gunakan mode fokus untuk menyelesaikan tugas secara terisolasi. Hilangkan multitasking yang menguras energi kognitif dan nikmati kepuasan menyelesaikan pekerjaan satu per satu.',
      descEn: 'Use focused execution for uninterrupted work blocks. Eliminate cognitive context switching and enjoy the satisfaction of completing tasks one by one.',
      icon: <SparklesIcon size="md" />,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      step: '04',
      titleId: 'Geser Jadwal Tanpa Rasa Bersalah Saat Hari Berubah',
      titleEn: 'Adaptively Reschedule Without Guilt',
      descId: 'Ada telepon mendadak atau rapat darurat? Cukup klik "Penyesuaian Jadwal". FoCient akan mencari slot kosong berikutnya tanpa menempelkan label "Terlambat".',
      descEn: 'Unexpected meeting or urgent call? Simply trigger adaptive rescheduling. FoCient recalculates your timeline to the next free slot without punitive labels.',
      icon: <ActivityIcon size="md" />,
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  const faqs = [
    {
      qId: 'Mengapa FoCient membatasi hanya 3 tugas utama?',
      qEn: 'Why does FoCient limit to only 3 top priorities?',
      aId: 'Riset neurosains menunjukkan bahwa otak manusia mengalami kelelahan keputusan jika dihadapkan pada terlalu banyak pilihan. Tiga prioritas utama adalah titik optimal antara pencapaian tinggi dan stabilitas mental.',
      aEn: 'Neuroscience research indicates the brain suffers severe cognitive fatigue when juggling too many parallel commitments. Three priorities represent the sweet spot between high achievement and emotional equilibrium.',
    },
    {
      qId: 'Bagaimana jika saya memiliki lebih dari 3 tugas?',
      qEn: 'What if I have more than 3 tasks to do today?',
      aId: 'Kamu tetap bisa menambahkan tugas tambahan dengan prioritas Normal atau Ringan. Tugas tersebut akan tersusun rapi setelah Top 3 selesai dikerjakan.',
      aEn: 'You can add additional tasks marked as Normal or Light priority. They will be scheduled systematically once your Top 3 tasks are underway or completed.',
    },
    {
      qId: 'Apakah data tugas saya aman dan bisa dipakai offline?',
      qEn: 'Are my tasks safe and accessible offline?',
      aId: 'Ya! FoCient menggunakan arsitektur Local-First. Semua data tersimpan aman di browser perangkatmu secara instan dan akan otomatis disinkronkan ke cloud saat online.',
      aEn: 'Yes! FoCient is engineered with a Local-First architecture. All entries are cached instantly on your local device and sync to the cloud automatically whenever online.',
    },
  ];

  return (
    <div className="py-12 sm:py-16 bg-[#F8FAFC]">
      {/* 1. Header */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold shadow-2xs">
          <SparklesIcon size="xs" />
          <span>{language === 'id' ? 'Panduan Penggunaan' : 'User Guidance'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto">
          {language === 'id' ? (
            <>
              Cara Menggunakan FoCient untuk <span className="text-blue-600">Fokus Maksimal</span>
            </>
          ) : (
            <>
              How to Master FoCient for <span className="text-blue-600">Peak Guilt-Free Flow</span>
            </>
          )}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {language === 'id'
            ? 'Pelajari alur kerja terstruktur yang dirancang untuk membantumu menyelesaikan pekerjaan penting setiap hari dengan ritme yang tenang dan konsisten.'
            : 'Master our structured focus workflow designed to help you conquer high-leverage work every day with calm consistency.'}
        </p>
      </section>

      {/* 2. Step by step workflow */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {steps.map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className="text-2xl font-black text-slate-200 tracking-tight">{item.step}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                  {language === 'id' ? item.titleId : item.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {language === 'id' ? item.descId : item.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {language === 'id' ? 'Pertanyaan yang Sering Diajukan' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            {language === 'id' ? 'Jawaban cepat untuk memaksimalkan pengalaman penggunaanmu.' : 'Quick answers to clarify the FoCient philosophy.'}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors"
                >
                  <span>{language === 'id' ? faq.qId : faq.qEn}</span>
                  {isOpen ? <ChevronUpIcon size="xs" /> : <ChevronDownIcon size="xs" />}
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {language === 'id' ? faq.aId : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Bottom CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-24 text-center">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'id' ? 'Coba Sekarang Tanpa Komitmen' : 'Try FoCient Live in Seconds'}
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              {language === 'id'
                ? 'Langsung coba demonstrasi interaktif dengan data realistis atau mulai atur harimu sekarang.'
                : 'Instantly experiment with our interactive demo loaded with realistic task data.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleDemo}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 active:scale-95 transition-all shadow-sm"
              >
                {language === 'id' ? 'Buka Versi Demo' : 'Open Live Demo'}
              </button>
              <Link
                href="/register"
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all text-center"
              >
                {language === 'id' ? 'Daftar Akun Baru' : 'Create Free Account'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
