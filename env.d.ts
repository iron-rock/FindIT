declare module '*.webm' {
  const source: number;
  export default source;
}

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_SUPABASE_URL?: string;
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
    /** @deprecated legacy anon JWT; use EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY */
    EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
    EXPO_PUBLIC_DEV_AUTH_EMAIL?: string;
    EXPO_PUBLIC_DEV_AUTH_PASSWORD?: string;
    EXPO_PUBLIC_SENTRY_DSN?: string;
    SENTRY_AUTH_TOKEN?: string;
    SENTRY_ORG?: string;
    SENTRY_PROJECT?: string;
    SENTRY_URL?: string;
  }
}
