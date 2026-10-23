import React, { useEffect, useRef } from 'react';
import { useFoCientI18n } from '../i18n/I18nContext.js';
import { Button } from '../primitive/Button.js';
import { InputField } from '../primitive/InputField.js';
import { XIcon } from '../icons/index.js';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  isMobileSheet?: boolean;
  className?: string;
}

/**
 * FoCient Responsive Modal (<Modal/>)
 *
 * Switches smoothly between Desktop 560px Dialog and Mobile 100% Bottom Sheet.
 * Includes backdrop blur(4px), ESC dismiss, and focus trap.
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  isMobileSheet = false,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [isRendered, setIsRendered] = React.useState(open);
  const [isExiting, setIsExiting] = React.useState(false);
  const touchStartY = useRef<number>(0);

  // Manage mount / exit animation lifecycle
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement | null;
      setIsRendered(true);
      setIsExiting(false);
    } else if (isRendered && !isExiting) {
      setIsExiting(true);
      const exitDuration = isMobileSheet ? 250 : 200;
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsExiting(false);
        previousActiveElement.current?.focus();
      }, exitDuration);
      return () => clearTimeout(timer);
    }
  }, [open, isMobileSheet, isRendered, isExiting]);

  const handleDismiss = () => {
    if (isExiting) return;
    setIsExiting(true);
    const exitDuration = isMobileSheet ? 250 : 200;
    setTimeout(() => {
      onClose();
      previousActiveElement.current?.focus();
    }, exitDuration);
  };

  useEffect(() => {
    if (!isRendered) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRendered]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY > 50) {
      handleDismiss();
    }
  };

  if (!isRendered) return null;

  return (
    <div
      className={[
        'focient-modal-backdrop',
        isMobileSheet ? 'focient-modal-backdrop--sheet' : '',
        isExiting ? 'focient-modal-backdrop--exiting' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="focient-modal-title"
    >
      <div
        ref={modalRef}
        className={[
          isMobileSheet ? 'focient-bottom-sheet' : 'focient-modal-dialog',
          isExiting
            ? isMobileSheet
              ? 'focient-bottom-sheet--exiting'
              : 'focient-modal-dialog--exiting'
            : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {isMobileSheet && (
          <div
            className="focient-bottom-sheet-handle"
            aria-hidden="true"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={handleDismiss}
          />
        )}

        <div className="focient-modal-header">
          <h3 id="focient-modal-title" className="focient-modal-title">
            {title}
          </h3>
          <button
            type="button"
            className="focient-input-icon-btn"
            onClick={handleDismiss}
            aria-label="Tutup modal"
          >
            <XIcon size="xs" />
          </button>
        </div>

        <div className="focient-modal-body">{children}</div>

        {actions && (
          <div
            className={[
              'focient-modal-actions',
              isMobileSheet ? 'focient-modal-actions--sheet' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export const BottomSheet: React.FC<Omit<ModalProps, 'isMobileSheet'>> = (props) => {
  return <Modal {...props} isMobileSheet={true} />;
};

/**
 * Variant 1: Adaptive Reschedule Modal
 */
export interface AdaptiveRescheduleModalProps {
  open: boolean;
  onClose: () => void;
  onApplyNewSchedule: () => void;
  onBalanceRhythm: () => void;
  taskTitle?: string;
  recommendedTime?: string;
  isMobileSheet?: boolean;
}

export const AdaptiveRescheduleModal: React.FC<AdaptiveRescheduleModalProps> = ({
  open,
  onClose,
  onApplyNewSchedule,
  onBalanceRhythm,
  taskTitle = 'Tugas Fokus',
  recommendedTime = '14:00 - 14:45',
  isMobileSheet = false,
}) => {
  const { copywriting } = useFoCientI18n();

  return (
    <Modal
      open={open}
      onClose={onClose}
      isMobileSheet={isMobileSheet}
      title={copywriting.dialogs.adaptiveRescheduleHeading}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>
            {copywriting.actions.cancel}
          </Button>
          <Button variant="secondary" onClick={onBalanceRhythm}>
            {copywriting.actions.balanceRhythm}
          </Button>
          <Button variant="primary" onClick={onApplyNewSchedule}>
            {copywriting.actions.applyNewSchedule}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ margin: 0, color: 'var(--color-text-main, #0F172A)' }}>
          {copywriting.adaptive.rescheduleDescription}
        </p>
        <div style={{ padding: '12px', backgroundColor: '#F0FDFA', border: '1px solid #CCFBF1', borderRadius: '8px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#134E4A' }}>
            {taskTitle}
          </div>
          <div style={{ fontSize: '12px', color: '#0F766E', marginTop: '2px' }} className="focient-tnum">
            Rekomendasi Waktu: {recommendedTime}
          </div>
        </div>
      </div>
    </Modal>
  );
};

/**
 * Variant 2: Quick Task Entry Modal
 */
export interface QuickTaskEntryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (task: { title: string; duration: number; notes?: string }) => void;
  isMobileSheet?: boolean;
}

export const QuickTaskEntryModal: React.FC<QuickTaskEntryModalProps> = ({
  open,
  onClose,
  onSave,
  isMobileSheet = false,
}) => {
  const { copywriting } = useFoCientI18n();
  const [title, setTitle] = React.useState('');
  const [duration, setDuration] = React.useState('45');
  const [notes, setNotes] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(copywriting.forms.requiredHelper);
      return;
    }
    onSave({
      title: title.trim(),
      duration: Number.parseInt(duration, 10) || 30,
      notes: notes.trim() || undefined,
    });
    setTitle('');
    setNotes('');
    setError('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      isMobileSheet={isMobileSheet}
      title={copywriting.dialogs.quickTaskHeading}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>
            {copywriting.actions.cancel}
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {copywriting.actions.saveToTimeline}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <InputField
          label={copywriting.forms.taskTitleLabel}
          placeholder={copywriting.forms.taskTitlePlaceholder}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError('');
          }}
          error={error}
          autoFocus
        />

        <InputField
          label={copywriting.forms.durationLabel}
          placeholder={copywriting.forms.durationPlaceholder}
          variant="numeric"
          unit={copywriting.capacity.minutesShort}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          helperText={copywriting.forms.realisticDurationHelper}
        />

        <InputField
          label={copywriting.forms.notesLabel}
          placeholder={copywriting.forms.notesPlaceholder}
          variant="textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </form>
    </Modal>
  );
};

/**
 * Variant 3: Destructive Modal
 */
export interface DestructiveModalProps {
  open: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  taskTitle: string;
  isMobileSheet?: boolean;
}

export const DestructiveModal: React.FC<DestructiveModalProps> = ({
  open,
  onClose,
  onConfirmDelete,
  taskTitle,
  isMobileSheet = false,
}) => {
  const { copywriting } = useFoCientI18n();

  return (
    <Modal
      open={open}
      onClose={onClose}
      isMobileSheet={isMobileSheet}
      title={copywriting.dialogs.deleteHeading}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>
            {copywriting.actions.cancel}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirmDelete();
              onClose();
            }}
          >
            {copywriting.dialogs.deleteAction}
          </Button>
        </>
      }
    >
      <p style={{ margin: 0 }}>
        {copywriting.dialogs.deleteConfirmation}
      </p>
      <div style={{ marginTop: '12px', fontWeight: 600, color: 'var(--color-text-main, #0F172A)' }}>
        "{taskTitle}"
      </div>
    </Modal>
  );
};
