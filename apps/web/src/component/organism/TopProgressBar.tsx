import React from 'react';

export interface TopProgressBarProps {
  loading?: boolean;
  progress?: number; // 0 to 100
  indeterminate?: boolean;
  className?: string;
}

/**
 * FoCient Global Micro Top Progress Bar (<TopProgressBar/>)
 *
 * Implements non-intrusive page/bar progress at the uppermost screen edge (3px).
 * Replaces full-screen blocking overlays for lightweight feedback.
 */
export const TopProgressBar: React.FC<TopProgressBarProps> = ({
  loading = true,
  progress,
  indeterminate = true,
  className = '',
}) => {
  if (!loading) return null;

  const isIndeterminate = indeterminate || progress === undefined;

  return (
    <div
      role="progressbar"
      aria-label="Proses sinkronisasi halaman"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={isIndeterminate ? undefined : progress}
      className={['focient-top-progress-bar', className].filter(Boolean).join(' ')}
    >
      <div
        className={[
          'focient-top-progress-bar-indicator',
          isIndeterminate ? 'focient-top-progress-bar-indicator--indeterminate' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={!isIndeterminate ? { width: `${Math.min(100, Math.max(0, progress || 0))}%` } : undefined}
      />
    </div>
  );
};
