import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

type SupabaseEnv = {
  url: string;
  publishableKey: string;
};

function resolveSupabaseEnv(): SupabaseEnv {
  let url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
  let publishableKey =
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    '';

  if (url.startsWith('sb_publishable_')) {
    publishableKey = publishableKey || url;
    url = '';
  }

  if (publishableKey.startsWith('sb_secret_')) {
    if (__DEV__) {
      console.warn(
        '[FindIT] sb_secret_ нельзя использовать в клиенте. Укажите publishable key в EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
      );
    }
    publishableKey = '';
  }

  return { url, publishableKey };
}

const { url: supabaseUrl, publishableKey: supabasePublishableKey } = resolveSupabaseEnv();

export const isSupabaseConfigured =
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('supabase') &&
  supabasePublishableKey.length > 0 &&
  !supabasePublishableKey.startsWith('sb_secret_');

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!client) {
    client = createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
