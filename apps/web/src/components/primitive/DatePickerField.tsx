'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, XIcon, CheckIcon } from '../icons/index.js';
import { normalizeToISODate, formatToDisplayDate } from '../../lib/date-utils.js';

export interface DatePickerFieldProps {
  id?: string;
  name?: string;
  value: string; // "YYYY-MM-DD" or ""
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  language?: 'id' | 'en';
  size?: 'sm' | 'md' | 'lg';
}

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_NAMES_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const WEEKDAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * DatePickerField
 * Spacious, large calendar date picker with comfortable tap targets (default h-12).
 * Formats and outputs standard ISO "YYYY-MM-DD" strings with clear empty state support.
 */
export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  id,
  name,
  value = '',
  onChange,
  placeholder,
  disabled = false,
  className = '',
  label,
  helperText,
  error,
  required = false,
  language = 'id',
  size = 'lg',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse existing date or default calendar view to current month
  const today = new Date();
  const isoVal = normalizeToISODate(value);
  const initialDate = isoVal ? new Date(isoVal) : today;
  const validInitial = !isNaN(initialDate.getTime()) ? initialDate : today;

  const [viewYear, setViewYear] = useState<number>(validInitial.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(validInitial.getMonth());

  // Keep view aligned if value changes externally
  useEffect(() => {
    if (value) {
      const parsedIso = normalizeToISODate(value);
      const d = parsedIso ? new Date(parsedIso) : new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleDaySelect = (dayNum: number) => {
    const yStr = String(viewYear);
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(dayNum).padStart(2, '0');
    onChange(`${yStr}-${mStr}-${dStr}`);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const yStr = String(today.getFullYear());
    const mStr = String(today.getMonth() + 1).padStart(2, '0');
    const dStr = String(today.getDate()).padStart(2, '0');
    onChange(`${yStr}-${mStr}-${dStr}`);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const monthNames = language === 'id' ? MONTH_NAMES_ID : MONTH_NAMES_EN;
  const weekdays = language === 'id' ? WEEKDAY_NAMES_ID : WEEKDAY_NAMES_EN;

  const currentDisplay = formatToDisplayDate(value);
  const defaultPlaceholder = placeholder || 'DD/MM/YYYY';

  const sizeClasses =
    size === 'lg'
      ? 'h-11 px-3.5 py-2 text-sm'
      : size === 'md'
      ? 'h-10 px-3 py-2 text-sm'
      : 'h-9 px-2.5 py-1.5 text-xs';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-slate-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Main Large Trigger Input */}
      <div
        id={id}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`group flex items-center justify-between w-full bg-white rounded-xl border transition-all cursor-pointer ${
          error
            ? 'border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100'
            : isOpen
            ? 'border-blue-600 ring-2 ring-blue-500/20'
            : 'border-slate-300 hover:border-slate-400'
        } ${disabled ? 'opacity-60 bg-slate-50 cursor-not-allowed' : ''} ${sizeClasses}`}
      >
        <span
          className={`truncate select-none text-sm tabular-nums ${
            currentDisplay ? 'text-slate-900 font-medium' : 'text-slate-400 font-normal'
          }`}
        >
          {currentDisplay || defaultPlaceholder}
        </span>

        <div className="flex items-center gap-1.5 shrink-0 pl-1 text-slate-400">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-slate-100 hover:text-slate-600 text-slate-400 transition-colors"
              title={language === 'id' ? 'Hapus tanggal' : 'Clear date'}
            >
              <XIcon size="xs" />
            </button>
          )}

          <div
            className={`p-1 rounded-lg transition-colors ${
              isOpen ? 'text-blue-600 bg-blue-50' : 'group-hover:text-slate-600'
            }`}
          >
            <CalendarIcon size={size === 'lg' ? 'sm' : 'xs'} />
          </div>
        </div>
      </div>

      {helperText && !error && (
        <p className="text-[11px] text-slate-500 mt-1">{helperText}</p>
      )}
      {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}

      {/* Large Calendar Popover */}
      {isOpen && !disabled && (
        <div
          role="dialog"
          aria-label={language === 'id' ? 'Kalender Pemilih Tanggal' : 'Calendar Date Picker'}
          className="absolute z-50 mt-2 left-0 w-80 sm:w-88 bg-white rounded-2xl border border-slate-200 shadow-md p-4 animate-scale-up"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title={language === 'id' ? 'Bulan sebelumnya' : 'Previous month'}
            >
              <ChevronLeftIcon size="sm" />
            </button>

            <span className="text-sm font-bold text-slate-900">
              {monthNames[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title={language === 'id' ? 'Bulan berikutnya' : 'Next month'}
            >
              <ChevronRightIcon size="sm" />
            </button>
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 gap-1 text-center py-2 text-xs font-bold text-slate-400">
            {weekdays.map((w) => (
              <div key={w} className="py-0.5">
                {w}
              </div>
            ))}
          </div>

          {/* Day Cells (Large touch target) */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9 sm:h-10" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const yStr = String(viewYear);
              const mStr = String(viewMonth + 1).padStart(2, '0');
              const dStr = String(dayNum).padStart(2, '0');
              const cellIso = `${yStr}-${mStr}-${dStr}`;
              const isSelected = value === cellIso;
              const isToday =
                today.getFullYear() === viewYear &&
                today.getMonth() === viewMonth &&
                today.getDate() === dayNum;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleDaySelect(dayNum)}
                  className={`h-9 sm:h-10 rounded-xl font-bold text-sm transition-all flex items-center justify-center relative ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/20'
                      : isToday
                      ? 'bg-blue-50 text-blue-700 font-extrabold border border-blue-200'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="tabular-nums">{dayNum}</span>
                </button>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-500 hover:text-red-600 font-semibold py-1.5 px-2.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {language === 'id' ? 'Kosongkan' : 'Clear'}
            </button>

            <button
              type="button"
              onClick={handleSelectToday}
              className="text-blue-600 hover:text-blue-700 font-bold py-1.5 px-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {language === 'id' ? 'Hari Ini' : 'Today'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
