import React from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  variant?: 'neutral' | 'info' | 'adaptive';
  children: React.ReactNode;
  className?: string;
}

/**
 * FoCient Calm UI Tooltip (<Tooltip/>)
 *
 * Uses soft light surfaces to minimize visual noise and cognitive load.
 * 150ms hover delay with subtle elevation.
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  variant = 'neutral',
  children,
  className = '',
}) => {
  const [dismissed, setDismissed] = React.useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setDismissed(true);
    }
  };

  const handleMouseLeave = () => {
    setDismissed(false);
  };

  return (
    <div
      className="focient-tooltip-container"
      onKeyDown={handleKeyDown}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <div
        role="tooltip"
        className={[
          'focient-tooltip-bubble',
          `focient-tooltip--${variant}`,
          dismissed ? 'focient-tooltip--dismissed' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {content}
      </div>
    </div>
  );
};
