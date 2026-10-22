import React from 'react';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
  id?: string;
}

/**
 * FoCient Checkbox (<Checkbox/>)
 *
 * Touch target: 48px x 48px hitbox.
 * Visual box: 20px x 20px with micro-pop checkmark animation.
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
  'aria-label': ariaLabel = 'Tandai tuntas',
  id,
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

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      id={id}
      className="focient-checkbox-wrapper"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className={[
          'focient-checkbox-box',
          checked ? 'focient-checkbox-box--checked' : '',
        ].filter(Boolean).join(' ')}
      >
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
      </div>
    </div>
  );
};
