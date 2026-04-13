'use client';

import { useEffect } from 'react';

/**
 * Prevents casual image saving via right-click, drag-and-drop, and
 * long-press (mobile). Not bulletproof against dev tools, but stops
 * the vast majority of users.
 */
export default function ImageProtection() {
  useEffect(() => {
    function handleContextMenu(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || target.closest('img')) {
        e.preventDefault();
      }
    }

    function handleDragStart(e: DragEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        e.preventDefault();
      }
    }

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return null;
}
