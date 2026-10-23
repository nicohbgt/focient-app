import React, { useState } from 'react';
import { useFoCientI18n } from '../i18n/I18nContext.js';
import { MobileKeyboardBottomSheet } from './Keyboard.js';
import { SearchIcon, XIcon } from '../icons/index.js';

export interface InputFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  variant?: 'text' | 'search' | 'numeric' | 'password' | 'textarea' | 'select';
  unit?: string;
  leadingIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  options?: { value: string; label: string }[];
  enableVirtualKeyboard?: boolean;
  virtualKeyboardMode?: 'number' | 'general';
}

/**
 * FoCient Input Field (<InputField/>)
 *
 * Designed with calm visual hierarchy and guilt-free solutive error guidance.
 * Height 48px (Mobile) / 40px (Desktop), radius 8px, 2px primary focus state.
 * Supports tabular numbers (tnum) for numeric durations.
 */
export const InputField = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  InputFieldProps
>(
  (
    {
      label,
      helperText,
      error,
      variant = 'text',
      unit,
      leadingIcon,
      clearable = false,
      onClear,
      options,
      enableVirtualKeyboard = false,
      virtualKeyboardMode,
      id,
      className = '',
      value,
      onChange,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const { copywriting } = useFoCientI18n();
    const [showPassword, setShowPassword] = useState(false);
    const [keyboardOpen, setKeyboardOpen] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined);

    const isTextarea = variant === 'textarea';
    const isPassword = variant === 'password';
    const isSearch = variant === 'search';
    const isNumeric = variant === 'numeric';
    const isSelect = variant === 'select';
    const resolvedKeyboardMode = virtualKeyboardMode || (isNumeric ? 'number' : 'general');

    const hasValue = value !== undefined && value !== '';

    return (
      <div className="focient-input-container">
        {label && (
          <div className="focient-input-label-row">
            <label htmlFor={inputId} className="focient-input-label">
              {label}
            </label>
          </div>
        )}

        <div className="focient-input-box-wrapper">
          {/* Leading Icon (e.g. Search Magnifier) */}
          {(leadingIcon || isSearch) && (
            <span className="focient-input-leading" aria-hidden="true">
              {leadingIcon || <SearchIcon size={18} />}
            </span>
          )}

          {isSelect ? (
            <select
              id={inputId}
              ref={ref as React.ForwardedRef<HTMLSelectElement>}
              disabled={disabled}
              tabIndex={disabled ? -1 : undefined}
              value={value as string}
              onChange={onChange as unknown as React.ChangeEventHandler<HTMLSelectElement>}
              className={[
                'focient-input',
                hasValue ? 'focient-input--filled' : '',
                (leadingIcon || isSearch) ? 'focient-input--with-leading' : '',
                error ? 'focient-input--error' : '',
                className,
              ]
                .filter(Boolean)
                .join(' ')}
              {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
            >
              <option value="" disabled>
                {props.placeholder || copywriting.forms.selectPlaceholder}
              </option>
              {options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : isTextarea ? (
            <textarea
              id={inputId}
              ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
              disabled={disabled}
              tabIndex={disabled ? -1 : undefined}
              value={value}
              onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
              className={[
                'focient-input',
                'focient-textarea',
                hasValue ? 'focient-input--filled' : '',
                error ? 'focient-input--error' : '',
                className,
              ]
                .filter(Boolean)
                .join(' ')}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              id={inputId}
              ref={ref as React.ForwardedRef<HTMLInputElement>}
              type={isPassword ? (showPassword ? 'text' : 'password') : isNumeric ? 'number' : 'text'}
              disabled={disabled}
              tabIndex={disabled ? -1 : undefined}
              value={value}
              onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
              className={[
                'focient-input',
                isNumeric ? 'focient-tnum' : '',
                hasValue ? 'focient-input--filled' : '',
                (leadingIcon || isSearch) ? 'focient-input--with-leading' : '',
                (unit || clearable || onClear || isPassword) ? 'focient-input--with-trailing' : '',
                error ? 'focient-input--error' : '',
                className,
              ]
                .filter(Boolean)
                .join(' ')}
              {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          )}

          {/* Trailing Elements (Unit, Clear Button, Password Toggle) */}
          <div className="focient-input-trailing">
            {unit && <span className="focient-input-unit focient-tnum">{unit}</span>}

            {(clearable || onClear) && hasValue && !disabled && (
              <button
                type="button"
                className="focient-input-icon-btn focient-input-clear-btn"
                onClick={onClear}
                aria-label={copywriting.actions.clear}
              >
                <XIcon size={16} />
              </button>
            )}

            {isPassword && !disabled && (
              <button
                type="button"
                className="focient-input-icon-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? copywriting.actions.hidePassword : copywriting.actions.showPassword}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            )}
            {enableVirtualKeyboard && !disabled && (
              <button
                type="button"
                className="focient-input-icon-btn"
                onClick={() => setKeyboardOpen(true)}
                aria-label="Buka Virtual Keyboard"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <line x1="6" y1="8" x2="6.01" y2="8" strokeWidth="3" />
                  <line x1="10" y1="8" x2="10.01" y2="8" strokeWidth="3" />
                  <line x1="14" y1="8" x2="14.01" y2="8" strokeWidth="3" />
                  <line x1="18" y1="8" x2="18.01" y2="8" strokeWidth="3" />
                  <line x1="6" y1="12" x2="6.01" y2="12" strokeWidth="3" />
                  <line x1="18" y1="12" x2="18.01" y2="12" strokeWidth="3" />
                  <line x1="10" y1="16" x2="14" y2="16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Solutive Helper Text / Non-Punitive Error */}
        {error ? (
          <span className="focient-input-helper focient-input-helper--error" role="alert">
            {error}
          </span>
        ) : helperText ? (
          <span className="focient-input-helper">{helperText}</span>
        ) : null}

        {/* Mobile Virtual Keyboard Sheet */}
        {enableVirtualKeyboard && (
          <MobileKeyboardBottomSheet
            open={keyboardOpen}
            onClose={() => setKeyboardOpen(false)}
            mode={resolvedKeyboardMode}
            value={value !== undefined ? String(value) : ''}
            previewLabel={label}
            onChange={(newVal) => {
              if (onChange) {
                const syntheticEvent = {
                  target: { value: newVal },
                  currentTarget: { value: newVal },
                } as unknown as React.ChangeEvent<HTMLInputElement>;
                onChange(syntheticEvent);
              }
            }}
          />
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
