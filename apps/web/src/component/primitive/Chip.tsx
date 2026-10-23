import React from 'react';
import { XIcon } from '../icons/index.js';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/**
 * FoCient Filter & Input Chip (<Chip/>)
 *
 * Interactive pill for timeline filtering and form tags.
 * Height 28px (Desktop) / 32px (Touch).
 * Selected state uses Cobalt Subtle (#EFF6FF / #2563EB).
 */
export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onClick,
  onDismiss,
  icon,
  disabled = false,
  className = '',
  id,
}) => {
  const isInteractive = Boolean(onClick);

  const classes = [
    'focient-chip',
    selected ? 'focient-chip--selected' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      id={id}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive && !disabled ? 0 : undefined}
      aria-pressed={isInteractive ? selected : undefined}
      className={classes}
      onClick={!disabled ? onClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
    >
      {icon && <span className="focient-chip-icon">{icon}</span>}
      <span>{label}</span>

      {onDismiss && (
        <button
          type="button"
          className="focient-chip-dismiss-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          aria-label={`Hapus ${label}`}
        >
          <XIcon size="xs" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};
