import React from 'react';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  dotColor?: string;
  variant?: 'blue' | 'teal' | 'purple' | 'amber' | 'emerald' | 'gray';
}

const variantDotColors: Record<string, string> = {
  blue: '#2563EB',
  teal: '#0D9488',
  purple: '#7C3AED',
  amber: '#D97706',
  emerald: '#059669',
  gray: '#64748B',
};

/**
 * FoCient Project Category Tag (<Tag/>)
 *
 * Displays an 8px color dot in front of the project pillar name
 * with 4px/8px radius and calm neutral background.
 */
export const Tag: React.FC<TagProps> = ({
  label,
  dotColor,
  variant = 'blue',
  className = '',
  ...props
}) => {
  const activeColor = dotColor || variantDotColors[variant] || '#2563EB';

  return (
    <span
      className={['focient-tag', className].filter(Boolean).join(' ')}
      {...props}
    >
      <span
        className="focient-tag-dot"
        style={{ backgroundColor: activeColor }}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
};
