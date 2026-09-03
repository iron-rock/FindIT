import type { I18nKey } from './i18n/types';

/** Форматы работы finder'а (мультивыбор). */
export type WorkFormat = 'online' | 'hybrid' | 'offline';

export const WORK_FORMATS: readonly WorkFormat[] = [
  'online',
  'hybrid',
  'offline',
] as const;

export const WORK_FORMAT_LABEL_KEY: Record<WorkFormat, I18nKey> = {
  online: 'profile.workFormatOnline',
  hybrid: 'profile.workFormatHybrid',
  offline: 'profile.workFormatOffline',
};

export function isWorkFormat(value: string): value is WorkFormat {
  return (WORK_FORMATS as readonly string[]).includes(value);
}

export function toggleWorkFormat(
  selected: WorkFormat[],
  id: WorkFormat,
): WorkFormat[] {
  if (selected.includes(id)) {
    return selected.filter((item) => item !== id);
  }
  return WORK_FORMATS.filter(
    (item) => item === id || selected.includes(item),
  );
}
