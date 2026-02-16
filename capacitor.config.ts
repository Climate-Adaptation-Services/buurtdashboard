import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'nl.cas.buurtdashboard',
  appName: 'Buurtdashboard',
  webDir: 'build',
  server: {
    // Allow loading external resources (maps, data)
    androidScheme: 'https'
  },
  ios: {
    // Allow loading external data sources
    allowsLinkPreview: true,
    scrollEnabled: true
  }
};

export default config;
