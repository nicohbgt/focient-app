import React from 'react';
import { Button } from '../primitive/Button.js';

export interface RescheduleAlertProps {
  open?: boolean;
  isMobile?: boolean;
  description?: string;
  onApply: () => void;
  onDismiss: () => void;
  className?: string;
}

/**
 * FoCient Adaptive Reschedule Banner / Bottom Sheet (<RescheduleAlert/>)
 *
 * Guilt-free adaptive scheduling notification.
 * Strictly avoids punitive words ("Terlambat", "Gagal", "Missed").
 * Desktop: Push banner. Mobile: Smooth bottom sheet overlay.
 */
export const RescheduleAlert: React.FC<RescheduleAlertProps> = ({
  open = true,
  isMobile = false,
  description = 'Kapasitas harian memerlukan penyeimbangan alur waktu agar fokus tetap tenang.',
  onApply,
  onDismiss,
  className = '',
}) => {
  if (!open) return null;

  const content = (
    <>
      <div className="focient-reschedule-content">
        {/* UX Writing Wajib FoCient */}
        <h3 className="focient-reschedule-label">Perlu Penyesuaian Jadwal</h3>
        <p className="focient-reschedule-description">{description}</p>
      </div>

      <div className="focient-reschedule-actions">
        <Button variant="secondary" onClick={onApply}>
          Terapkan Penyesuaian
        </Button>
        <Button variant="ghost" onClick={onDismiss}>
          Nanti Saja / Abaikan
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
          <div className="focient-sheet-handle" />
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
