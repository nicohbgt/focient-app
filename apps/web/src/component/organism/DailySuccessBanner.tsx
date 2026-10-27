import React from 'react';
import { useFoCientI18n } from '../i18n/I18nContext.js';
import { CheckCircleIcon } from '../icons/index.js';

export interface DailySuccessBannerProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

/**
 * FoCient Daily Success Banner (<DailySuccessBanner/>)
 *
 * Appears calmly above the Today Plan timeline when Top 3 Priorities are achieved.
 * Adheres to Calm Affirmation (Anti-Hyper-Gamified) with no jarring modals or loud fireworks.
 */
export const DailySuccessBanner: React.FC<DailySuccessBannerProps> = ({
  title,
  description,
  action,
  onDismiss,
  className = '',
}) => {
  const { copywriting } = useFoCientI18n();

  const displayTitle = title ?? copywriting.successStates.dailyPillarCompletedTitle;
  const displayDescription = description ?? copywriting.successStates.dailyPillarCompletedBody;

  return (
    <div
      role="status"
      aria-live="polite"
      className={['focient-success-banner', className].filter(Boolean).join(' ')}
    >
      <div className="focient-success-banner-icon" aria-hidden="true">
        <CheckCircleIcon size="md" />
      </div>

      <div className="focient-success-banner-content">
        <h3 className="focient-success-banner-title">{displayTitle}</h3>
        <p className="focient-success-banner-body">{displayDescription}</p>

        {action && (
          <div className="focient-success-banner-actions">
            {action}
          </div>
        )}
      </div>

      {onDismiss && (
        <button
          type="button"
          className="focient-toast-action-btn focient-toast-close-btn"
          style={{ padding: '2px 4px', color: 'var(--success-text-bold, #065F46)', opacity: 0.7 }}
          onClick={onDismiss}
          aria-label={copywriting.actions.close}
        >
          ✕
        </button>
      )}
    </div>
  );
};
