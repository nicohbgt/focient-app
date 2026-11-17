'use client';

import React, { useState } from 'react';
import {
  useFocient,
  kOccupanciesList,
  kOccupancyCategoryTemplates,
  kOccupancyCategoryTemplatesId,
} from '../../state/focient-store';
import { AddCategoryModal } from './AddCategoryModal';
import { PlusIcon, XIcon, ArrowRightIcon } from '../../components/icons';

const kOccupancyLabels: Record<string, { en: string; id: string }> = {
  General: { en: 'General', id: 'Umum' },
  Professional: { en: 'Professional', id: 'Profesional' },
  Entrepreneur: { en: 'Entrepreneur', id: 'Wirausaha' },
  Student: { en: 'Student', id: 'Pelajar / Mahasiswa' },
};

export const Step1WorkspaceScreen: React.FC = () => {
  const {
    onboardingUsername,
    setOnboardingUsername,
    selectedOccupancy,
    setSelectedOccupancy,
    categories,
    setCategories,
    addCategory,
    updateCategory,
    removeCategory,
    setOnboardingStep,
    language,
  } = useFocient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [occupancies, setOccupancies] = useState<string[]>(kOccupanciesList);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState('');

  const handleOccupancySelect = (occ: string) => {
    if (selectedOccupancy === occ) {
      setSelectedOccupancy(null);
      setCategories([]);
      return;
    }
    setSelectedOccupancy(occ);
    setError(null);
    const templates = language === 'id' ? kOccupancyCategoryTemplatesId : kOccupancyCategoryTemplates;
    const template = templates[occ] || kOccupancyCategoryTemplates[occ];
    if (template && template.length > 0) {
      setCategories(template.map((c) => ({ ...c })));
    } else {
      setCategories([]);
    }
  };

  const handleAddCustomOccupancy = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customRoleInput.trim();
    if (!trimmed) return;
    if (!occupancies.includes(trimmed)) {
      setOccupancies((prev) => [...prev, trimmed]);
    }
    setSelectedOccupancy(trimmed);
    setError(null);
    setCustomRoleInput('');
    setIsAddingCustom(false);
  };

  const handleNext = () => {
    if (!selectedOccupancy) {
      setError(
        language === 'id'
          ? 'Pilih pekerjaanmu dulu ya'
          : 'Please select your job first'
      );
      return;
    }
    if (categories.length === 0) {
      setError(
        language === 'id'
          ? 'Pilih atau tambahkan minimal 1 kategori'
          : 'Select or add at least 1 category'
      );
      return;
    }
    setError(null);
    setOnboardingStep(2);
  };

  return (
    <div className="min-h-full flex flex-col justify-center px-4 py-8 max-w-lg mx-auto w-full animate-fade-in">
      {/* Top Header & Progress */}
      <div className="mb-6">
        <div className="text-xs font-semibold text-slate-500 mb-2">
          <span>{language === 'id' ? 'Langkah 1 dari 5' : 'Step 1 of 5'}</span>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div className="bg-blue-600 h-full w-1/5 transition-all duration-300 rounded-full" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          {language === 'id' ? 'Atur Ruang Kerjamu' : 'Set Up Your Workspace'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {language === 'id'
            ? 'Pilih pekerjaan dan kategori fokus harian yang sesuai denganmu.'
            : 'Choose your job and categories that fit your daily focus.'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Section 1: Name / Identity Input Field (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="onb-username">
              {language === 'id' ? 'Nama Panggilan (Opsional)' : 'Your Name (Optional)'}
            </label>
            <input
              id="onb-username"
              type="text"
              value={onboardingUsername}
              onChange={(e) => {
                setOnboardingUsername(e.target.value);
                setError(null);
              }}
              placeholder={language === 'id' ? 'Masukkan nama Anda (opsional)' : 'Enter your name (optional)'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Section 2: Occupation / Job Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                {language === 'id' ? 'Pekerjaan / Profesi' : 'Occupation / Job'}
              </label>
              {!isAddingCustom && (
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  <PlusIcon size="xs" />
                  <span>{language === 'id' ? 'Kustom' : 'Custom'}</span>
                </button>
              )}
            </div>

            {/* Custom Occupancy Inline Input */}
            {isAddingCustom && (
              <form onSubmit={handleAddCustomOccupancy} className="flex items-center gap-2 mb-2 animate-fade-in">
                <input
                  type="text"
                  value={customRoleInput}
                  onChange={(e) => setCustomRoleInput(e.target.value)}
                  placeholder={
                    language === 'id'
                      ? 'Nama pekerjaan kustom (misal: Data Analyst)'
                      : 'Custom occupation (e.g. Data Analyst)'
                  }
                  className="flex-1 px-3 py-1.5 rounded-lg border border-blue-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs"
                >
                  {language === 'id' ? 'Simpan' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCustom(false);
                    setCustomRoleInput('');
                  }}
                  className="px-2 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-100 flex items-center justify-center"
                >
                  <XIcon size="xs" />
                </button>
              </form>
            )}

            {/* Horizontal Scrollable Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar touch-pan-x">
              {occupancies.map((occ) => {
                const isSelected = selectedOccupancy === occ;
                return (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => handleOccupancySelect(occ)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs ring-1 ring-blue-600/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>{kOccupancyLabels[occ]?.[language] || occ}</span>
                    {isSelected && (
                      <span className="text-blue-500 hover:text-blue-700 ml-0.5">
                        <XIcon size="xs" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {!selectedOccupancy && (
              <p className="text-[11px] text-slate-400 mt-1 italic">
                {language === 'id'
                  ? '*Pilih pekerjaan di atas untuk mengisi rekomendasi kategori otomatis'
                  : '*Choose an occupation above to populate category recommendations'}
              </p>
            )}
          </div>

          {/* Section 3: Task Categories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                {language === 'id' ? 'Kategori Tugas' : 'Task Categories'}
              </label>
              <button
                type="button"
                onClick={() => {
                  setCategoryToEdit(null);
                  setIsAddOpen(true);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <PlusIcon size="xs" />
                <span>{language === 'id' ? 'Tambah Kategori' : 'Add Category'}</span>
              </button>
            </div>

            {categories.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center text-xs text-slate-400 leading-relaxed">
                {language === 'id'
                  ? 'Belum ada kategori aktif. Pilih Pekerjaan / Profesi di atas atau klik Tambah Kategori.'
                  : 'No active categories yet. Select an Occupation / Job above or click Add Category.'}
              </div>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar touch-pan-x whitespace-nowrap">
                {categories.map((cat) => {
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setCategoryToEdit(cat);
                        setIsAddOpen(true);
                      }}
                      className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer transition-all"
                      title={language === 'id' ? 'Klik untuk mengubah kategori' : 'Click to edit category'}
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.colorHex }} />
                      <span>{cat.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCategory(cat.id);
                        }}
                        className="text-slate-400 hover:text-red-500 ml-0.5 p-0.5 rounded-full transition-colors"
                        title={language === 'id' ? 'Hapus kategori' : 'Remove category'}
                      >
                        <XIcon size="xs" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={handleNext}
            className="w-full mt-4 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>{language === 'id' ? 'Lanjutkan ke Ritme Kerja' : 'Continue to Working Rhythm'}</span>
            <ArrowRightIcon size="sm" />
          </button>
        </div>
      </div>

      <AddCategoryModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setCategoryToEdit(null);
        }}
        onAdd={addCategory}
        onUpdate={updateCategory}
        categoryToEdit={categoryToEdit}
        language={language}
      />
    </div>
  );
};
