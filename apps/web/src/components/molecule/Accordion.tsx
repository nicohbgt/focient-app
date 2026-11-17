import React, { useState } from 'react';
import { ChevronDownIcon } from '../icons/index.js';

export interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  badge?: React.ReactNode;
  className?: string;
  id?: string;
}

/**
 * FoCient Accordion (<Accordion/>)
 *
 * Implements smooth detail disclosure using CSS Grid 0fr -> 1fr transitions,
 * synchronous 180deg chevron rotation in 200ms (--duration-normal, --ease-fluid),
 * and zero layout shifts when collapsed.
 */
export const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onToggle,
  badge,
  className = '',
  id,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    const next = !isExpanded;
    if (controlledExpanded === undefined) {
      setInternalExpanded(next);
    }
    onToggle?.(next);
  };

  const headerId = id ? `${id}-header` : undefined;
  const contentId = id ? `${id}-content` : undefined;

  return (
    <div
      className={['focient-accordion', className].filter(Boolean).join(' ')}
      data-expanded={isExpanded}
    >
      <button
        type="button"
        id={headerId}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        className="focient-accordion__header"
        onClick={handleToggle}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span>{title}</span>
          {badge}
        </span>
        <span className="focient-accordion__chevron" aria-hidden="true">
          <ChevronDownIcon size="xs" />
        </span>
      </button>

      <div
        id={contentId}
        role="region"
        aria-labelledby={headerId}
        className="focient-accordion__content"
      >
        <div className="focient-accordion__inner">
          {children}
        </div>
      </div>
    </div>
  );
};
