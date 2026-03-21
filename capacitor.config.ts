import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.anywherelearning.app',
  appName: 'Anywhere Learning',
  webDir: 'public',
  server: {
    // In production, this loads from the live site.
    // During development, run `npm run dev:mobile` (port 3001)
    url: process.env.CAPACITOR_SERVER_URL || 'https://anywherelearning.co',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#faf9f6',
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#faf9f6',
    },
  },
  ios: {
    scheme: 'Anywhere Learning',
    contentInset: 'automatic',
  },
  android: {
    backgroundColor: '#faf9f6',
  },
};

export default config;
