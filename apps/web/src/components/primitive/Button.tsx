import React from 'react';
import { CheckIcon } from '../icons/index.js';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'subtle-primary' | 'subtle-secondary';
  size?: 'lg' | 'md' | 'sm';
  loading?: boolean;
  shake?: boolean;
  success?: boolean;
  successLabel?: string;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * FoCient Interactive Button (<Button/>)
 *
 * Implements tactile scale(0.98) physical press confirmation,
 * DTCG semantic token color transitions, and WCAG 2.1 AAA touch target standards.
 *
 * Sizes:
 * - Large (lg): 48px height (Mobile & Primary touch)
 * - Medium (md): 40px height (Desktop default)
 * - Small (sm): 32px height (In-card & inline actions)
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      shake = false,
      success = false,
      successLabel,
      fullWidth = false,
      leadingIcon,
      trailingIcon,
      className = '',
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const classes = [
      'focient-btn',
      'focient-interactive',
      `focient-btn--${variant}`,
      `focient-btn--${size}`,
      fullWidth ? 'focient-btn--full' : '',
      loading ? 'focient-btn--loading' : '',
      shake ? 'focient-btn--shake' : '',
      success ? 'focient-btn--success' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <span className="focient-btn-spinner" aria-hidden="true" />
        ) : success ? (
          <>
            <span className="focient-btn-success-check" aria-hidden="true">
              <CheckIcon size="xs" />
            </span>
            <span>{successLabel ?? 'Tersimpan'}</span>
          </>
        ) : (
          <>
            {leadingIcon && <span className="focient-btn-icon-leading">{leadingIcon}</span>}
            {children}
            {trailingIcon && <span className="focient-btn-icon-trailing">{trailingIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
