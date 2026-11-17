'use client';

import React from 'react';

export interface FoCientLogoProps {
  /** Size in pixels (for square container if withBackground is true, or height if false) */
  size?: number | string;
  className?: string;
  /** Fill color for SVG. Defaults to '#2563EB' (brand cobalt) or 'currentColor' when withBackground is true */
  color?: string;
  /** Wrap logo mark in a styled background container */
  withBackground?: boolean;
  /** CSS classes for background container when withBackground is true */
  backgroundClassName?: string;
  ariaLabel?: string;
}

/**
 * Official FoCient Brand Logo
 *
 * Minimalist segmented lowercase 'f' representing dynamic cognitive rhythm,
 * adaptive focus flow, and guilt-free productivity.
 */
export const FoCientLogo: React.FC<FoCientLogoProps> = ({
  size = 32,
  className = '',
  color = '#2563EB',
  withBackground = false,
  backgroundClassName = 'bg-white border border-slate-200 text-[#2563EB] shadow-xs',
  ariaLabel = 'FoCient Logo',
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;
  const effectiveColor = color ?? '#2563EB';

  const svgElement = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="138 11 220 492"
      fill={effectiveColor}
      style={{
        height: withBackground ? '68%' : pixelSize,
        width: withBackground ? 'auto' : undefined,
        maxHeight: pixelSize,
      }}
      className={`shrink-0 transition-transform ${className}`}
      aria-label={ariaLabel}
      role="img"
    >
      <path
        fillRule="evenodd"
        d="M 266 16 L 304 18 L 335 27 L 327 49 L 303 41 L 267 39 L 265 17 Z M 236 23 L 239 24 L 246 44 L 216 60 L 194 81 L 177 66 L 206 39 L 235 24 Z M 167 82 L 185 94 L 173 118 L 167 142 L 146 139 L 153 111 L 167 83 Z M 154 163 L 166 163 L 170 190 L 191 241 L 197 272 L 186 274 L 175 272 L 171 248 L 148 189 L 145 164 L 153 164 Z M 290 225 L 319 229 L 353 243 L 341 263 L 313 251 L 290 248 L 290 226 Z M 262 229 L 269 251 L 242 264 L 219 286 L 201 272 L 228 246 L 248 234 L 261 230 Z M 176 295 L 197 297 L 191 329 L 169 383 L 164 411 L 143 409 L 149 377 L 167 334 L 176 296 Z M 164 431 L 170 460 L 183 488 L 164 498 L 150 467 L 144 433 L 163 432 Z"
      />
    </svg>
  );

  if (!withBackground) {
    return svgElement;
  }

  return (
    <div
      style={{ width: pixelSize, height: pixelSize }}
      className={`rounded-xl flex items-center justify-center shrink-0 ${backgroundClassName}`}
    >
      {svgElement}
    </div>
  );
};
