import type { TranslationResources } from './locales/en';

/** Все dot-ключи словаря перевода (например `auth.email`). */
type FlattenKeys<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? Prefix extends ''
      ? K
      : `${Prefix}.${K}`
    : FlattenKeys<T[K], Prefix extends '' ? K : `${Prefix}.${K}`>;
}[keyof T & string];

export type I18nKey = FlattenKeys<TranslationResources>;
