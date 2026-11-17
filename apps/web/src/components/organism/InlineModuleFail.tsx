import React from 'react';
import { useFoCientI18n } from '../i18n/I18nContext.js';
import { AlertOctagonIcon, RefreshCcwIcon } from '../icons/index.js';
import { Button } from '../primitive/Button.js';

export interface InlineModuleFailProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onRetry?: () => void;
  icon?: 'octagon' | 'refresh';
  className?: string;
  loading?: boolean;
}

/**
 * FoCient Module / Inline Fail State (<InlineModuleFail/>)
 *
 * Appears when an isolated module (e.g. Analytics Chart, Calendar Integration Slot)
 * fails to fetch or render, without blocking the user's primary focus workflow.
 *
 * Guilt-free, anti-accusatory feedback with one-click recovery CTA.
 */
export const InlineModuleFail: React.FC<InlineModuleFailProps> = ({
  title,
  description,
  actionLabel,
  onRetry,
  icon = 'octagon',
  className = '',
  loading = false,
}) => {
  const { copywriting } = useFoCientI18n();

  const resolvedTitle = title || copywriting.errorStates.moduleFailTitle;
  const resolvedDescription = description || copywriting.errorStates.moduleFailBody;
  const resolvedActionLabel = actionLabel || copywriting.errorStates.reloadModuleAction;

  return (
    <div
      role="region"
      aria-label={resolvedTitle}
      className={['focient-inline-fail', className].filter(Boolean).join(' ')}
    >
      <div className="focient-inline-fail-icon" aria-hidden="true">
        {icon === 'refresh' ? (
          <RefreshCcwIcon size={28} />
        ) : (
          <AlertOctagonIcon size={28} />
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <h4 className="focient-inline-fail-title">{resolvedTitle}</h4>
        <p className="focient-inline-fail-body">{resolvedDescription}</p>
      </div>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          loading={loading}
          onClick={onRetry}
          leadingIcon={<RefreshCcwIcon size="xs" />}
        >
          {resolvedActionLabel}
        </Button>
      )}
    </div>
  );
};
