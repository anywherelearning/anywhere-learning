'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface CapacitorContextValue {
  /** True when running inside the Capacitor native shell */
  isNative: boolean;
}

const CapacitorContext = createContext<CapacitorContextValue>({ isNative: false });

export function useCapacitor() {
  return useContext(CapacitorContext);
}

export default function CapacitorProvider({ children }: { children: ReactNode }) {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: boolean } }).Capacitor;
    const realNative = !!cap?.isNativePlatform;

    // Dev-only: NEXT_PUBLIC_NATIVE_MODE=true (set by dev:mobile script) or ?native=true
    const envNative = process.env.NEXT_PUBLIC_NATIVE_MODE === 'true';
    const debugNative =
      process.env.NODE_ENV === 'development' &&
      (envNative || new URLSearchParams(window.location.search).get('native') === 'true');

    if (debugNative) {
      // Persist so navigating between pages keeps native mode
      localStorage.setItem('debug-native', '1');
    }
    const persistedDebug =
      process.env.NODE_ENV === 'development' &&
      localStorage.getItem('debug-native') === '1';

    // Clear debug mode with ?native=false
    if (new URLSearchParams(window.location.search).get('native') === 'false') {
      localStorage.removeItem('debug-native');
    }

    const native = realNative || debugNative || persistedDebug;
    setIsNative(native);

    if (!native) return;

    // ── Hide splash screen after page loads ──
    (async () => {
      try {
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide();
      } catch {
        // Plugin not available — ignore
      }
    })();

    // ── Style the native status bar ──
    (async () => {
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#faf9f6' });
      } catch {
        // Plugin not available or not supported (iOS doesn't support setBackgroundColor)
      }
    })();

    // ── Register for push notifications ──
    (async () => {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications');

        // Request permission
        const permission = await PushNotifications.requestPermissions();
        if (permission.receive !== 'granted') return;

        // Register with APNS/FCM
        await PushNotifications.register();

        // Listen for token
        PushNotifications.addListener('registration', async (token) => {
          try {
            await fetch('/api/push/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token: token.value,
                platform: (() => {
                  const c = (window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor;
                  return c?.getPlatform ? c.getPlatform() : 'unknown';
                })(),
              }),
            });
          } catch {
            // Silent fail — token registration is best-effort
          }
        });

        // Handle notification tap (open the app to /shop)
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          const url = notification.notification.data?.url as string | undefined;
          if (url) {
            window.location.href = url;
          }
        });
      } catch {
        // Push not available — ignore (e.g. running in web)
      }
    })();
  }, []);

  return (
    <CapacitorContext.Provider value={{ isNative }}>
      {children}
    </CapacitorContext.Provider>
  );
}
