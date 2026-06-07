import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './locales/en';
import { ru } from './locales/ru';

export const SUPPORTED_LANGUAGES = ['ru', 'en'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const STORAGE_KEY = 'app.language';
export const DEFAULT_LANGUAGE: AppLanguage = 'en';

function isAppLanguage(value: unknown): value is AppLanguage {
  return value === 'ru' || value === 'en';
}

/** Язык устройства, приведённый к поддерживаемому (ru / en). */
function getDeviceLanguage(): AppLanguage {
  const code = getLocales()[0]?.languageCode?.toLowerCase();
  return isAppLanguage(code) ? code : DEFAULT_LANGUAGE;
}

const resources = {
  ru: { translation: ru },
  en: { translation: en },
};

/** Инициализация i18n: сохранённый выбор → язык устройства → дефолт. */
export async function initI18n(): Promise<typeof i18n> {
  let language = getDeviceLanguage();
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (isAppLanguage(saved)) {
      language = saved;
    }
  } catch {
    // AsyncStorage недоступен — используем язык устройства.
  }

  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      resources,
      lng: language,
      fallbackLng: DEFAULT_LANGUAGE,
      supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
      interpolation: { escapeValue: false },
      returnNull: false,
    });
  } else {
    await i18n.changeLanguage(language);
  }

  return i18n;
}

/** Переключает язык и запоминает выбор. */
export async function setAppLanguage(language: AppLanguage): Promise<void> {
  await i18n.changeLanguage(language);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Игнорируем ошибку записи — язык всё равно сменится в рамках сессии.
  }
}

/** Циклически меняет ru ⇄ en. */
export async function toggleAppLanguage(): Promise<AppLanguage> {
  const next: AppLanguage = i18n.language === 'ru' ? 'en' : 'ru';
  await setAppLanguage(next);
  return next;
}

export default i18n;
