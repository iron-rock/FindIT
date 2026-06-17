/**
 * Черновое сохранение данных регистрации в Supabase по шагам.
 * Ошибки не блокируют переход — только лог в dev (см. план).
 */
import type { RegisterFormState } from '../data/registerStepDefs';
import type { UserRole } from './roles';
import { getSupabase, isSupabaseConfigured } from './supabase';

function splitTags(value: string): string[] {
  return value
    .split(/[,;·]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseYears(value: string): number | null {
  const n = Number.parseInt(value.trim(), 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

async function getUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) {
    return null;
  }
  const supabase = getSupabase();
  if (!supabase) {
    return null;
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function saveRegisterStep(
  role: UserRole,
  stepId: string,
  form: RegisterFormState,
): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }
  const supabase = getSupabase();
  if (!supabase) {
    return;
  }

  const userId = await getUserId();
  if (!userId) {
    if (__DEV__) {
      console.info('[FindIT] saveRegisterStep skipped: no session');
    }
    return;
  }

  try {
    if (stepId === 'about' && role === 'finder') {
      if (form.email.trim()) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: form.email.trim(),
        });
        if (emailError && __DEV__) {
          console.info('[FindIT] updateUser email:', emailError.message);
        }
      }

      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: userId,
          role,
          display_name: form.fullName.trim() || null,
        },
        { onConflict: 'id' },
      );
      if (profileError && __DEV__) {
        console.info('[FindIT] profiles upsert:', profileError.message);
      }

      const years = parseYears(form.years);
      const { error: finderError } = await supabase.from('finder_profiles').upsert(
        {
          profile_id: userId,
          headline: form.headline.trim() || null,
          years_experience: years,
        },
        { onConflict: 'profile_id' },
      );
      if (finderError && __DEV__) {
        console.info('[FindIT] finder_profiles upsert:', finderError.message);
      }
      return;
    }

    if (stepId === 'company' && role === 'recruiter') {
      if (form.email.trim()) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: form.email.trim(),
        });
        if (emailError && __DEV__) {
          console.info('[FindIT] updateUser email:', emailError.message);
        }
      }

      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: userId,
          role,
          display_name: form.contact.trim() || null,
        },
        { onConflict: 'id' },
      );
      if (profileError && __DEV__) {
        console.info('[FindIT] profiles upsert:', profileError.message);
      }

      if (form.company.trim()) {
        const { data: existing } = await supabase
          .from('companies')
          .select('id')
          .eq('owner_id', userId)
          .limit(1)
          .maybeSingle();

        const companyPayload = {
          name: form.company.trim(),
          industry: form.industry.trim() || null,
          description: form.companyLink.trim() || null,
        };

        if (existing?.id) {
          const { error } = await supabase
            .from('companies')
            .update(companyPayload)
            .eq('id', existing.id);
          if (error && __DEV__) {
            console.info('[FindIT] companies update:', error.message);
          }
        } else {
          const { error } = await supabase.from('companies').insert({
            owner_id: userId,
            ...companyPayload,
          });
          if (error && __DEV__) {
            console.info('[FindIT] companies insert:', error.message);
          }
        }
      }
      return;
    }

    if (role !== 'finder') {
      return;
    }

    const { data: finderRow } = await supabase
      .from('finder_profiles')
      .select('id')
      .eq('profile_id', userId)
      .maybeSingle();

    if (!finderRow?.id) {
      if (__DEV__) {
        console.info('[FindIT] saveRegisterStep skipped: no finder_profiles row');
      }
      return;
    }

    const finderId = finderRow.id;

    if (stepId === 'stack') {
      const { error } = await supabase
        .from('finder_profiles')
        .update({
          stack: splitTags(form.stack),
          salary_expectation: form.salary.trim() || null,
          location_format: form.workFormat.trim() || null,
        })
        .eq('id', finderId);
      if (error && __DEV__) {
        console.info('[FindIT] finder_profiles stack update:', error.message);
      }
      return;
    }

    if (stepId === 'ai') {
      const { error } = await supabase
        .from('finder_profiles')
        .update({ about: form.aiTools.trim() || null })
        .eq('id', finderId);
      if (error && __DEV__) {
        console.info('[FindIT] finder_profiles ai update:', error.message);
      }
      return;
    }

    if (stepId === 'vcs' && form.github.trim()) {
      const username = form.github.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, '');
      const { error } = await supabase.from('vcs_accounts').upsert(
        {
          finder_id: finderId,
          provider: 'github',
          username,
          profile_url: form.github.trim(),
        },
        { onConflict: 'finder_id,provider' },
      );
      if (error && __DEV__) {
        console.info('[FindIT] vcs_accounts upsert:', error.message);
      }
    }
  } catch (error) {
    if (__DEV__) {
      console.info('[FindIT] saveRegisterStep error:', error);
    }
  }
}

export async function saveRegisterFinal(
  role: UserRole,
  form: RegisterFormState,
): Promise<void> {
  const steps =
    role === 'finder'
      ? ['about', 'stack', 'ai', 'vcs']
      : ['company'];
  for (const stepId of steps) {
    await saveRegisterStep(role, stepId, form);
  }
}
