import type { UserRole } from '../navigation/types';

/** Стартовые значения формы регистрации (до подключения базы можно править здесь). */
export const registerPresetsByRole: Record<
  UserRole,
  {
    email: string;
    password: string;
    primaryLabel: string;
    primaryValue: string;
    secondaryLabel: string;
    secondaryValue: string;
  }
> = {
  developer: {
    email: 'alexey.dev@example.com',
    password: 'password123',
    primaryLabel: 'Имя и фамилия',
    primaryValue: 'Алексей Петров',
    secondaryLabel: 'Специализация',
    secondaryValue: 'React Native • 4 года',
  },
  employer: {
    email: 'hr@neuro-soft.example.com',
    password: 'password123',
    primaryLabel: 'Компания',
    primaryValue: 'НейроСофт',
    secondaryLabel: 'Контактное лицо',
    secondaryValue: 'Марина Ковалёва',
  },
};
