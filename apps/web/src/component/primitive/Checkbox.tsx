import React from 'react';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  needsAdjustment?: boolean;
  label?: string;
  strikethroughOnChecked?: boolean;
  variant?: 'primary' | 'success';
  'aria-label'?: string;
  id?: string;
  className?: string;
}

/**
 * FoCient Checkbox (<Checkbox/>)
 *
 * Implements tactile micro-pop animation, WCAG AAA 48px hitbox,
 * indeterminate subtask indicator, and guilt-free Amber "Needs Adjustment" state.
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
  indeterminate = false,
  needsAdjustment = false,
  label,
  strikethroughOnChecked = false,
  variant = 'primary',
  'aria-label': ariaLabel,
  id,
  className = '',
}) => {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      onChange(!checked);
    }
  };

  const isChecked = checked && !indeterminate && !needsAdjustment;

  const boxClasses = [
    'focient-checkbox-box',
    isChecked ? (variant === 'success' ? 'focient-checkbox-box--success' : 'focient-checkbox-box--checked') : '',
    needsAdjustment ? 'focient-checkbox-box--needs-adjustment' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const wrapperClasses = [
    'focient-checkbox-wrapper',
    disabled ? 'focient-checkbox-wrapper--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={ariaLabel || label}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      id={id}
      className={wrapperClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className={boxClasses}>
        {/* State 1: Needs Adjustment (Amber rotating cycle icon - Anti-toxic / zero red) */}
        {needsAdjustment ? (
          <svg
            className="focient-checkbox-icon"
            style={{ opacity: 1, transform: 'scale(1)', color: 'var(--color-warning-action-base, #D97706)' }}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 8A6 6 0 1 1 8 2" />
            <polyline points="8 5 8 2 11 2" />
          </svg>
        ) : indeterminate ? (
          /* State 2: Indeterminate Horizontal Dash */
          <svg
            className="focient-checkbox-icon"
            style={{ opacity: 1, transform: 'scale(1)' }}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="3.5" y1="8" x2="12.5" y2="8" />
          </svg>
        ) : (
          /* State 3: Standard Pop-in Checkmark */
          <svg
            className="focient-checkbox-icon"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
          </svg>
        )}
      </div>

      {label && (
        <span
          className={[
            'focient-checkbox-label',
            strikethroughOnChecked && isChecked ? 'focient-checkbox-label--strikethrough' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {label}
        </span>
      )}
    </div>
  );
};
