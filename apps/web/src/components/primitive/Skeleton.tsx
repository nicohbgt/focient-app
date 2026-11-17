import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  variant?: 'text' | 'title' | 'badge' | 'card' | 'rect';
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * FoCient Skeleton Shimmer Primitive (<Skeleton/>)
 *
 * Implements FoCient Zero Layout Shift & Anti-Anxiety specifications:
 * - Fluid gradient shimmer wave (1600ms ease-in-out)
 * - Calming neutral surface fill (#F1F5F9 in light mode, #1E293B in dark mode)
 * - Exact geometric replication of text, titles, badges, and cards
 * - Respects prefers-reduced-motion
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  circle = false,
  variant = 'rect',
  borderRadius,
  className = '',
  style,
  ...props
}) => {
  const resolvedWidth = typeof width === 'number' ? `${width}px` : width;
  const resolvedHeight = typeof height === 'number' ? `${height}px` : height;
  const resolvedRadius = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;

  const classes = [
    'focient-skeleton',
    circle ? 'focient-skeleton--circle' : '',
    variant !== 'rect' ? `focient-skeleton--${variant}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const inlineStyles: React.CSSProperties = {
    width: resolvedWidth,
    height: resolvedHeight,
    borderRadius: resolvedRadius,
    ...style,
  };

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat konten..."
      className={classes}
      style={inlineStyles}
      {...props}
    />
  );
};
