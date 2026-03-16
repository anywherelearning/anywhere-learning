/**
 * Capacitor native platform detection utilities.
 * These are used to conditionally show mobile app UI
 * (tab bar, hide web header/footer) when running inside
 * the Capacitor native shell.
 */

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CapacitorGlobal {
  isNativePlatform?: boolean;
  getPlatform?: () => string;
}

/** Check if the app is running inside a Capacitor native WebView */
export function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false;
  const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
  return !!cap?.isNativePlatform;
}

/** Dynamically import Capacitor Browser plugin (only loads in native context) */
export async function openExternalBrowser(url: string): Promise<void> {
  if (!isNativePlatform()) {
    // On web, just navigate normally
    window.location.href = url;
    return;
  }
  const { Browser } = await import('@capacitor/browser');
  await Browser.open({ url, windowName: '_system' });
}
