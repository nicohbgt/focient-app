import React from 'react';

export type IconName =
  | 'check'
  | 'check-circle'
  | 'circle'
  | 'clock'
  | 'calendar'
  | 'calendar-clock'
  | 'target'
  | 'sparkles'
  | 'rotate-ccw'
  | 'play'
  | 'pause'
  | 'pencil'
  | 'trash-2'
  | 'plus'
  | 'plus-circle'
  | 'x'
  | 'x-circle'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-right'
  | 'chevron-left'
  | 'arrow-right'
  | 'arrow-left'
  | 'search'
  | 'filter'
  | 'tag'
  | 'alert-triangle'
  | 'alert-circle'
  | 'info'
  | 'bar-chart-2'
  | 'trending-up'
  | 'sun'
  | 'moon'
  | 'bell'
  | 'grip-vertical'
  | 'layout-dashboard'
  | 'alert-octagon'
  | 'refresh-ccw'
  | 'cloud-off'
  | 'server-crash';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | number;
export type IconVariant = 'outline' | 'filled';

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  name: IconName;
  size?: IconSize;
  strokeWidth?: number;
  variant?: IconVariant;
}

const sizeMap: Record<string, number> = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 36,
  xl: 40,
  '2xl': 48,
  '3xl': 56,
  '4xl': 64,
};

// SVG paths mapped directly from the canonical Lucide geometry
const iconRegistry: Record<IconName, { outline: React.ReactNode; filled?: React.ReactNode }> = {
  check: {
    outline: <polyline points="20 6 9 17 4 12" />,
  },
  'check-circle': {
    outline: (
      <>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </>
    ),
    filled: (
      <>
        <circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" />
        <polyline points="9 12 11 14 15 10" stroke="#FFFFFF" strokeWidth="2.5" />
      </>
    ),
  },
  circle: {
    outline: <circle cx="12" cy="12" r="10" />,
  },
  clock: {
    outline: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
  },
  calendar: {
    outline: (
      <>
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </>
    ),
  },
  'calendar-clock': {
    outline: (
      <>
        <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h5" />
        <path d="M17.5 17.5 16 16.3V14" />
        <circle cx="16" cy="16" r="6" />
      </>
    ),
  },
  target: {
    outline: (
      <>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </>
    ),
    filled: (
      <>
        <circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="6" fill="#FFFFFF" stroke="none" />
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      </>
    ),
  },
  sparkles: {
    outline: (
      <>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" />
        <path d="M19 17v4" />
        <path d="M3 5h4" />
        <path d="M17 19h4" />
      </>
    ),
    filled: (
      <>
        <path
          d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"
          fill="currentColor"
          stroke="none"
        />
        <path d="M5 3v4" />
        <path d="M19 17v4" />
        <path d="M3 5h4" />
        <path d="M17 19h4" />
      </>
    ),
  },
  'rotate-ccw': {
    outline: (
      <>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </>
    ),
  },
  play: {
    outline: <polygon points="6 3 20 12 6 21 6 3" />,
    filled: <polygon points="6 3 20 12 6 21 6 3" fill="currentColor" stroke="none" />,
  },
  pause: {
    outline: (
      <>
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
      </>
    ),
  },
  pencil: {
    outline: (
      <>
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </>
    ),
  },
  'trash-2': {
    outline: (
      <>
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" x2="10" y1="11" y2="17" />
        <line x1="14" x2="14" y1="11" y2="17" />
      </>
    ),
  },
  plus: {
    outline: (
      <>
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </>
    ),
  },
  'plus-circle': {
    outline: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8" />
        <path d="M12 8v8" />
      </>
    ),
  },
  x: {
    outline: (
      <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </>
    ),
  },
  'x-circle': {
    outline: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </>
    ),
  },
  'chevron-down': {
    outline: <path d="m6 9 6 6 6-6" />,
  },
  'chevron-up': {
    outline: <path d="m18 15-6-6-6 6" />,
  },
  'chevron-right': {
    outline: <path d="m9 18 6-6-6-6" />,
  },
  'chevron-left': {
    outline: <path d="m15 18-6-6 6-6" />,
  },
  'arrow-right': {
    outline: (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    ),
  },
  'arrow-left': {
    outline: (
      <>
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </>
    ),
  },
  search: {
    outline: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </>
    ),
  },
  filter: {
    outline: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
  },
  tag: {
    outline: (
      <>
        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
        <path d="M7 7h.01" />
      </>
    ),
    filled: (
      <>
        <path
          d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"
          fill="currentColor"
          stroke="none"
        />
        <circle cx="7" cy="7" r="1.5" fill="#FFFFFF" stroke="none" />
      </>
    ),
  },
  'alert-triangle': {
    outline: (
      <>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" x2="12" y1="9" y2="13" />
        <line x1="12" x2="12.01" y1="17" y2="17" />
      </>
    ),
  },
  'alert-circle': {
    outline: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </>
    ),
  },
  info: {
    outline: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </>
    ),
  },
  'bar-chart-2': {
    outline: (
      <>
        <line x1="18" x2="18" y1="20" y2="10" />
        <line x1="12" x2="12" y1="20" y2="4" />
        <line x1="6" x2="6" y1="20" y2="14" />
      </>
    ),
  },
  'trending-up': {
    outline: (
      <>
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </>
    ),
  },
  sun: {
    outline: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </>
    ),
  },
  moon: {
    outline: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
  },
  bell: {
    outline: (
      <>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </>
    ),
    filled: (
      <>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" fill="currentColor" stroke="none" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" stroke="currentColor" strokeWidth="2" />
      </>
    ),
  },
  'grip-vertical': {
    outline: (
      <>
        <circle cx="9" cy="12" r="1" />
        <circle cx="9" cy="5" r="1" />
        <circle cx="9" cy="19" r="1" />
        <circle cx="15" cy="12" r="1" />
        <circle cx="15" cy="5" r="1" />
        <circle cx="15" cy="19" r="1" />
      </>
    ),
  },
  'layout-dashboard': {
    outline: (
      <>
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </>
    ),
  },
  'alert-octagon': {
    outline: (
      <>
        <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </>
    ),
  },
  'refresh-ccw': {
    outline: (
      <>
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 21h5v-5" />
      </>
    ),
  },
  'cloud-off': {
    outline: (
      <>
        <path d="m2 2 20 20" />
        <path d="M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193" />
        <path d="M21.532 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.008 7.008 0 0 0 10 5.07" />
      </>
    ),
  },
  'server-crash': {
    outline: (
      <>
        <path d="M6 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
        <path d="M6 14H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2" />
        <line x1="6" x2="6.01" y1="6" y2="6" strokeWidth="2.5" />
        <line x1="6" x2="6.01" y1="18" y2="18" strokeWidth="2.5" />
        <path d="m14 10-4 4" />
        <path d="m10 10 4 4" />
      </>
    ),
  },
};

/**
 * FoCient Icon Component
 *
 * Implements the Lucide icon geometry with automatic binding to FoCient design tokens:
 * - 24x24 viewBox base
 * - Scaled using --icon-size-* and --icon-stroke-* tokens
 * - Supports outline and filled states
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 'sm',
  strokeWidth = 2,
  variant = 'outline',
  color = 'currentColor',
  className = '',
  style,
  ...props
}) => {
  const pixelSize = typeof size === 'number' ? size : sizeMap[size] || 24;
  const iconData = iconRegistry[name];

  if (!iconData) {
    console.warn(`[FoCient] Icon "${name}" not found in icon registry.`);
    return null;
  }

  const content = variant === 'filled' && iconData.filled ? iconData.filled : iconData.outline;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={pixelSize}
      height={pixelSize}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={['focient-icon', className].filter(Boolean).join(' ')}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    >
      {content}
    </svg>
  );
};
