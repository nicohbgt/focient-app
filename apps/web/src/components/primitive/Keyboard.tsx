import React, { useState, useEffect } from 'react';
import { useFoCientI18n } from '../i18n/I18nContext.js';
import { XIcon, ChevronDownIcon } from '../icons/index.js';

export type KeyboardMode = 'number' | 'general';
export type KeyboardLayout = 'docked' | 'bottom-sheet';

export interface KeyboardProps {
  mode?: KeyboardMode;
  layout?: KeyboardLayout;
  open?: boolean;
  value?: string | number;
  onChange?: (val: string) => void;
  onSubmit?: (val: string) => void;
  onClose?: () => void;
  allowSwitchMode?: boolean;
  showPreview?: boolean;
  previewLabel?: string;
  placeholder?: string;
  presets?: number[]; // e.g. [15, 30, 45, 60] for duration in minutes
  allowDecimal?: boolean;
  min?: number;
  max?: number;
  className?: string;
  id?: string;
}

/**
 * FoCient Mobile Virtual Keyboard (<Keyboard/>)
 *
 * Designed specifically for mobile inputs:
 * - Number mode: Fast numeric & duration integer entry with tabular numbers (tnum),
 *   quick preset chips (+15m, +30m, etc.), backspace, and clear.
 * - General mode: Full QWERTY keyboard with shift uppercase/lowercase toggle,
 *   ?123 symbols mode, spacebar, and primary Done action.
 *
 * Meets WCAG 2.1 AAA touch targets (min 48px hit area) with tactile scale(0.92) press response.
 */
export const Keyboard: React.FC<KeyboardProps> = ({
  mode: initialMode = 'number',
  layout = 'docked',
  open = true,
  value: controlledValue = '',
  onChange,
  onSubmit,
  onClose,
  allowSwitchMode = true,
  showPreview = true,
  previewLabel,
  placeholder,
  presets = [15, 30, 45, 60],
  allowDecimal = false,
  min,
  max,
  className = '',
  id,
}) => {
  const { copywriting } = useFoCientI18n();

  const [mode, setMode] = useState<KeyboardMode>(initialMode);
  const [internalValue, setInternalValue] = useState<string>(String(controlledValue));
  const [isShiftActive, setIsShiftActive] = useState<boolean>(false);
  const [isSymbolsMode, setIsSymbolsMode] = useState<boolean>(false);

  useEffect(() => {
    setInternalValue(String(controlledValue));
  }, [controlledValue]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  if (!open && layout === 'bottom-sheet') {
    return null;
  }

  const activeValue = internalValue;

  const updateValue = (newVal: string) => {
    setInternalValue(newVal);
    onChange?.(newVal);
  };

  const handleKeyPress = (char: string) => {
    const nextVal = activeValue + (isShiftActive ? char.toUpperCase() : char);
    updateValue(nextVal);
  };

  const handleDelete = () => {
    if (activeValue.length > 0) {
      const nextVal = activeValue.slice(0, -1);
      updateValue(nextVal);
    }
  };

  const handleClear = () => {
    updateValue('');
  };

  const handlePresetClick = (addMinutes: number) => {
    const currentNum = Number.parseInt(activeValue, 10) || 0;
    const nextVal = String(currentNum + addMinutes);
    updateValue(nextVal);
  };

  const handleSubmit = () => {
    onSubmit?.(activeValue);
    if (layout === 'bottom-sheet') {
      onClose?.();
    }
  };

  // Keyboard Rows Definition for General QWERTY mode
  const qwertyRow1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  const qwertyRow2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
  const qwertyRow3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

  const symbolsRow1 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const symbolsRow2 = ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'];
  const symbolsRow3 = ['.', ',', '?', '!', "'", '#', '%', '+', '='];

  const content = (
    <div
      id={id}
      className={[
        'focient-keyboard',
        layout === 'docked' ? 'focient-keyboard--docked' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="region"
      aria-label={`Virtual Keyboard ${mode === 'number' ? 'Numeric' : 'General'}`}
    >
      {/* 1. Live Input Preview Bar */}
      {showPreview && (
        <div className="focient-keyboard-preview-bar">
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            {previewLabel && (
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted, #64748B)' }}>
                {previewLabel}
              </span>
            )}
            <div className="focient-keyboard-preview-text focient-tnum">
              {activeValue ? (
                <>
                  {activeValue}
                  <span className="focient-keyboard-cursor" aria-hidden="true" />
                </>
              ) : (
                <span style={{ color: 'var(--color-text-subtle, #94A3B8)' }}>
                  {placeholder ||
                    (mode === 'number'
                      ? copywriting.keyboard.inputNumberPlaceholder
                      : copywriting.keyboard.inputTextPlaceholder)}
                  <span className="focient-keyboard-cursor" aria-hidden="true" />
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {activeValue && (
              <button
                type="button"
                className="focient-input-icon-btn"
                onClick={handleClear}
                aria-label={copywriting.keyboard.clear}
              >
                <XIcon size="xs" />
              </button>
            )}

            {layout === 'bottom-sheet' && onClose && (
              <button
                type="button"
                className="focient-input-icon-btn"
                onClick={onClose}
                aria-label={copywriting.actions.close}
              >
                <ChevronDownIcon size="xs" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. NUMBER KEYPAD MODE (Integer / Duration Entry) */}
      {mode === 'number' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Quick Increment Preset Chips for mobile efficiency */}
          {presets && presets.length > 0 && (
            <div className="focient-keyboard-presets" role="toolbar" aria-label={copywriting.keyboard.quickDurationPresets}>
              {presets.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  className="focient-keyboard-preset-chip focient-tnum"
                  onClick={() => handlePresetClick(mins)}
                >
                  +{mins}{copywriting.capacity.minutesShort}
                </button>
              ))}
              {allowSwitchMode && (
                <button
                  type="button"
                  className="focient-keyboard-preset-chip"
                  style={{ marginLeft: 'auto', backgroundColor: '#E2E8F0', color: '#1E3A8A' }}
                  onClick={() => setMode('general')}
                >
                  {copywriting.keyboard.letters}
                </button>
              )}
            </div>
          )}

          {/* Number 3x4 Grid */}
          <div className="focient-keyboard-num-grid">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                className="focient-key focient-key--num"
                onClick={() => handleKeyPress(digit)}
                aria-label={`Digit ${digit}`}
              >
                {digit}
              </button>
            ))}

            {/* Bottom Row: Clear / Dot, 0, Backspace */}
            {allowDecimal ? (
              <button
                type="button"
                className="focient-key focient-key--special"
                onClick={() => {
                  if (!activeValue.includes('.')) handleKeyPress('.');
                }}
              >
                .
              </button>
            ) : (
              <button
                type="button"
                className="focient-key focient-key--special"
                onClick={handleClear}
                aria-label={copywriting.keyboard.clear}
              >
                {copywriting.keyboard.clear}
              </button>
            )}

            <button
              type="button"
              className="focient-key focient-key--num"
              onClick={() => handleKeyPress('0')}
              aria-label="Digit 0"
            >
              0
            </button>

            <button
              type="button"
              className="focient-key focient-key--special"
              onClick={handleDelete}
              aria-label={copywriting.keyboard.delete}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <line x1="18" y1="9" x2="12" y2="15" />
                <line x1="12" y1="9" x2="18" y2="15" />
              </svg>
            </button>
          </div>

          {/* Primary Submit Bar */}
          <button
            type="button"
            className="focient-key focient-key--action"
            onClick={handleSubmit}
            style={{ width: '100%', height: '48px' }}
          >
            {copywriting.keyboard.done}
          </button>
        </div>
      ) : (
        /* 3. GENERAL TEXT QWERTY / ALPHANUMERIC MODE (String Entry) */
        <div className="focient-keyboard-general-grid">
          {/* Row 1 */}
          <div className="focient-keyboard-row">
            {(isSymbolsMode ? symbolsRow1 : qwertyRow1).map((char) => (
              <button
                key={char}
                type="button"
                className="focient-key focient-key--letter"
                onClick={() => handleKeyPress(char)}
              >
                {isShiftActive && !isSymbolsMode ? char.toUpperCase() : char}
              </button>
            ))}
          </div>

          {/* Row 2 */}
          <div className="focient-keyboard-row">
            {(isSymbolsMode ? symbolsRow2 : qwertyRow2).map((char) => (
              <button
                key={char}
                type="button"
                className="focient-key focient-key--letter"
                onClick={() => handleKeyPress(char)}
              >
                {isShiftActive && !isSymbolsMode ? char.toUpperCase() : char}
              </button>
            ))}
          </div>

          {/* Row 3: Shift / Symbols Toggle, Letters, Backspace */}
          <div className="focient-keyboard-row">
            {!isSymbolsMode ? (
              <button
                type="button"
                className={[
                  'focient-key',
                  'focient-key--shift',
                  isShiftActive ? 'focient-key--shift-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setIsShiftActive((prev) => !prev)}
                aria-label={copywriting.keyboard.shift}
                aria-pressed={isShiftActive}
              >
                ⇧
              </button>
            ) : (
              <button
                type="button"
                className="focient-key focient-key--shift"
                onClick={() => setIsSymbolsMode(false)}
              >
                ABC
              </button>
            )}

            {(isSymbolsMode ? symbolsRow3 : qwertyRow3).map((char) => (
              <button
                key={char}
                type="button"
                className="focient-key focient-key--letter"
                onClick={() => handleKeyPress(char)}
              >
                {isShiftActive && !isSymbolsMode ? char.toUpperCase() : char}
              </button>
            ))}

            <button
              type="button"
              className="focient-key focient-key--backspace"
              onClick={handleDelete}
              aria-label={copywriting.keyboard.delete}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <line x1="18" y1="9" x2="12" y2="15" />
                <line x1="12" y1="9" x2="18" y2="15" />
              </svg>
            </button>
          </div>

          {/* Row 4: Mode Switch (?123 / 123), Space, Period, Done CTA */}
          <div className="focient-keyboard-row">
            <button
              type="button"
              className="focient-key focient-key--mode"
              onClick={() => {
                if (isSymbolsMode) {
                  setIsSymbolsMode(false);
                } else {
                  setIsSymbolsMode(true);
                }
              }}
            >
              {isSymbolsMode ? copywriting.keyboard.letters : copywriting.keyboard.symbols}
            </button>

            {allowSwitchMode && (
              <button
                type="button"
                className="focient-key focient-key--mode"
                onClick={() => setMode('number')}
                style={{ flex: 1.2 }}
              >
                {copywriting.keyboard.numbers}
              </button>
            )}

            <button
              type="button"
              className="focient-key focient-key--space"
              onClick={() => handleKeyPress(' ')}
              aria-label={copywriting.keyboard.space}
            >
              {copywriting.keyboard.space}
            </button>

            <button
              type="button"
              className="focient-key focient-key--letter"
              style={{ flex: 1 }}
              onClick={() => handleKeyPress('.')}
            >
              .
            </button>

            <button
              type="button"
              className="focient-key focient-key--done"
              onClick={handleSubmit}
            >
              {copywriting.keyboard.done}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (layout === 'bottom-sheet') {
    return (
      <div
        className="focient-keyboard-backdrop"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Virtual Keyboard Overlay"
      >
        <div
          className="focient-keyboard-sheet"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="focient-keyboard-sheet-handle" aria-hidden="true" />
          {content}
        </div>
      </div>
    );
  }

  return content;
};

/**
 * Number Keyboard Convenience Component
 */
export const NumericKeyboard: React.FC<Omit<KeyboardProps, 'mode'>> = (props) => (
  <Keyboard {...props} mode="number" />
);

/**
 * General Text QWERTY Keyboard Convenience Component
 */
export const GeneralKeyboard: React.FC<Omit<KeyboardProps, 'mode'>> = (props) => (
  <Keyboard {...props} mode="general" />
);

/**
 * Mobile Keyboard Bottom Sheet Overlay
 */
export const MobileKeyboardBottomSheet: React.FC<Omit<KeyboardProps, 'layout'>> = (props) => (
  <Keyboard {...props} layout="bottom-sheet" />
);
