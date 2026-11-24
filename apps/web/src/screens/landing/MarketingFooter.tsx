'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFocient } from '../../state/focient-store';
import { FoCientWordmark } from '../../components/brand/FoCientWordmark';

export const MarketingFooter: React.FC = () => {
  const router = useRouter();
  const { language, setLanguage, loginAsGuest, setIsTermsOpen } = useFocient();

  const handleDemoClick = async () => {
    await loginAsGuest();
    router.push('/dashboard');
  };

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block py-1 brightness-0 invert" aria-label="FoCient">
              <FoCientWordmark height={20} />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {language === 'id'
                ? 'Sistem manajemen fokus harian berprinsip Top 3, batas beban kerja 8 jam, dan penyesuaian jadwal tanpa rasa bersalah. Didesain untuk kedamaian pikiran dan efisiensi nyata.'
                : 'Intelligent daily focus management, Top 3 isolation, and guilt-free adaptive rescheduling ecosystem. Engineered for calm clarity and real execution.'}
            </p>
          </div>

          {/* Col 3: Produk */}
          <div className="space-y-3 text-xs">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">
              {language === 'id' ? 'Produk' : 'Product'}
            </h5>
            <ul className="space-y-2">
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  {language === 'id' ? 'Fitur Utama' : 'Features'}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleDemoClick}
                  className="hover:text-white transition-colors text-left"
                >
                  {language === 'id' ? 'Coba Demo' : 'Try Demo'}
                </button>
              </li>
              <li>
                <Link href="/guidance" className="hover:text-white transition-colors">
                  {language === 'id' ? 'Panduan Penggunaan' : 'User Guidance'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Filosofi & Perusahaan */}
          <div className="space-y-3 text-xs">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">
              {language === 'id' ? 'Perusahaan' : 'Company'}
            </h5>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  {language === 'id' ? 'Tentang Kami' : 'About Us'}
                </Link>
              </li>
              <li>
                <Link href="/#philosophy" className="hover:text-white transition-colors">
                  {language === 'id' ? 'Nilai & Filosofi' : 'Our Values'}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(true)}
                  className="hover:text-white transition-colors text-left"
                >
                  {language === 'id' ? 'Ketentuan Waktu' : 'Schedule Policy'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Akses & Akun */}
          <div className="space-y-3 text-xs">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">
              {language === 'id' ? 'Akses' : 'Access'}
            </h5>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  {language === 'id' ? 'Masuk' : 'Log In'}
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  {language === 'id' ? 'Daftar Gratis' : 'Sign Up Free'}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(true)}
                  className="hover:text-white transition-colors text-left"
                >
                  {language === 'id' ? 'Syarat Layanan' : 'Terms of Service'}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Status */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            FoCient • Focus &amp; Flow
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span>
                {language === 'id' ? 'Status: Semua Sistem Beroperasi Normal' : 'Status: All Systems Operational'}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
              className="hover:text-white underline uppercase"
            >
              {language === 'en' ? 'Bahasa Indonesia' : 'English'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
