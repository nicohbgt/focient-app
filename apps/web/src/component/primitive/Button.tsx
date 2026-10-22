import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'sm';
  children: React.ReactNode;
}

/**
 * FoCient Interactive Button (<Button/>)
 *
 * Primary (CTA): Cobalt Blue with scale(0.98) press feedback
 * Secondary: Adaptive Soft Teal for ripple actions
 * Ghost: Outline border for secondary options
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const classes = [
    'focient-btn',
    `focient-btn--${variant}`,
    `focient-btn--${size}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
