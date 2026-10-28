'use client';

import React, { useState } from 'react';
import { useFocient, kOccupancyCategoryTemplates } from '../../state/focient-store';
import { AddCategoryModal } from './AddCategoryModal';
import { PlusIcon, XIcon, ArrowRightIcon } from '../../components/icons';

export const Step1WorkspaceScreen: React.FC = () => {
  const {
    onboardingUsername,
    setOnboardingUsername,
    selectedOccupancy,
    setSelectedOccupancy,
    categories,
    addCategory,
    removeCategory,
    setOnboardingStep,
    language,
    logout,
  } = useFocient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const occupancies = ['General', 'Software Engineer', 'Product Designer', 'Freelancer', 'Student'];

  const handleOccupancySelect = (occ: string) => {
    setSelectedOccupancy(occ);
    const template = kOccupancyCategoryTemplates[occ];
    if (template) {
      // replace or reset categories to template
      template.forEach((c) => addCategory(c));
    }
  };

  const handleNext = () => {
    if (!onboardingUsername.trim() || onboardingUsername.trim().length < 2) {
      setError(language === 'id' ? 'Nama minimal 2 karakter' : 'Username must be at least 2 characters');
      return;
    }
    if (categories.length === 0) {
      setError(language === 'id' ? 'Pilih atau tambahkan minimal 1 kategori' : 'Select or add at least 1 category');
      return;
    }
    setError(null);
    setOnboardingStep(2);
  };

  return (
    <div className="min-h-full flex flex-col justify-center px-4 py-8 max-w-lg mx-auto w-full animate-fade-in">
      {/* Top Header & Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span>{language === 'id' ? 'Langkah 1 dari 5' : 'Step 1 of 5'}</span>
          <button
            type="button"
            onClick={logout}
            className="text-slate-400 hover:text-slate-600 hover:underline"
          >
            {language === 'id' ? 'Keluar' : 'Sign Out'}
          </button>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div className="bg-blue-600 h-full w-1/5 transition-all duration-300 rounded-full" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          {language === 'id' ? 'Personalisasi Ruang Kerja' : 'Personalize your Workspace'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {language === 'id'
            ? 'Atur profil dan pilar fokus yang sesuai dengan ritme kerja Anda.'
            : 'Set up your profile identity and primary work category pillars.'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Username Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="onb-username">
              {language === 'id' ? 'Nama Panggilan / Identitas' : 'Your Name / Identity'}
            </label>
            <input
              id="onb-username"
              type="text"
              value={onboardingUsername}
              onChange={(e) => {
                setOnboardingUsername(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Alex Johnson"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
            />
          </div>

          {/* Occupancy Templates */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              {language === 'id' ? 'Pilih Template Profesi / Peran' : 'Select Profession / Role Template'}
            </label>
            <div className="flex flex-wrap gap-2">
              {occupancies.map((occ) => {
                const isSelected = selectedOccupancy === occ;
                return (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => handleOccupancySelect(occ)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {occ}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task Categories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                {language === 'id' ? 'Kategori Tugas Aktif' : 'Active Task Categories'} ({categories.length}/5)
              </label>
              {categories.length < 5 && (
                <button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  <PlusIcon size="xs" />
                  <span>{language === 'id' ? 'Tambah Kategori' : 'Add Category'}</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.colorHex }} />
                  <span>{cat.name}</span>
                  <button
                    type="button"
                    onClick={() => removeCategory(cat.id)}
                    className="text-slate-400 hover:text-slate-700 ml-1 p-0.5 rounded-full"
                    title={language === 'id' ? 'Hapus kategori' : 'Remove category'}
                  >
                    <XIcon size="xs" />
                  </button>
                </div>
              ))}
            </div>
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
        onClose={() => setIsAddOpen(false)}
        onAdd={addCategory}
        language={language}
      />
    </div>
  );
};
