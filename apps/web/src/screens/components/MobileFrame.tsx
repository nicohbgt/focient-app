'use client';

import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
}

/**
 * Commercial Responsive Container
 * Renders 100% fluid responsive canvas across mobile, tablet, and desktop viewports.
 */
export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  return <div className="min-h-screen w-full">{children}</div>;
};
