import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { colors, font, Text, TextInput } from '../../theme';
import {
  outlineRadius,
  outlineSurface,
  welcomeOutlineBorderFocused,
} from '../../theme/surface';

type ProfileTextFieldProps = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  /** Фиксированный префикс внутри поля (например `$`). */
  prefix?: string;
};

/** Компактный инпут профиля: focus — белая рамка, как у регистрации. */
export function ProfileTextField({
  label,
  value,
  onChangeText,
  placeholder = '…',
  multiline = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  prefix,
}: ProfileTextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.group}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          outlineSurface(outlineRadius),
          focused && welcomeOutlineBorderFocused,
          Boolean(prefix) && styles.row,
        ]}
      >
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.45)"
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={[
            styles.input,
            Boolean(prefix) && styles.inputWithPrefix,
            multiline && styles.multiline,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    letterSpacing: 0.3,
    ...font('500'),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefix: {
    paddingLeft: 12,
    fontSize: 15,
    color: colors.textPrimary,
    ...font('500'),
  },
  input: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
    color: colors.textPrimary,
    ...font('400'),
  },
  inputWithPrefix: {
    flex: 1,
    paddingLeft: 4,
  },
  multiline: {
    minHeight: 72,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
});
