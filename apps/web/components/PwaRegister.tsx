'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[Prolific News PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[Prolific News PWA] Service Worker registration failed:', err);
        });
    }
  }, []);

  return null;
}
