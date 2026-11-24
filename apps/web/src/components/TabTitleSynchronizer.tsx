'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useFocient, resolveDocumentTitle } from '../state/focient-store';

/**
 * TabTitleSynchronizer listens to Next.js App Router pathname transitions
 * and synchronizes the document.title in the browser tab.
 * Strictly enforces:
 * - Landing page: "FoCient"
 * - Other pages: "[nama page] - FoCient"
 * - No decorative icons or emojis
 */
export function TabTitleSynchronizer() {
  const pathname = usePathname();
  const { authView, activeNavTab, inspectorView, language, isAuthenticated } = useFocient();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const newTitle = resolveDocumentTitle({
      authView,
      activeNavTab,
      inspectorView,
      language,
      isAuthenticated,
      pathname: pathname || (typeof window !== 'undefined' ? window.location.pathname : ''),
    });
    document.title = newTitle;
  }, [authView, activeNavTab, inspectorView, language, isAuthenticated, pathname]);

  return null;
}
