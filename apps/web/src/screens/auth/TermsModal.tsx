'use client';

import React from 'react';
import { useFocient } from '../../state/focient-store';
import { XIcon } from '../../components/icons';

export const TermsModal: React.FC = () => {
  const { isTermsOpen, setIsTermsOpen, language } = useFocient();

  if (!isTermsOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white rounded-2xl shadow-focient-3 max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {language === 'id' ? 'Syarat & Ketentuan Layanan FoCient' : 'FoCient Terms & Privacy Philosophy'}
          </h2>
          <button
            type="button"
            onClick={() => setIsTermsOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <XIcon size="sm" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-600 leading-relaxed">
          <section>
            <h3 className="font-semibold text-slate-800 mb-1">
              {language === 'id' ? '1. Komitmen Anti-Burnout' : '1. Anti-Burnout Philosophy'}
            </h3>
            <p>
              {language === 'id'
                ? 'FoCient dirancang dengan filosofi produktivitas bebas rasa bersalah. Kami menolak sistem penalti atau bahasa yang menyalahkan pengguna ketika jadwal perlu disesuaikan.'
                : 'FoCient is built on guilt-free productivity principles. We refuse punitive notifications, badges of shame, or anxiety-inducing metrics when life demands schedule adjustments.'}
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-slate-800 mb-1">
              {language === 'id' ? '2. Alokasi Kapasitas Sehat' : '2. Healthy Capacity Allocation'}
            </h3>
            <p>
              {language === 'id'
                ? 'Sistem kami membatasi waktu kerja fokus standar maksimal 8 jam per hari untuk melindungi energi mental dan mencegah kelelahan kognitif.'
                : 'Our algorithm encourages a healthy daily ceiling (standard max 8 hours) with mandatory buffer intervals to prevent cognitive fatigue.'}
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-slate-800 mb-1">
              {language === 'id' ? '3. Privasi & Keamanan Data' : '3. Privacy & Data Ownership'}
            </h3>
            <p>
              {language === 'id'
                ? 'Data tugas dan jadwal Anda disimpan dengan aman dan tidak pernah dijual kepada pihak ketiga atau pengiklan.'
                : 'Your schedule, tasks, and focus data belong to you. We do not sell or monetize personal productivity records.'}
            </p>
          </section>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={() => setIsTermsOpen(false)}
            className="focient-btn focient-btn--primary focient-btn--sm"
          >
            {language === 'id' ? 'Saya Mengerti' : 'I Understand'}
          </button>
        </div>
      </div>
    </div>
  );
};
