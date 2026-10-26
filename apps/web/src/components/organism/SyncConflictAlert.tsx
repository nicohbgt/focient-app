import React from 'react';
import { useFoCientI18n } from '../i18n/I18nContext.js';
import { AlertCircleIcon } from '../icons/index.js';
import { Button } from '../primitive/Button.js';

export interface SyncConflictAlertProps {
  title?: string;
  description?: string;
  onUseLatest?: () => void;
  onKeepDraft?: () => void;
  latestLabel?: string;
  keepDraftLabel?: string;
  className?: string;
  loading?: boolean;
}

/**
 * FoCient Data Conflict / Sync Fail Banner (<SyncConflictAlert/>)
 *
 * Appears persistently over the timeline when two conflicting schedule versions
 * exist between cross-device clients.
 *
 * Uses calming amber semantic tokens (no red) to prevent cognitive panic,
 * offering a calm, dual-action path to choose between latest remote or local draft.
 */
export const SyncConflictAlert: React.FC<SyncConflictAlertProps> = ({
  title,
  description,
  onUseLatest,
  onKeepDraft,
  latestLabel,
  keepDraftLabel,
  className = '',
  loading = false,
}) => {
  const { copywriting } = useFoCientI18n();

  const resolvedTitle = title || copywriting.errorStates.syncConflictTitle;
  const resolvedDescription = description || copywriting.errorStates.syncConflictBody;
  const resolvedLatestLabel = latestLabel || copywriting.errorStates.useLatestVersionAction;
  const resolvedKeepDraftLabel = keepDraftLabel || copywriting.errorStates.keepDraftAction;

  return (
    <div
      role="alert"
      className={['focient-sync-conflict-banner', className].filter(Boolean).join(' ')}
    >
      <div className="focient-sync-conflict-icon" aria-hidden="true">
        <AlertCircleIcon size="sm" />
      </div>

      <div className="focient-sync-conflict-body">
        <h4 className="focient-sync-conflict-title">{resolvedTitle}</h4>
        <p className="focient-sync-conflict-description">{resolvedDescription}</p>

        <div className="focient-sync-conflict-actions">
          {onUseLatest && (
            <Button
              variant="primary"
              size="sm"
              loading={loading}
              onClick={onUseLatest}
            >
              {resolvedLatestLabel}
            </Button>
          )}

          {onKeepDraft && (
            <Button
              variant="ghost"
              size="sm"
              disabled={loading}
              onClick={onKeepDraft}
            >
              {resolvedKeepDraftLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
