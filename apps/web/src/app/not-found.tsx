'use client';

import React from 'react';
import Link from 'next/link';
import { FoCientWordmark } from '../components/brand/FoCientWordmark';
import { ArrowLeftIcon, SparklesIcon } from '../components/icons';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12 font-sans text-slate-900">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <FoCientWordmark height={24} />
        </div>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mb-6 border border-blue-100 shadow-2xs">
          <SparklesIcon size="lg" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-sm text-slate-500 font-normal leading-relaxed mb-8">
          Halaman yang kamu cari mungkin telah dipindahkan atau tautan tidak lagi valid. Semua data tugas dan fokusmu tetap tersimpan aman.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/today"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs shadow-sm transition-all text-center"
          >
            Kembali ke Rencana Hari Ini
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors text-center inline-flex items-center justify-center gap-1.5"
          >
            <ArrowLeftIcon size="xs" />
            <span>Halaman Utama</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
