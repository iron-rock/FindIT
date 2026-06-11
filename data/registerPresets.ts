import type { UserRole } from '../navigation/types';

/** Стартовые значения формы регистрации (до подключения базы можно править здесь). */
export const registerPresetsByRole: Record<
  UserRole,
  {
    phone: string;
    phoneCountry: string;
    password: string;
    primaryLabel: string;
    primaryValue: string;
    secondaryLabel: string;
    secondaryValue: string;
  }
> = {
  finder: {
    phone: '900 123-45-67',
    phoneCountry: 'RU',
    password: 'password123',
    primaryLabel: 'Имя и фамилия',
    primaryValue: 'Алексей Петров',
    secondaryLabel: 'Специализация',
    secondaryValue: 'React Native • 4 года',
  },
  recruiter: {
    phone: '900 987-65-43',
    phoneCountry: 'RU',
    password: 'password123',
    primaryLabel: 'Компания',
    primaryValue: 'НейроСофт',
    secondaryLabel: 'Контактное лицо',
    secondaryValue: 'Марина Ковалёва',
  },
};
