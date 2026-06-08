import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../../theme';
import { GlassSurface } from '../ui/GlassSurface';

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
      <View style={styles.buttonsRow}>
        {PROVIDERS.map((provider) => (
          <Pressable
            key={provider.id}
            accessibilityRole="button"
            accessibilityLabel={t(`auth.${provider.a11yKey}`)}
            onPress={() => onPress(provider.id)}
          >
            {({ pressed }) => (
              <GlassSurface
                pressed={pressed}
                radius={12}
                style={styles.button}
              >
                <Ionicons name={provider.icon} size={18} color={colors.textPrimary} />
              </GlassSurface>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
