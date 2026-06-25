import type { TextStyle } from 'react-native';

/** Playfair Display — wordmark на Welcome. */
export const playfairFontFamily = {
  semiBold: 'PlayfairDisplay_600SemiBold',
  semiBoldItalic: 'PlayfairDisplay_600SemiBold_Italic',
} as const;

/** Имена файлов шрифта Outfit после загрузки через expo-font. */
export const fontFamily = {
  thin: 'Outfit_100Thin',
  extraLight: 'Outfit_200ExtraLight',
  light: 'Outfit_300Light',
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semiBold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
  extraBold: 'Outfit_800ExtraBold',
  black: 'Outfit_900Black',
} as const;

export type FontFamilyName = (typeof fontFamily)[keyof typeof fontFamily];

/** Шрифт по умолчанию для всего приложения. */
export const defaultFontFamily = fontFamily.regular;

/** Сопоставляет `fontWeight` из StyleSheet с нужным файлом Outfit. */
export function fontFamilyForWeight(weight?: TextStyle['fontWeight']): FontFamilyName {
  if (weight === undefined || weight === 'normal') {
    return fontFamily.regular;
  }
  if (weight === 'bold') {
    return fontFamily.bold;
  }

  const numeric = typeof weight === 'number' ? weight : Number.parseInt(String(weight), 10);
  if (Number.isNaN(numeric)) {
    return fontFamily.regular;
  }

  if (numeric <= 100) return fontFamily.thin;
  if (numeric <= 200) return fontFamily.extraLight;
  if (numeric <= 300) return fontFamily.light;
  if (numeric <= 400) return fontFamily.regular;
  if (numeric <= 500) return fontFamily.medium;
  if (numeric <= 600) return fontFamily.semiBold;
  if (numeric <= 700) return fontFamily.bold;
  if (numeric <= 800) return fontFamily.extraBold;
  return fontFamily.black;
}

/** Хелпер для StyleSheet: `{ fontFamily: 'Outfit_…' }` по весу. */
export function font(weight?: TextStyle['fontWeight']): Pick<TextStyle, 'fontFamily'> {
  return { fontFamily: fontFamilyForWeight(weight) };
}
