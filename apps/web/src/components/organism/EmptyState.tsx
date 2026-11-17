import React from 'react';
import { useFoCientI18n } from '../i18n/I18nContext.js';
import {
  RouteIcon,
  CheckCircleIcon,
  SearchIcon,
  HourglassIcon,
} from '../icons/index.js';
import { Button } from '../primitive/Button.js';

export type EmptyStateVariant = 'onboarding' | 'all-completed' | 'search-empty' | 'rest-day';

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

/**
 * FoCient Empty State (<EmptyState/>)
 *
 * Implements FoCient Guilt-Free & Anti-Burnout Principles:
 * - Jeda Reflektif & Validasi Afirmatif (tanpa selebrasi berisik atau tuntutan instan)
 * - Ketiadaan Stigma Kosong (suportif, bukan peringatan cemas)
 * - Whitespace Lapang (--space-14 hingga --space-24 macro spacing)
 * - Single Clear Action (zero decision fatigue)
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'onboarding',
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  const { copywriting } = useFoCientI18n();

  // Variant-specific defaults
  const variantConfig = {
    onboarding: {
      ringClass: 'focient-empty-icon-ring--onboarding',
      defaultIcon: <RouteIcon size={40} />,
      defaultTitle: copywriting.emptyStates.onboardingTitle,
      defaultDescription: copywriting.emptyStates.onboardingBody,
      defaultActionLabel: copywriting.emptyStates.onboardingAction,
      buttonVariant: 'primary' as const,
      buttonSize: 'lg' as const,
    },
    'all-completed': {
      ringClass: 'focient-empty-icon-ring--completed',
      defaultIcon: <CheckCircleIcon size={40} />,
      defaultTitle: copywriting.emptyStates.allCompletedTitle,
      defaultDescription: copywriting.emptyStates.allCompletedBody,
      defaultActionLabel: copywriting.emptyStates.allCompletedAction,
      buttonVariant: 'outline' as const,
      buttonSize: 'md' as const,
    },
    'search-empty': {
      ringClass: 'focient-empty-icon-ring--search',
      defaultIcon: <SearchIcon size={36} />,
      defaultTitle: copywriting.emptyStates.searchEmptyTitle,
      defaultDescription: copywriting.emptyStates.searchEmptyBody,
      defaultActionLabel: copywriting.emptyStates.searchEmptyAction,
      buttonVariant: 'outline' as const,
      buttonSize: 'md' as const,
    },
    'rest-day': {
      ringClass: 'focient-empty-icon-ring--rest',
      defaultIcon: <HourglassIcon size={36} />,
      defaultTitle: copywriting.emptyStates.restDayTitle,
      defaultDescription: copywriting.emptyStates.restDayBody,
      defaultActionLabel: copywriting.emptyStates.restDayAction,
      buttonVariant: 'ghost' as const,
      buttonSize: 'md' as const,
    },
  }[variant];

  const resolvedTitle = title || variantConfig.defaultTitle;
  const resolvedDescription = description || variantConfig.defaultDescription;
  const resolvedActionLabel = actionLabel || variantConfig.defaultActionLabel;
  const resolvedSecondaryActionLabel =
    secondaryActionLabel || (variant === 'all-completed' ? copywriting.emptyStates.allCompletedSecondaryAction : undefined);

  return (
    <div
      role="region"
      aria-label={resolvedTitle}
      className={['focient-empty-state', className].filter(Boolean).join(' ')}
    >
      <div
        className={['focient-empty-icon-ring', variantConfig.ringClass].join(' ')}
        aria-hidden="true"
      >
        {icon || variantConfig.defaultIcon}
      </div>

      <h3 className="focient-empty-title">{resolvedTitle}</h3>
      <p className="focient-empty-body">{resolvedDescription}</p>

      {(onAction || onSecondaryAction) && (
        <div className="focient-empty-actions">
          {onAction && (
            <Button
              variant={variantConfig.buttonVariant}
              size={variantConfig.buttonSize}
              onClick={onAction}
            >
              {resolvedActionLabel}
            </Button>
          )}

          {onSecondaryAction && resolvedSecondaryActionLabel && (
            <Button
              variant="ghost"
              size="md"
              onClick={onSecondaryAction}
            >
              {resolvedSecondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
