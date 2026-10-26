import React from 'react';
import { useFoCientI18n } from '../i18n/I18nContext.js';
import { CloudOffIcon, ServerCrashIcon } from '../icons/index.js';
import { Button } from '../primitive/Button.js';

export interface FullViewErrorProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onRetry?: () => void;
  type?: 'offline' | 'server';
  className?: string;
  loading?: boolean;
}

/**
 * FoCient Full-View System / Offline Fail State (<FullViewError/>)
 *
 * Appears when the client loses complete connection or the backend engine returns 500.
 *
 * Guilt-free, calm reassurance that all local tasks remain safely stored,
 * with a prominent 48px recovery action button.
 */
export const FullViewError: React.FC<FullViewErrorProps> = ({
  title,
  description,
  actionLabel,
  onRetry,
  type = 'offline',
  className = '',
  loading = false,
}) => {
  const { copywriting } = useFoCientI18n();

  const resolvedTitle = title || copywriting.errorStates.fullViewTitle;
  const resolvedDescription = description || copywriting.errorStates.fullViewBody;
  const resolvedActionLabel = actionLabel || copywriting.errorStates.fullViewAction;

  return (
    <div
      role="main"
      aria-label={resolvedTitle}
      className={['focient-fullview-error', className].filter(Boolean).join(' ')}
    >
      <div className="focient-fullview-icon" aria-hidden="true">
        {type === 'server' ? (
          <ServerCrashIcon size="4xl" />
        ) : (
          <CloudOffIcon size="4xl" />
        )}
      </div>

      <h2 className="focient-fullview-title">{resolvedTitle}</h2>
      <p className="focient-fullview-body">{resolvedDescription}</p>

      {onRetry && (
        <Button
          variant="primary"
          size="lg"
          loading={loading}
          onClick={onRetry}
        >
          {resolvedActionLabel}
        </Button>
      )}
    </div>
  );
};
