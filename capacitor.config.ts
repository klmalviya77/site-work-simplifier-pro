
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.97620aff223043469488d475a57f52f4',
  appName: 'site-work-simplifier-pro',
  webDir: 'dist',
  server: {
    url: 'https://97620aff-2230-4346-9488-d475a57f52f4.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    }
  }
};

export default config;
