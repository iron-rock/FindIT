import {
  AsYouType,
  type CountryCode,
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';

export type PhoneCountryCode = CountryCode;

/** Популярные страны в начале списка селектора. */
const PRIORITY_COUNTRIES: PhoneCountryCode[] = ['RU', 'KZ', 'BY', 'UA', 'US', 'GB', 'DE', 'TR'];

export type PhoneCountryOption = {
  code: PhoneCountryCode;
  dialCode: string;
  label: string;
};

export function getPhoneCountryOptions(): PhoneCountryOption[] {
  const all = getCountries();
  const ordered = [
    ...PRIORITY_COUNTRIES.filter((c) => all.includes(c)),
    ...all.filter((c) => !PRIORITY_COUNTRIES.includes(c)).sort(),
  ];

  return ordered.map((code) => ({
    code,
    dialCode: `+${getCountryCallingCode(code)}`,
    label: `${code} (+${getCountryCallingCode(code)})`,
  }));
}

export function getDefaultPhoneCountry(): PhoneCountryCode {
  return 'RU';
}

/** Emoji-флаг по ISO-коду страны (RU → 🇷🇺). */
export function countryCodeToFlag(code: PhoneCountryCode): string {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

/** Максимум цифр в E.164 (без «+»). */
const MAX_INTERNATIONAL_DIGITS = 15;

/** Верхняя граница длины отформатированной строки в TextInput. */
export const PHONE_INPUT_DISPLAY_MAX_LENGTH = 24;

/** Форматирует полный международный номер по мере набора (+7 912 …). */
export function formatInternationalPhoneInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return '';
  }
  if (trimmed === '+') {
    return '+';
  }

  const digits = raw.replace(/\D/g, '').slice(0, MAX_INTERNATIONAL_DIGITS);
  if (!digits) {
    return trimmed.includes('+') ? '+' : '';
  }

  return formatInternationalDigits(digits);
}

/**
 * AsYouType + лимит: после первого валидного номера лишние цифры отбрасываются.
 * До валидного — набор до 15 цифр E.164.
 */
function formatInternationalDigits(digits: string): string {
  let formatted = new AsYouType().input(`+${digits.charAt(0)}`);
  let lastValidLength = 0;

  for (let len = 2; len <= digits.length; len += 1) {
    const formatter = new AsYouType();
    const candidate = formatter.input(`+${digits.slice(0, len)}`);
    const number = formatter.getNumber();

    if (number?.isValid()) {
      lastValidLength = len;
      formatted = candidate;
      continue;
    }

    if (lastValidLength > 0) {
      break;
    }

    formatted = candidate;
  }

  return formatted;
}

/** Определяет страну по префиксу (+77… → KZ, +79… → RU и т.д.). */
export function detectPhoneCountry(display: string): PhoneCountryCode | null {
  const digits = display.replace(/\D/g, '');
  if (digits.length < 2) {
    return null;
  }

  const formatter = new AsYouType();
  formatter.input(`+${digits}`);
  const fromFormatter = formatter.getCountry();
  if (fromFormatter) {
    return fromFormatter;
  }

  return parsePhoneNumberFromString(`+${digits}`)?.country ?? null;
}

/** @deprecated Используйте formatInternationalPhoneInput для свободного ввода. */
export function formatPhoneInput(raw: string, country: PhoneCountryCode): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) {
    return '';
  }
  return new AsYouType(country).input(digits);
}

function parseInternational(display: string, fallbackCountry?: PhoneCountryCode) {
  const digits = display.replace(/\D/g, '');
  if (!digits) {
    return undefined;
  }

  const international = parsePhoneNumberFromString(`+${digits}`);
  if (international) {
    return international;
  }

  if (fallbackCountry) {
    return parsePhoneNumberFromString(display, fallbackCountry);
  }

  return undefined;
}

/** E.164 для Supabase Auth. */
export function toE164(display: string, country?: PhoneCountryCode): string | null {
  const parsed = parseInternational(display, country);
  if (!parsed?.isValid()) {
    return null;
  }
  return parsed.format('E.164');
}

export function isValidPhone(display: string, country?: PhoneCountryCode): boolean {
  if (!display.trim()) {
    return false;
  }

  const parsed = parseInternational(display, country);
  if (parsed) {
    return parsed.isValid();
  }

  return country ? isValidPhoneNumber(display, country) : false;
}

/** Человекочитаемый формат для подсказки на шаге OTP. */
export function formatPhoneDisplay(display: string, country?: PhoneCountryCode): string {
  const parsed = parseInternational(display, country);
  if (parsed?.isValid()) {
    return parsed.formatInternational();
  }
  return display.trim();
}

export function isPhoneCountryCode(value: string): value is PhoneCountryCode {
  return getCountries().includes(value as PhoneCountryCode);
}
