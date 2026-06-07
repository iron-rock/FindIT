import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useMainSession } from '../navigation/MainSessionContext';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors, Text } from '../theme';

export type ProfileScreenProps = BottomTabScreenProps<MainTabParamList, 'Profile'>;

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { t } = useTranslation();
  const { role, greetingTitle, greetingSubtitle } = useMainSession();
  const roleLabel = t(`roles.${role}`);

  const signOut = () => {
    const parent = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
    parent?.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{t('profile.title')}</Text>
      <Text style={styles.subtitle}>{greetingSubtitle}</Text>

      <View style={styles.card}>
        <Text style={styles.badge}>{roleLabel}</Text>
        <Text style={styles.primary}>{greetingTitle}</Text>
        <Text style={styles.secondary}>{t('profile.cardHint')}</Text>
      </View>

      <Pressable accessibilityRole="button" style={({ pressed }) => [styles.outline, pressed && styles.outlinePressed]} onPress={signOut}>
        <Text style={styles.outlineLabel}>{t('common.signOut')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 140,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 18,
    lineHeight: 22,
    maxWidth: 360,
  },
  card: {
    gap: 10,
    borderRadius: 18,
    padding: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 28,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textMuted,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  primary: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  secondary: {
    marginTop: 4,
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
  outline: {
    alignSelf: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceMuted,
  },
  outlinePressed: {
    opacity: 0.9,
    backgroundColor: colors.surface,
  },
  outlineLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
