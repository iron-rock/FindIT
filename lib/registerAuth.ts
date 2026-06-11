/**
 * Supabase Phone Auth для регистрации и входа.
 *
 * Prerequisite: Supabase Dashboard → Authentication → Providers → Phone включён,
 * SMS-провайдер (Twilio и т.п.) настроен — иначе OTP не придёт.
 */
import type { UserRole } from './roles';
import { getSupabase, isSupabaseConfigured } from './supabase';

export class RegisterAuthError extends Error {
  readonly code: 'supabaseNotConfigured' | 'authFailed';

  constructor(code: RegisterAuthError['code'], message?: string) {
    super(message ?? code);
    this.name = 'RegisterAuthError';
    this.code = code;
  }
}

function requireSupabase() {
  if (!isSupabaseConfigured) {
    throw new RegisterAuthError('supabaseNotConfigured');
  }
  const supabase = getSupabase();
  if (!supabase) {
    throw new RegisterAuthError('supabaseNotConfigured');
  }
  return supabase;
}

export async function sendPhoneOtp(e164: string): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
  if (error) {
    throw new RegisterAuthError('authFailed', error.message);
  }
}

export async function verifyPhoneOtp(e164: string, token: string): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.auth.verifyOtp({
    phone: e164,
    token,
    type: 'sms',
  });
  if (error) {
    throw new RegisterAuthError('authFailed', error.message);
  }
}

export async function finalizePhoneSignup({
  password,
  role,
}: {
  password: string;
  role: UserRole;
}): Promise<void> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.updateUser({
    password,
    data: { role },
  });
  if (error) {
    throw new RegisterAuthError('authFailed', error.message);
  }
  if (!data.user) {
    throw new RegisterAuthError('authFailed');
  }

  const { error: profileError } = await supabase.from('profiles').upsert(
    { id: data.user.id, role },
    { onConflict: 'id' },
  );
  if (profileError && __DEV__) {
    console.info('[FindIT] profiles upsert skipped:', profileError.message);
  }
}

export async function signInWithPhonePassword(e164: string, password: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    phone: e164,
    password,
  });
  if (error) {
    throw new RegisterAuthError('authFailed', error.message);
  }
  if (!data.session) {
    throw new RegisterAuthError('authFailed');
  }
  return data.session;
}
