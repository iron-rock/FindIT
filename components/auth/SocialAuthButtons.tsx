import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, Text } from '../../theme';

export type SocialProvider = 'google' | 'apple' | 'linkedin';

type SocialAuthButtonsProps = {
  onPress: (provider: SocialProvider) => void;
};

const PROVIDERS: {
  id: SocialProvider;
  icon: keyof typeof Ionicons.glyphMap;
  a11yKey: 'continueWithGoogle' | 'continueWithApple' | 'continueWithLinkedIn';
}[] = [
  { id: 'google', icon: 'logo-google', a11yKey: 'continueWithGoogle' },
  { id: 'apple', icon: 'logo-apple', a11yKey: 'continueWithApple' },
  { id: 'linkedin', icon: 'logo-linkedin', a11yKey: 'continueWithLinkedIn' },
];

/** Кнопки входа через провайдеров (Google / Apple / LinkedIn). */
export function SocialAuthButtons({ onPress }: SocialAuthButtonsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.buttonsRow}>
        {PROVIDERS.map((provider) => (
          <Pressable
            key={provider.id}
            accessibilityRole="button"
            accessibilityLabel={t(`auth.${provider.a11yKey}`)}
            onPress={() => onPress(provider.id)}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <Ionicons name={provider.icon} size={22} color={colors.textPrimary} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
  },
  dividerText: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: 'rgba(26, 43, 69, 0.7)',
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: colors.interactivePressed,
  },
});
