import React from 'react';

export interface RadioProps {
  name?: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  label?: string;
  variant?: 'primary' | 'adaptive';
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * FoCient Radio Button (<Radio/>)
 *
 * Hitbox 48px on mobile, 36px on desktop.
 * Smooth 150ms dot expansion with DTCG token colors.
 */
export const Radio: React.FC<RadioProps> = ({
  name,
  value,
  checked,
  onChange,
  label,
  variant = 'primary',
  disabled = false,
  id,
  className = '',
}) => {
  const handleClick = () => {
    if (!disabled) {
      onChange(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      onChange(value);
    }
  };

  const circleClasses = [
    'focient-radio-circle',
    checked ? 'focient-radio-circle--selected' : '',
    checked && variant === 'adaptive' ? 'focient-radio-circle--adaptive' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const wrapperClasses = [
    'focient-radio-wrapper',
    disabled ? 'focient-radio-wrapper--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      role="radio"
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      id={id}
      className={wrapperClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className={circleClasses}>
        <div className="focient-radio-dot" />
      </div>

      {label && <span className="focient-checkbox-label">{label}</span>}
    </div>
  );
};

export interface RadioCardProps {
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: string;
  subtitle?: string;
  trailingBadge?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * FoCient Radio Card Row (<RadioCard/>)
 *
 * Full-row interactive selection card (e.g. for focus session durations).
 * Padding 16px 12px, border 1.5px #2563EB and bg #EFF6FF when selected.
 */
export const RadioCard: React.FC<RadioCardProps> = ({
  value,
  checked,
  onChange,
  title,
  subtitle,
  trailingBadge,
  disabled = false,
  id,
  className = '',
}) => {
  const handleClick = () => {
    if (!disabled) onChange(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      onChange(value);
    }
  };

  return (
    <div
      role="radio"
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      id={id}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={[
        'focient-radio-card',
        checked ? 'focient-radio-card--selected' : '',
        disabled ? 'focient-radio-card--disabled' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          className={[
            'focient-radio-circle',
            checked ? 'focient-radio-circle--selected' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className="focient-radio-dot" />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-main, #0F172A)' }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748B)', marginTop: '2px' }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {trailingBadge && <div>{trailingBadge}</div>}
    </div>
  );
};
