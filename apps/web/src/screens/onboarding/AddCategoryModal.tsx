'use client';

import React, { useState, useEffect } from 'react';
import { WorkspaceCategory, FocusType } from '../../state/focient-store';
import { XIcon } from '../../components/icons';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (category: WorkspaceCategory) => void;
  onUpdate?: (category: WorkspaceCategory) => void;
  categoryToEdit?: WorkspaceCategory | null;
  language: 'en' | 'id';
}

const SWATCHES = [
  '#2563EB', // Royal Blue
  '#0284C7', // Sky Blue
  '#0891B2', // Cyan
  '#0D9488', // Teal
  '#059669', // Emerald
  '#16A34A', // Green
  '#65A30D', // Lime
  '#84CC16', // Light Green
  '#EAB308', // Amber/Yellow
  '#F59E0B', // Warm Amber
  '#F97316', // Orange
  '#EA580C', // Deep Orange
  '#EF4444', // Red
  '#DC2626', // Crimson Red
  '#E11D48', // Rose
  '#DB2777', // Pink
  '#EC4899', // Bright Pink
  '#D946EF', // Fuchsia
  '#A855F7', // Purple
  '#8B5CF6', // Violet
  '#7C3AED', // Deep Violet
  '#6366F1', // Indigo
  '#4F46E5', // Royal Indigo
  '#3B82F6', // Blue
  '#06B6D4', // Aquamarine
  '#14B8A6', // Mint Teal
  '#10B981', // Jade Green
  '#F43F5E', // Ruby
  '#64748B', // Slate
  '#475569', // Deep Slate
  '#78716C', // Stone
  '#57534E', // Warm Gray
];

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  onUpdate,
  categoryToEdit,
  language,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(SWATCHES[0]);
  const [focusType, setFocusType] = useState<FocusType>('Medium');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setColor(categoryToEdit.colorHex || SWATCHES[0]);
      setFocusType(categoryToEdit.focusType || 'Medium');
    } else {
      setName('');
      setColor(SWATCHES[0]);
      setFocusType('Medium');
    }
    setError(null);
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(language === 'id' ? 'Nama kategori tidak boleh kosong' : 'Category name cannot be empty');
      return;
    }

    if (categoryToEdit && onUpdate) {
      onUpdate({
        ...categoryToEdit,
        name: name.trim(),
        colorHex: color,
        focusType,
      });
    } else {
      onAdd({
        id: `cat-${Date.now()}`,
        name: name.trim(),
        colorHex: color,
        focusType,
        isDefault: false,
      });
    }

    setName('');
    setError(null);
    onClose();
  };

  const focusTypeOptions: {
    type: FocusType;
    title: string;
    dotColor: string;
    activeClass: string;
    hoverClass: string;
  }[] = [
    {
      type: 'Low',
      title: language === 'id' ? 'Rendah (Low)' : 'Low',
      dotColor: '#16A34A', // Green
      activeClass: 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs',
      hoverClass: 'hover:border-emerald-300 hover:bg-emerald-50/40 text-slate-700',
    },
    {
      type: 'Medium',
      title: language === 'id' ? 'Sedang (Medium)' : 'Medium',
      dotColor: '#0284C7', // Blue
      activeClass: 'border-sky-600 bg-sky-50 text-sky-900 ring-2 ring-sky-500/20 shadow-xs',
      hoverClass: 'hover:border-sky-300 hover:bg-sky-50/40 text-slate-700',
    },
    {
      type: 'High',
      title: language === 'id' ? 'Tinggi (High)' : 'High',
      dotColor: '#DC2626', // Red
      activeClass: 'border-red-600 bg-red-50 text-red-900 ring-2 ring-red-500/20 shadow-xs',
      hoverClass: 'hover:border-red-300 hover:bg-red-50/40 text-slate-700',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-md max-w-md w-full overflow-hidden border border-slate-200 animate-scale-up">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {categoryToEdit
              ? language === 'id' ? 'Ubah Kategori Tugas' : 'Edit Task Category'
              : language === 'id' ? 'Tambah Kategori Baru' : 'Add Task Category'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
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
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
            />
          </div>

          {/* Horizontally Scrollable Label Color Swatches with Expanded Color Palette */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                {language === 'id' ? 'Pilih Warna Label' : 'Label Color'}
              </label>
              <span className="text-[10px] text-slate-400">
                {language === 'id' ? 'Geser untuk pilihan warna →' : 'Scroll for more colors →'}
              </span>
            </div>

            <div className="w-full flex items-center gap-2.5 overflow-x-auto py-2 px-1 no-scrollbar scrollbar-none touch-pan-x">
              {SWATCHES.map((swatch) => {
                const isSelected = color === swatch;
                return (
                  <button
                    key={swatch}
                    type="button"
                    onClick={() => setColor(swatch)}
                    style={{ backgroundColor: swatch }}
                    className={`shrink-0 w-7 h-7 rounded-full transition-all ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-blue-600 shadow-sm scale-110'
                        : 'hover:scale-105 opacity-85 hover:opacity-100'
                    }`}
                    aria-label={`Color ${swatch}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Categorized Focus Type Buttons (Just Low, Medium, High without duration descriptions) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {language === 'id' ? 'Prioritas / Intensitas Kategori' : 'Category Priority / Intensity'}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {focusTypeOptions.map((opt) => {
                const isSelected = focusType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setFocusType(opt.type)}
                    className={`py-2.5 px-2 rounded-xl border font-semibold text-center transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? opt.activeClass
                        : `border-slate-200 bg-white ${opt.hoverClass}`
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: opt.dotColor }}
                    />
                    <span className="text-xs font-bold leading-tight">{opt.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {language === 'id' ? 'Batal' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              {categoryToEdit
                ? (language === 'id' ? 'Simpan Perubahan' : 'Save Changes')
                : (language === 'id' ? 'Simpan Kategori' : 'Confirm Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
