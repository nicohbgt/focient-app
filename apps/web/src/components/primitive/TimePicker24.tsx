'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ClockIcon, XIcon } from '../icons/index.js';

export interface TimePicker24Props {
  id?: string;
  name?: string;
  value: string; // "HH:mm" (24h) or ""
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

const HOURS_24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES_60 = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

/**
 * TimePicker24
 * Standard 24-hour time picker adhering to standard mobile/web time picker patterns:
 * - Two scrollable columns: Hour (00-23) and Minute (00-59).
 * - No seconds, no AM/PM, no clutter.
 * - Standard CANCEL and OK footer actions.
 * - Supports direct keyboard typing (auto-formatting HH:mm) or column selection.
 */
export const TimePicker24: React.FC<TimePicker24Props> = ({
  id,
  name,
  value = '',
  onChange,
  placeholder = '00:00',
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
  const inputRef = useRef<HTMLInputElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  // Temporary selection while picker is open
  const [selectedH, setSelectedH] = useState<string>('00');
  const [selectedM, setSelectedM] = useState<string>('00');

  // When value prop updates, sync local selection
  useEffect(() => {
    if (value && value.includes(':')) {
      const [h, m] = value.split(':');
      setSelectedH(h.padStart(2, '0'));
      setSelectedM((m || '00').padStart(2, '0'));
    } else if (value === '00:00' || !value) {
      setSelectedH('00');
      setSelectedM('00');
    }
  }, [value]);

  // When popover opens, scroll to selected hour and minute
  useEffect(() => {
    if (isOpen) {
      // Small timeout to ensure DOM has rendered
      const t = setTimeout(() => {
        if (hourListRef.current) {
          const activeH = hourListRef.current.querySelector<HTMLElement>('[data-active="true"]');
          if (activeH) {
            hourListRef.current.scrollTop = activeH.offsetTop - hourListRef.current.clientHeight / 2 + activeH.clientHeight / 2;
          }
        }
        if (minuteListRef.current) {
          const activeM = minuteListRef.current.querySelector<HTMLElement>('[data-active="true"]');
          if (activeM) {
            minuteListRef.current.scrollTop = activeM.offsetTop - minuteListRef.current.clientHeight / 2 + activeM.clientHeight / 2;
          }
        }
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isOpen, selectedH, selectedM]);

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

  const handleOpen = () => {
    if (disabled) return;
    if (value && value.includes(':')) {
      const [h, m] = value.split(':');
      setSelectedH(h.padStart(2, '0'));
      setSelectedM((m || '00').padStart(2, '0'));
    } else {
      setSelectedH('00');
      setSelectedM('00');
    }
    setIsOpen(true);
  };

  const handleHourClick = (h: string) => {
    setSelectedH(h);
  };

  const handleMinuteClick = (m: string) => {
    setSelectedM(m);
  };

  const handleConfirm = () => {
    onChange(`${selectedH}:${selectedM}`);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange('');
    setSelectedH('00');
    setSelectedM('00');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Direct typing handler for 24h format
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9:]/g, '');

    // Auto insert colon after 2 digits
    if (raw.length === 2 && !raw.includes(':') && !value.endsWith(':')) {
      const hNum = parseInt(raw, 10);
      if (hNum >= 0 && hNum <= 23) {
        raw = `${raw}:`;
      }
    }

    if (raw.length > 5) {
      raw = raw.slice(0, 5);
    }

    // Validate 24h bounds if full HH:mm is typed
    if (raw.length === 5 && raw.includes(':')) {
      const [hStr, mStr] = raw.split(':');
      let hVal = parseInt(hStr, 10);
      let mVal = parseInt(mStr, 10);
      if (isNaN(hVal) || hVal < 0) hVal = 0;
      if (hVal > 23) hVal = 23;
      if (isNaN(mVal) || mVal < 0) mVal = 0;
      if (mVal > 59) mVal = 59;
      raw = `${String(hVal).padStart(2, '0')}:${String(mVal).padStart(2, '0')}`;
      setSelectedH(String(hVal).padStart(2, '0'));
      setSelectedM(String(mVal).padStart(2, '0'));
    }

    onChange(raw);
  };

  const handleInputBlur = () => {
    if (value && value.length > 0 && value.length < 5) {
      if (!value.includes(':')) {
        const hVal = Math.min(23, Math.max(0, parseInt(value, 10) || 0));
        const finalVal = `${String(hVal).padStart(2, '0')}:00`;
        onChange(finalVal);
        setSelectedH(String(hVal).padStart(2, '0'));
        setSelectedM('00');
      } else {
        const parts = value.split(':');
        const h = String(Math.min(23, Math.max(0, parseInt(parts[0], 10) || 0))).padStart(2, '0');
        const m = String(Math.min(59, Math.max(0, parseInt(parts[1], 10) || 0))).padStart(2, '0');
        onChange(`${h}:${m}`);
        setSelectedH(h);
        setSelectedM(m);
      }
    }
  };

  const isValueEmpty = !value || value === '00:00';

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

      {/* Main Trigger Input */}
      <div
        onClick={handleOpen}
        className={`group flex items-center justify-between w-full bg-white rounded-xl border transition-all cursor-pointer ${
          error
            ? 'border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100'
            : isOpen
            ? 'border-blue-600 ring-2 ring-blue-500/20'
            : isValueEmpty
            ? 'border-slate-200 hover:border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20'
            : 'border-slate-300 hover:border-slate-400 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20'
        } ${disabled ? 'opacity-60 bg-slate-50 cursor-not-allowed' : ''} ${sizeClasses}`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input
            ref={inputRef}
            id={id}
            name={name}
            type="text"
            inputMode="numeric"
            disabled={disabled}
            value={value}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            maxLength={5}
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
            className={`w-full bg-transparent outline-none placeholder:text-slate-400 placeholder:font-normal tracking-wide tabular-nums cursor-text text-sm ${
              isValueEmpty
                ? 'text-slate-400 font-normal'
                : 'text-slate-900 font-medium'
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pl-1 text-slate-400">
          {value && value !== '00:00' && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-slate-100 hover:text-slate-600 text-slate-400 transition-colors"
              title={language === 'id' ? 'Hapus waktu' : 'Clear time'}
            >
              <XIcon size="xs" />
            </button>
          )}

          <div
            className={`p-1 rounded-lg transition-colors ${
              isOpen
                ? 'text-blue-600 bg-blue-50'
                : isValueEmpty
                ? 'text-slate-400 group-hover:text-slate-500'
                : 'text-slate-500 group-hover:text-slate-700'
            }`}
          >
            <ClockIcon size={size === 'lg' ? 'sm' : 'xs'} />
          </div>
        </div>
      </div>

      {helperText && !error && (
        <p className="text-[11px] text-slate-500 mt-1">{helperText}</p>
      )}
      {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}

      {/* Standard Drum / 2-Column Time Picker Popover */}
      {isOpen && !disabled && (
        <div
          role="dialog"
          aria-label={language === 'id' ? 'Pemilih Waktu' : 'Time Picker'}
          className="absolute z-50 mt-1.5 right-0 w-52 sm:w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 animate-scale-up"
        >
          {/* Column Headers */}
          <div className="grid grid-cols-2 text-center pb-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <div>{language === 'id' ? 'Jam' : 'Hour'}</div>
            <div>{language === 'id' ? 'Menit' : 'Minute'}</div>
          </div>

          {/* 2-Column Wheel Roller List */}
          <div className="grid grid-cols-2 gap-2 h-36 py-1.5 relative">
            {/* Hour List (00 - 23) */}
            <div
              ref={hourListRef}
              className="h-full overflow-y-auto scrollbar-none no-scrollbar py-0.5 px-1 space-y-0.5 text-center"
              style={{ scrollBehavior: 'smooth' }}
            >
              {HOURS_24.map((h) => {
                const isSelected = selectedH === h;
                return (
                  <button
                    key={h}
                    type="button"
                    data-active={isSelected ? 'true' : 'false'}
                    onClick={() => handleHourClick(h)}
                    className={`w-full py-1 px-1 rounded-lg text-xs tabular-nums font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>

            {/* Minute List (00 - 59) */}
            <div
              ref={minuteListRef}
              className="h-full overflow-y-auto scrollbar-none no-scrollbar py-0.5 px-1 space-y-0.5 text-center border-l border-slate-100"
              style={{ scrollBehavior: 'smooth' }}
            >
              {MINUTES_60.map((m) => {
                const isSelected = selectedM === m;
                return (
                  <button
                    key={m}
                    type="button"
                    data-active={isSelected ? 'true' : 'false'}
                    onClick={() => handleMinuteClick(m)}
                    className={`w-full py-1 px-1 rounded-lg text-xs tabular-nums font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons: CANCEL & OK */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCancel}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {language === 'id' ? 'Batal' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg shadow-xs transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
