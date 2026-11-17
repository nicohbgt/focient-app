import React from 'react';
import { useFoCientI18n } from '../i18n/I18nContext.js';
import { Button } from '../primitive/Button.js';
import { CalendarClockIcon, RotateCcwIcon, XIcon } from '../icons/index.js';

export interface RescheduleAlertProps {
  open?: boolean;
  isMobile?: boolean;
  title?: string;
  description?: string;
  applyLabel?: string;
  dismissLabel?: string;
  onApply: () => void;
  onDismiss: () => void;
  className?: string;
}

/**
 * FoCient Adaptive Reschedule Banner / Bottom Sheet (<RescheduleAlert/>)
 *
 * Guilt-free adaptive scheduling notification.
 * Strictly avoids punitive words ("Terlambat", "Gagal", "Missed", "Late").
 * Desktop: Push banner. Mobile: Smooth bottom sheet overlay.
 */
export const RescheduleAlert: React.FC<RescheduleAlertProps> = ({
  open = true,
  isMobile = false,
  title,
  description,
  applyLabel,
  dismissLabel,
  onApply,
  onDismiss,
  className = '',
}) => {
  const { copywriting } = useFoCientI18n();

  if (!open) return null;

  const displayTitle = title || copywriting.adaptive.rescheduleNotice;
  const displayDescription = description || copywriting.adaptive.rescheduleDescription;
  const displayApply = applyLabel || copywriting.actions.applyAdjustment;
  const displayDismiss = dismissLabel || copywriting.actions.dismissOrLater;

  const content = (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div
          style={{
            padding: '8px',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: 'var(--color-secondary-border-subtle, #CCFBF1)',
            color: 'var(--color-secondary-action-base, #0D9488)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CalendarClockIcon size="md" />
        </div>
        <div className="focient-reschedule-content">
          <h3 className="focient-reschedule-label">{displayTitle}</h3>
          <p className="focient-reschedule-description">{displayDescription}</p>
        </div>
      </div>

      <div className="focient-reschedule-actions">
        <Button variant="secondary" leadingIcon={<RotateCcwIcon size="xs" />} onClick={onApply}>
          {displayApply}
        </Button>
        <Button variant="ghost" leadingIcon={<XIcon size="xs" />} onClick={onDismiss}>
          {displayDismiss}
        </Button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="focient-sheet-backdrop" onClick={onDismiss} role="dialog" aria-modal="true">
        <div
          className={['focient-sheet-panel', className].filter(Boolean).join(' ')}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="focient-sheet-handle" aria-hidden="true" />
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={['focient-reschedule-banner', className].filter(Boolean).join(' ')}
    >
      {content}
    </div>
  );
};
