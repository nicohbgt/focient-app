'use client';

import React from 'react';

export interface FoCientWordmarkProps {
  /** Height in pixels or CSS unit (e.g. 24, '24px', '1.5rem') */
  height?: number | string;
  /** Width in pixels or CSS unit (defaults to auto maintaining aspect ratio) */
  width?: number | string;
  className?: string;
  /** If true, renders the white wordmark variant for dark backgrounds */
  light?: boolean;
  ariaLabel?: string;
}

/**
 * Official FoCient Brand Wordmark
 *
 * Displays the distinctive FoCient typographic wordmark (454:97 aspect ratio).
 * Replaces plain text "FoCient" across brand headers, welcome screens, and navigation.
 */
export const FoCientWordmark: React.FC<FoCientWordmarkProps> = ({
  height = 18,
  width,
  className = '',
  light = false,
  ariaLabel = 'FoCient',
}) => {
  const pixelHeight = typeof height === 'number' ? `${height}px` : height;
  const pixelWidth = typeof width === 'number' ? `${width}px` : width;
  const imageSrc = light
    ? '/brand/focient-wordmark-light.png'
    : '/brand/focient-wordmark.png';

  return (
    <img
      src={imageSrc}
      alt={ariaLabel}
      style={{
        height: pixelHeight,
        width: pixelWidth ?? 'auto',
        objectFit: 'contain',
      }}
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      loading="eager"
    />
  );
};
