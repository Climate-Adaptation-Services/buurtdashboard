import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'nl.cas.buurtdashboard',
  appName: 'Buurtdashboard',
  webDir: 'build',
  server: {
    // Load live website instead of local build
    url: 'https://buurtdashboard.vercel.app',
    cleartext: false
  },
  ios: {
    // Allow loading external data sources
    allowsLinkPreview: true,
    scrollEnabled: true
  }
};

export default config;
