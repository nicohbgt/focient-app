'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFocient } from '../../../state/focient-store';
import { SparklesIcon, CheckIcon, TargetIcon, ClockIcon, ActivityIcon, ArrowRightIcon } from '../../../components/icons';

export default function AboutPage() {
  const router = useRouter();
  const { language, loginAsGuest } = useFocient();

  const handleDemo = async () => {
    await loginAsGuest();
    router.push('/dashboard');
  };

  return (
    <div className="py-12 sm:py-16 bg-[#F8FAFC]">
      {/* 1. Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold shadow-2xs">
          <SparklesIcon size="xs" />
          <span>{language === 'id' ? 'Tentang Kami & Perjalanan FoCient' : 'About FoCient & Our Journey'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto">
          {language === 'id' ? (
            <>
              Kami Membangun Ruang Kerja yang <span className="text-blue-600">Bebas Rasa Bersalah</span>
            </>
          ) : (
            <>
              We Build a Workspace That Is Truly <span className="text-blue-600">Guilt-Free</span>
            </>
          )}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {language === 'id'
            ? 'FoCient lahir dari kekecewaan terhadap aplikasi to-do list konvensional yang justru memicu kecemasan dan kelelahan. Kami percaya bahwa produktivitas sejati bukan tentang mengerjakan segalanya, melainkan fokus pada apa yang paling bermakna setiap hari.'
            : 'FoCient was born out of frustration with conventional to-do apps that trigger anxiety and burnout. We believe true productivity is not about doing everything, but focusing on what matters most each day.'}
        </p>
      </section>

      {/* 2. Core Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {language === 'id' ? 'Filosofi Desain Utama' : 'Our Core Design Pillars'}
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
            {language === 'id'
              ? 'Prinsip panduan yang kami sematkan ke dalam setiap interaksi dan baris kode FoCient.'
              : 'The foundational tenets guiding every single interaction and line of code in FoCient.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Pillar 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TargetIcon size="md" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {language === 'id' ? '1. Isolasi Fokus Top 3' : '1. Top 3 Focus Isolation'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {language === 'id'
                ? 'Daftar panjang dengan 50 tugas hanya melumpuhkan keputusan. FoCient mengisolasi maksimal 3 tugas prioritas utama per hari agar kamu bisa mengerjakannya dengan tenang dan tuntas.'
                : 'A 50-item task list paralyzes decision making. FoCient isolates a maximum of 3 top priorities per day so you can execute with calm clarity.'}
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ClockIcon size="md" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {language === 'id' ? '2. Batas Beban & Istirahat' : '2. Workload Cap & Rest'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {language === 'id'
                ? 'Kapasitas manusia memiliki batas nyata (maksimal 8 jam kerja). Sistem kami secara otomatis menyertakan jeda istirahat antar-tugas agar energimu tetap stabil sepanjang hari.'
                : 'Human capacity has real biological limits (maximum 8 work hours). Our engine automatically schedules buffer intervals so your energy remains sustainable.'}
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <ActivityIcon size="md" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {language === 'id' ? '3. Geser Jadwal Tanpa Rasa Bersalah' : '3. Guilt-Free Rescheduling'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {language === 'id'
                ? 'Hidup itu dinamis. Ketika ada hal darurat atau rapat mendadak, geser tugas ke waktu luang berikutnya dalam satu sentuhan tanpa kata-kata menghakimi seperti "Terlambat".'
                : 'Life happens. When emergencies or unexpected meetings arise, adaptively shift tasks to the next free slot in one click without punitive overdue labels.'}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Journey Timeline */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {language === 'id' ? 'Perjalanan FoCient' : 'Our Journey'}
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            {language === 'id' ? 'Dari sebuah gagasan sederhana hingga ekosistem produktivitas modern.' : 'From a simple idea to a modern productivity ecosystem.'}
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200">
          <div className="relative flex items-start gap-4 sm:gap-6 pl-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 z-10 ring-4 ring-[#F8FAFC]">
              ✓
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex-1">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                {language === 'id' ? 'Fase 1 • Eksplorasi & Empati' : 'Phase 1 • Research & Empathy'}
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                {language === 'id' ? 'Menemukan Akar Masalah Kelelahan Mental' : 'Uncovering the Roots of Productivity Anxiety'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {language === 'id'
                  ? 'Kami mewawancarai ratusan profesional dan pelajar yang merasa kewalahan dengan to-do list mereka. Hasilnya: notifikasi merah dan kata "Overdue" menimbulkan stres neurobiologis yang menurunkan daya fokus.'
                  : 'We interviewed hundreds of professionals struggling with overwhelming to-do lists. The verdict: red overdue alerts cause neurobiological stress that directly inhibits deep focus.'}
              </p>
            </div>
          </div>

          <div className="relative flex items-start gap-4 sm:gap-6 pl-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 z-10 ring-4 ring-[#F8FAFC]">
              ✓
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex-1">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                {language === 'id' ? 'Fase 2 • Desain Sistem & Local-First' : 'Phase 2 • Local-First Architecture'}
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                {language === 'id' ? 'Penyimpanan Lokal Super Cepat & Offline' : 'Lightning-Fast Local Storage & Offline Capability'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {language === 'id'
                  ? 'Membangun arsitektur local-first dengan enkripsi sesi PBKDF2 dan sinkronisasi PostgreSQL Supabase yang tangguh, memastikan aplikasi tetap responsif seketika tanpa loading spinner yang mengganggu.'
                  : 'Engineered a resilient local-first architecture with PBKDF2 encryption and Supabase sync, ensuring zero latency and instant task manipulation.'}
              </p>
            </div>
          </div>

          <div className="relative flex items-start gap-4 sm:gap-6 pl-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 z-10 ring-4 ring-[#F8FAFC]">
              ✓
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex-1">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                {language === 'id' ? 'Fase 3 • Next.js App Router Resmi' : 'Phase 3 • Canonical Next.js App Router'}
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                {language === 'id' ? 'Navigasi Kanonikal & Deep-Linking Penuh' : 'Canonical Navigation & True URL Deep-Linking'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {language === 'id'
                  ? 'Migrasi penuh ke Next.js File-Based Routing dengan canonical URL di address bar browser (/today, /tasks, /insights, /settings), tombol Back/Forward native, dan bookmarking yang mulus.'
                  : 'Fully migrated to canonical Next.js File-Based Routing with proper URL paths (/today, /tasks, /insights, /settings), full browser history, and deep linking.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-24 text-center">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'id' ? 'Siap Merasakan Fokus Tanpa Beban?' : 'Ready for a Calmer, More Focused Day?'}
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              {language === 'id'
                ? 'Mulai hari ini secara gratis. Coba versi demo langsung atau daftar untuk sinkronisasi akunmu.'
                : 'Start today for free. Experience the interactive demo or create an account for cloud synchronization.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleDemo}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 active:scale-95 transition-all shadow-sm"
              >
                {language === 'id' ? 'Coba Versi Demo' : 'Try Live Demo'}
              </button>
              <Link
                href="/register"
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all text-center"
              >
                {language === 'id' ? 'Daftar Gratis' : 'Sign Up Free'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
