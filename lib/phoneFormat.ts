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

/** Форматирует ввод по мере набора (скобки, пробелы). */
export function formatPhoneInput(raw: string, country: PhoneCountryCode): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) {
    return '';
  }
  return new AsYouType(country).input(digits);
}

/** E.164 для Supabase Auth. */
export function toE164(display: string, country: PhoneCountryCode): string | null {
  const parsed = parsePhoneNumberFromString(display, country);
  if (!parsed?.isValid()) {
    return null;
  }
  return parsed.format('E.164');
}

export function isValidPhone(display: string, country: PhoneCountryCode): boolean {
  if (!display.trim()) {
    return false;
  }
  return isValidPhoneNumber(display, country);
}

/** Человекочитаемый формат для подсказки на шаге OTP. */
export function formatPhoneDisplay(display: string, country: PhoneCountryCode): string {
  const parsed = parsePhoneNumberFromString(display, country);
  if (parsed?.isValid()) {
    return parsed.formatInternational();
  }
  return display.trim();
}

export function isPhoneCountryCode(value: string): value is PhoneCountryCode {
  return getCountries().includes(value as PhoneCountryCode);
}
