import * as Sentry from '@sentry/react-native';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim() ?? '';
const enabled = dsn.length > 0;

Sentry.init({
  dsn: enabled ? dsn : undefined,
  enabled,
  debug: false,
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  enableNativeNagger: false,
});
