import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'focus' | 'neutral' | 'accent' | 'warning' | 'success';
  size?: 'sm' | 'xs';
  children: React.ReactNode;
}

/**
 * FoCient Badge (<Badge/>)
 *
 * Non-interactive status pill with tabular figures (tnum)
 * for priorities, duration estimates, and workload indicators.
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'sm',
  className = '',
  children,
  ...props
}) => {
  return (
    <span
      className={[
        'focient-badge',
        `focient-badge--${variant}`,
        `focient-badge--${size}`,
        'focient-tnum',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </span>
  );
};
