import React, { useState, useEffect, useRef } from 'react';
import { useFoCientI18n } from '../i18n/I18nContext.js';
import { CheckCircleIcon, AlertCircleIcon, InfoIcon, XIcon } from '../icons/index.js';

export interface ToastMessage {
  id: string;
  message: string;
  variant?: 'default' | 'danger' | 'success';
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

export interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
  className?: string;
}

/**
 * FoCient Transient Toast (<Toast/>)
 *
 * Auto-dismiss with 4000ms (standard) / 6000ms (with undo action) / 7000ms (danger fail state).
 * Hovering on toast pauses the timer.
 */
export const Toast: React.FC<ToastProps> = ({ toast, onDismiss, className = '' }) => {
  const { copywriting } = useFoCientI18n();
  const isDanger = toast.variant === 'danger';
  const defaultDuration = isDanger ? 7000 : toast.actionLabel ? 6000 : 4000;
  const duration = toast.duration ?? defaultDuration;

  const [remainingTime, setRemainingTime] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (isPaused) return;

    startTimeRef.current = Date.now();
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, remainingTime);

    return () => clearTimeout(timer);
  }, [isPaused, remainingTime, toast.id, onDismiss]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    const elapsed = Date.now() - startTimeRef.current;
    setRemainingTime((prev) => Math.max(0, prev - elapsed));
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <div
      role="status"
      aria-live={isDanger ? 'assertive' : 'polite'}
      className={['focient-toast', isDanger ? 'focient-toast--danger' : '', className].filter(Boolean).join(' ')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="focient-toast-content">
        {isDanger && (
          <span style={{ color: 'var(--error-icon-base, #E11D48)', display: 'inline-flex', flexShrink: 0 }}>
            <AlertCircleIcon size="xs" />
          </span>
        )}
        <span>{toast.message}</span>
      </div>

      {toast.actionLabel && (
        <button
          type="button"
          className="focient-toast-action-btn"
          onClick={() => {
            toast.onAction?.();
            onDismiss(toast.id);
          }}
        >
          {toast.actionLabel || copywriting.actions.undo}
        </button>
      )}

      <button
        type="button"
        className="focient-toast-action-btn focient-toast-close-btn"
        style={{ padding: '2px 4px' }}
        onClick={() => onDismiss(toast.id)}
        aria-label={copywriting.actions.close}
      >
        ✕
      </button>
    </div>
  );
};

export interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  className?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  className = '',
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className={['focient-toast-container', className].filter(Boolean).join(' ')}>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export interface AlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'success' | 'adaptive' | 'info' | 'warning' | 'danger';
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
  className?: string;
}

/**
 * FoCient System Banner / Inline Alert (<Alert/>)
 *
 * Persistent feedback with calm, guilt-free visual tokens.
 */
export const Alert: React.FC<AlertProps> = ({
  title,
  children,
  variant = 'adaptive',
  actionLabel,
  onAction,
  onClose,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={[
        'focient-alert',
        `focient-alert--${variant}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Semantic Icon */}
      <div style={{ marginTop: '2px', flexShrink: 0 }}>
        {variant === 'success' ? (
          <CheckCircleIcon size="xs" />
        ) : variant === 'warning' ? (
          <AlertCircleIcon size="xs" />
        ) : (
          <InfoIcon size="xs" />
        )}
      </div>

      <div className="focient-alert-body">
        {title && <h4 className="focient-alert-title">{title}</h4>}
        <div>{children}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {actionLabel && onAction && (
          <button
            type="button"
            className="focient-btn focient-btn--sm focient-btn--ghost"
            onClick={onAction}
            style={{ fontWeight: 600 }}
          >
            {actionLabel}
          </button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="focient-input-icon-btn"
            aria-label="Tutup alert"
          >
            <XIcon size="xs" />
          </button>
        )}
      </div>
    </div>
  );
};
