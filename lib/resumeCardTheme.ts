/**
 * Path A: библиотека тем карточки резюме в свайпе.
 * JSON-схема — заготовка под будущий конструктор / импорт без eval.
 */

import type { I18nKey } from './i18n/types';

export type ResumeCardSlot =
  | 'avatar'
  | 'name'
  | 'position'
  | 'aiModels'
  | 'stack'
  | 'salary'
  | 'workFormat'
  | 'experience'
  | 'git';

export type ResumeCardThemeId = 'classic' | 'ai-first' | 'stack-first';

/** Декларативное описание темы (можно сериализовать в JSON). */
export type ResumeCardThemeConfig = {
  id: ResumeCardThemeId;
  nameKey: I18nKey;
  slots: ResumeCardSlot[];
  radius?: number;
};

export const RESUME_CARD_THEMES: ResumeCardThemeConfig[] = [
  {
    id: 'classic',
    nameKey: 'profile.cardTheme.classic',
    slots: ['avatar', 'name', 'position', 'stack', 'salary', 'workFormat'],
    radius: 14,
  },
  {
    id: 'ai-first',
    nameKey: 'profile.cardTheme.aiFirst',
    slots: ['avatar', 'name', 'position', 'aiModels', 'stack'],
    radius: 14,
  },
  {
    id: 'stack-first',
    nameKey: 'profile.cardTheme.stackFirst',
    slots: ['name', 'position', 'stack', 'salary'],
    radius: 14,
  },
];

export const DEFAULT_RESUME_CARD_THEME_ID: ResumeCardThemeId = 'classic';

export function getResumeCardTheme(
  id: string | undefined,
): ResumeCardThemeConfig {
  return (
    RESUME_CARD_THEMES.find((t) => t.id === id) ??
    RESUME_CARD_THEMES.find((t) => t.id === DEFAULT_RESUME_CARD_THEME_ID)!
  );
}

/** Парсит JSON-конфиг темы; при ошибке — null. Заготовка под Path B. */
export function parseResumeCardThemeJson(
  raw: string,
): ResumeCardThemeConfig | null {
  try {
    const parsed = JSON.parse(raw) as Partial<ResumeCardThemeConfig>;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    if (
      parsed.id !== 'classic' &&
      parsed.id !== 'ai-first' &&
      parsed.id !== 'stack-first'
    ) {
      return null;
    }
    if (!Array.isArray(parsed.slots) || parsed.slots.length === 0) {
      return null;
    }
    const allowed: ResumeCardSlot[] = [
      'avatar',
      'name',
      'position',
      'aiModels',
      'stack',
      'salary',
      'workFormat',
      'experience',
      'git',
    ];
    const slots = parsed.slots.filter((s): s is ResumeCardSlot =>
      allowed.includes(s as ResumeCardSlot),
    );
    if (slots.length === 0) {
      return null;
    }
    const nameKey: I18nKey =
      parsed.id === 'ai-first'
        ? 'profile.cardTheme.aiFirst'
        : parsed.id === 'stack-first'
          ? 'profile.cardTheme.stackFirst'
          : 'profile.cardTheme.classic';
    return {
      id: parsed.id,
      nameKey,
      slots,
      radius: typeof parsed.radius === 'number' ? parsed.radius : 14,
    };
  } catch {
    return null;
  }
}
