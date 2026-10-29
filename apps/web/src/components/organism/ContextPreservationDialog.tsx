import React from 'react';
import { useFoCientI18n } from '../i18n/I18nContext.js';
import { useFocient } from '../../state/focient-store.js';
import { SparklesIcon } from '../icons/index.js';

export interface ContextPreservationDialogProps {
  isOpen?: boolean;
  draftTitle?: string;
  onSave?: () => void;
  onDiscard?: () => void;
  onCancel?: () => void;
}

export const ContextPreservationDialog: React.FC<ContextPreservationDialogProps> = ({
  isOpen: propIsOpen,
  draftTitle: propDraftTitle,
  onSave: propOnSave,
  onDiscard: propOnDiscard,
  onCancel: propOnCancel,
}) => {
  const { copywriting } = useFoCientI18n();
  const store = useFocient();

  const isOpen = propIsOpen !== undefined ? propIsOpen : store.isPreservationDialogOpen;
  const draftTitle = propDraftTitle || store.draftContext.draftTitle;

  const handleSave = propOnSave || (() => store.confirmPendingNavigation('save'));
  const handleDiscard = propOnDiscard || (() => store.confirmPendingNavigation('discard'));
  const handleCancel = propOnCancel || (() => store.confirmPendingNavigation('cancel'));

  if (!isOpen) return null;

  return (
    <div
      className="focient-preservation-backdrop"
      onClick={handleCancel}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="preservation-dialog-title"
      aria-describedby="preservation-dialog-desc"
    >
      <div
        className="focient-preservation-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="focient-preservation-header">
          <div className="focient-preservation-icon">
            <SparklesIcon size="sm" />
          </div>
          <div>
            <h3 id="preservation-dialog-title" className="focient-preservation-title">
              {copywriting.navigation.draftPreservationTitle}
            </h3>
            {draftTitle && (
              <span className="focient-preservation-badge">
                {draftTitle}
              </span>
            )}
          </div>
        </div>

        <p id="preservation-dialog-desc" className="focient-preservation-body">
          {copywriting.navigation.draftPreservationMessage}
        </p>

        <div className="focient-preservation-actions">
          <button
            type="button"
            className="focient-btn focient-btn--ghost focient-btn--sm"
            onClick={handleCancel}
          >
            {copywriting.navigation.draftPreservationCancel}
          </button>
          <button
            type="button"
            className="focient-btn focient-btn--secondary focient-btn--sm"
            onClick={handleDiscard}
          >
            {copywriting.navigation.draftPreservationDiscard}
          </button>
          <button
            type="button"
            className="focient-btn focient-btn--primary focient-btn--sm"
            onClick={handleSave}
            autoFocus
          >
            {copywriting.navigation.draftPreservationSave}
          </button>
        </div>
      </div>
    </div>
  );
};
