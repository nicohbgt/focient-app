'use client';

import React, { useState } from 'react';
import { WorkspaceCategory, FocusType } from '../../state/focient-store';
import { XIcon } from '../../components/icons';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (category: WorkspaceCategory) => void;
  language: 'en' | 'id';
}

const SWATCHES = [
  '#7C3AED',
  '#0284C7',
  '#B45309',
  '#0D9488',
  '#059669',
  '#E11D48',
  '#D97706',
  '#6366F1',
  '#EC4899',
  '#64748B',
];

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  language,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(SWATCHES[0]);
  const [focusType, setFocusType] = useState<FocusType>('Medium');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(language === 'id' ? 'Nama kategori tidak boleh kosong' : 'Category name cannot be empty');
      return;
    }

    onAdd({
      id: `cat-${Date.now()}`,
      name: name.trim(),
      colorHex: color,
      focusType,
      isDefault: false,
    });

    setName('');
    setError(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white rounded-2xl shadow-focient-3 max-w-sm w-full overflow-hidden border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {language === 'id' ? 'Tambah Kategori Baru' : 'Add Task Category'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <XIcon size="sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="cat-name">
              {language === 'id' ? 'Nama Kategori' : 'Category Name'}
            </label>
            <input
              id="cat-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder={language === 'id' ? 'Contoh: Client Work' : 'e.g. Client Work'}
              autoFocus
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {language === 'id' ? 'Pilih Warna Label' : 'Label Color'}
            </label>
            <div className="flex flex-wrap gap-2.5">
              {SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setColor(swatch)}
                  style={{ backgroundColor: swatch }}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === swatch ? 'ring-2 ring-offset-2 ring-blue-600 scale-110' : 'hover:scale-105'
                  }`}
                  aria-label={`Color ${swatch}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {language === 'id' ? 'Tingkat Fokus Khas' : 'Default Focus Type'}
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(['Light', 'Medium', 'Deep Focus'] as FocusType[]).map((ft) => (
                <button
                  key={ft}
                  type="button"
                  onClick={() => setFocusType(ft)}
                  className={`py-2 px-2 rounded-lg border font-semibold text-center transition-all ${
                    focusType === ft
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {ft}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              {language === 'id' ? 'Batal' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
            >
              {language === 'id' ? 'Tambah Kategori' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
