import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'focus' | 'neutral' | 'accent' | 'warning';
  children: React.ReactNode;
}

/**
 * FoCient Badge / Tag (<Badge/>)
 *
 * Pill container with tabular figures (tnum) for duration and analytics metrics.
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  className = '',
  children,
  ...props
}) => {
  return (
    <span
      className={[
        'focient-badge',
        `focient-badge--${variant}`,
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </span>
  );
};
