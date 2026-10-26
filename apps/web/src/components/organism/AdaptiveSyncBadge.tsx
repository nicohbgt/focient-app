import React from 'react';
import { useFoCientI18n } from '../i18n/I18nContext.js';
import { RotateCcwIcon } from '../icons/index.js';

export interface AdaptiveSyncBadgeProps {
  label?: string;
  className?: string;
}

/**
 * FoCient Adaptive Background Sync Badge (<AdaptiveSyncBadge/>)
 *
 * Appears during silent background schedule optimization (AI scheduling engine).
 *
 * Implements FoCient Anti-Anxiety principles:
 * - Non-intrusive micro badge pill
 * - Slow, calm rotating refresh icon (1500ms)
 * - Supportive, non-technical copywriting ("Menyesuaikan ritme linimasa...")
 */
export const AdaptiveSyncBadge: React.FC<AdaptiveSyncBadgeProps> = ({
  label,
  className = '',
}) => {
  const { copywriting } = useFoCientI18n();
  const resolvedLabel = label || copywriting.loadingStates.syncingTimeline;

  return (
    <div
      role="status"
      aria-live="polite"
      className={['focient-sync-indicator', className].filter(Boolean).join(' ')}
    >
      <span className="focient-sync-spin-icon" aria-hidden="true">
        <RotateCcwIcon size="xs" />
      </span>
      <span>{resolvedLabel}</span>
    </div>
  );
};
