import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'standard' | 'compact';
  label?: string;
  disabled?: boolean;
  'aria-label'?: string;
  id?: string;
  className?: string;
}

/**
 * FoCient Toggle Switch (<Toggle/>)
 *
 * Implements smooth 200ms cubic-bezier transition,
 * tactile elastic knob stretch on press, and touch-safe hit area.
 */
export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  size = 'standard',
  label,
  disabled = false,
  'aria-label': ariaLabel,
  id,
  className = '',
}) => {
  const [isPressed, setIsPressed] = React.useState(false);

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel || label}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      id={id}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => !disabled && setIsPressed(false)}
      onMouseLeave={() => !disabled && setIsPressed(false)}
      onTouchStart={() => !disabled && setIsPressed(true)}
      onTouchEnd={() => !disabled && setIsPressed(false)}
      onTouchCancel={() => !disabled && setIsPressed(false)}
      className={[
        'focient-toggle-wrapper',
        isPressed ? 'focient-toggle-wrapper--pressed' : '',
        disabled ? 'focient-toggle-wrapper--disabled' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[
          'focient-toggle-track',
          size === 'compact' ? 'focient-toggle-track--compact' : '',
          checked ? 'focient-toggle-track--checked' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="focient-toggle-knob" />
      </div>

      {label && <span className="focient-checkbox-label">{label}</span>}
    </div>
  );
};
