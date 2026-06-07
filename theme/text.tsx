import {
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from 'react-native';

import { defaultFontFamily, fontFamilyForWeight } from './typography';

function outfitFontStyle(style?: StyleProp<TextStyle>): TextStyle {
  const flat = StyleSheet.flatten(style);
  const explicit = flat?.fontFamily;

  if (explicit && !explicit.startsWith('Outfit')) {
    return {};
  }

  const family = explicit?.startsWith('Outfit')
    ? explicit
    : fontFamilyForWeight(flat?.fontWeight);

  return { fontFamily: family };
}

/** `<Text>` с Outfit по умолчанию; `fontWeight` в style мапится на нужное начертание. */
export function Text({ style, ...props }: TextProps) {
  return <RNText {...props} style={[style, outfitFontStyle(style)]} />;
}

/** `<TextInput>` с Outfit по умолчанию. */
export function TextInput({ style, ...props }: TextInputProps) {
  return <RNTextInput {...props} style={[{ fontFamily: defaultFontFamily }, style, outfitFontStyle(style)]} />;
}
