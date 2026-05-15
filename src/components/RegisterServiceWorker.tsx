'use client';
import { useEffect } from 'react';

export default function RegisterServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Service worker registered', reg);
        })
        .catch((err) => {
          console.warn('Service worker registration failed', err);
        });
    }

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent Chrome from showing the mini-infobar
      e.preventDefault();
      // Store the event for later use if you want to show your own install UI
      (window as any)._deferredPWAInstall = e;
      console.log('beforeinstallprompt captured');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  return null;
}
