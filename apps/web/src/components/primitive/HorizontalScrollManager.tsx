'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Custom hook to attach mouse wheel horizontal scrolling and mouse drag-to-scroll
 * to a specific container reference.
 */
export function useHorizontalScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasMoved = false;

    // 1. Mouse wheel horizontal scroll without Shift key
    const handleWheel = (e: WheelEvent) => {
      if (e.shiftKey) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (el.scrollWidth > el.clientWidth) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    // 2. Mouse drag-to-scroll (grab & drag)
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Only primary (left) button
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      isDown = true;
      hasMoved = false;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      el.style.cursor = 'grabbing';
      el.style.userSelect = 'none';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.2;
      if (Math.abs(walk) > 4) {
        hasMoved = true;
      }
      el.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = '';
      el.style.removeProperty('user-select');
    };

    const handleMouseLeave = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = '';
      el.style.removeProperty('user-select');
    };

    const handleClickCapture = (e: MouseEvent) => {
      if (hasMoved) {
        e.stopPropagation();
        e.preventDefault();
        hasMoved = false;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('click', handleClickCapture, true);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('click', handleClickCapture, true);
    };
  }, []);

  return ref;
}

/**
 * Global HorizontalScrollManager
 * Automatically empowers every horizontally scrollable element across the app with:
 * 1. Mouse wheel horizontal scrolling (no Shift key required).
 * 2. Mouse click-and-drag panning (drag to scroll with grab cursor & click protection).
 */
export const HorizontalScrollManager: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let activeDragEl: HTMLElement | null = null;
    let startX = 0;
    let initialScrollLeft = 0;
    let hasDragged = false;
    let dragThreshold = 5;

    // Helper to find horizontally scrollable container
    const findHorizontalScrollParent = (target: HTMLElement | null): HTMLElement | null => {
      while (target && target !== document.body && target !== document.documentElement) {
        const style = window.getComputedStyle(target);
        const overflowX = style.overflowX;
        const isScrollableX =
          (overflowX === 'auto' || overflowX === 'scroll' || target.classList.contains('touch-pan-x')) &&
          target.scrollWidth > target.clientWidth + 2;

        const overflowY = style.overflowY;
        const isScrollableY =
          (overflowY === 'auto' || overflowY === 'scroll') && target.scrollHeight > target.clientHeight + 2;

        // If it scrolls horizontally and is not primarily a vertical container
        if (isScrollableX && !isScrollableY) {
          return target;
        }
        target = target.parentElement;
      }
      return null;
    };

    // 1. Mouse Wheel -> Horizontal Scroll on horizontal containers
    const handleGlobalWheel = (e: WheelEvent) => {
      if (e.shiftKey) return; // Allow native shift+wheel
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // Allow native touchpad horizontal swipe

      const scrollParent = findHorizontalScrollParent(e.target as HTMLElement);
      if (scrollParent) {
        e.preventDefault();
        scrollParent.scrollLeft += e.deltaY;
      }
    };

    // 2. Mouse Down -> Start Drag-to-Scroll
    const handleGlobalMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Only primary button
      const target = e.target as HTMLElement;

      // Don't drag if clicking in text inputs or controls
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      const scrollParent = findHorizontalScrollParent(target);
      if (scrollParent) {
        activeDragEl = scrollParent;
        startX = e.pageX;
        initialScrollLeft = scrollParent.scrollLeft;
        hasDragged = false;
      }
    };

    // 3. Mouse Move -> Pan Container
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!activeDragEl) return;

      const delta = e.pageX - startX;
      if (Math.abs(delta) > dragThreshold) {
        hasDragged = true;
        activeDragEl.style.cursor = 'grabbing';
        activeDragEl.style.userSelect = 'none';
      }

      activeDragEl.scrollLeft = initialScrollLeft - delta;
    };

    // 4. Mouse Up -> End Drag
    const handleGlobalMouseUp = () => {
      if (activeDragEl) {
        activeDragEl.style.cursor = '';
        activeDragEl.style.removeProperty('user-select');
        activeDragEl = null;
      }
    };

    // 5. Click Capture -> Suppress accidental click if user was dragging
    const handleGlobalClickCapture = (e: MouseEvent) => {
      if (hasDragged) {
        e.stopPropagation();
        e.preventDefault();
        hasDragged = false;
      }
    };

    window.addEventListener('wheel', handleGlobalWheel, { passive: false });
    window.addEventListener('mousedown', handleGlobalMouseDown, { capture: true });
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('click', handleGlobalClickCapture, { capture: true });

    return () => {
      window.removeEventListener('wheel', handleGlobalWheel);
      window.removeEventListener('mousedown', handleGlobalMouseDown, { capture: true });
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('click', handleGlobalClickCapture, { capture: true });
    };
  }, []);

  return null;
};
