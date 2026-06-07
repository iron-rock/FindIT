/**
 * Канонические роли пользователя FindIT.
 *
 * Единый источник правды для всего приложения и базы данных.
 * Раньше в навигации использовались 'developer'/'employer' — теперь только эти:
 *   - finder    — соискатель / IT-специалист (смотрит вакансии)
 *   - recruiter — наниматель / компания (смотрит анкеты finder'ов)
 */
export type UserRole = 'finder' | 'recruiter';

export const USER_ROLES: readonly UserRole[] = ['finder', 'recruiter'] as const;

/** Человекочитаемые подписи роли для интерфейса. */
export const ROLE_LABELS: Record<UserRole, string> = {
  finder: 'Кандидат',
  recruiter: 'Работодатель',
};

export function isUserRole(value: unknown): value is UserRole {
  return value === 'finder' || value === 'recruiter';
}
