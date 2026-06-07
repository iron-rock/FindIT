import type { Session, User } from '@supabase/supabase-js';

import { isUserRole, type UserRole } from './roles';
import { getSupabase } from './supabase';

export async function devSignIn(): Promise<Session> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase не настроен. Проверьте .env');
  }

  const email = process.env.EXPO_PUBLIC_DEV_AUTH_EMAIL?.trim();
  const password = process.env.EXPO_PUBLIC_DEV_AUTH_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error(
      'Добавьте EXPO_PUBLIC_DEV_AUTH_EMAIL и EXPO_PUBLIC_DEV_AUTH_PASSWORD в .env для быстрого входа',
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
  if (!data.session) {
    throw new Error('Сессия не получена');
  }
  return data.session;
}

export async function devSignOut(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase не настроен');
  }
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function setAccountRole(role: UserRole): Promise<User> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase не настроен');
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }
  if (!user) {
    throw new Error('Сначала войдите в аккаунт');
  }

  const { data, error } = await supabase.auth.updateUser({
    data: { role },
  });

  if (error) {
    throw error;
  }
  if (!data.user) {
    throw new Error('Не удалось обновить пользователя');
  }

  const { error: profileError } = await supabase.from('profiles').upsert(
    { id: data.user.id, role },
    { onConflict: 'id' },
  );

  if (profileError && __DEV__) {
    console.info('[FindIT] profiles upsert skipped:', profileError.message);
  }

  return data.user;
}

export function readAccountRole(user: User | null | undefined): UserRole | null {
  const metaRole = user?.user_metadata?.role;
  return isUserRole(metaRole) ? metaRole : null;
}
