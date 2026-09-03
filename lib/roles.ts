/**
 * Роли пользователя FindIT — единственный источник правды для кода и БД.
 *
 * Других ролей нет. Значения совпадают с Postgres enum `user_role`.
 *   - finder    — соискатель / IT-специалист (смотрит вакансии)
 *   - recruiter — наниматель / компания (смотрит анкеты finder'ов)
 */
export type UserRole = 'finder' | 'recruiter';

export const USER_ROLES: readonly UserRole[] = ['finder', 'recruiter'] as const;

/** Короткие подписи роли (UI-копия — в i18n `roles.*`). */
export const ROLE_LABELS: Record<UserRole, string> = {
  finder: 'Finder',
  recruiter: 'Recruiter',
};

export function isUserRole(value: unknown): value is UserRole {
  return value === 'finder' || value === 'recruiter';
}
