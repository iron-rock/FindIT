import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

export type WelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.headerBlock}>
          <Image
            accessibilityIgnoresInvertColors
            source={require('../assets/LogoFinal.png')}
            style={styles.heroLogo}
            resizeMode="contain"
            accessibilityLabel="FindIT"
          />
          <Text style={styles.brand}>FindIT</Text>
          <Text style={styles.tagline}>Находите IT‑таланты одним свайпом</Text>
          <Text style={styles.subcopy}>
            Кандидаты показывают резюме, работодатели — интерес к вам. Прозрачные отзывы после
            собеседований.
          </Text>
        </View>

        <View style={styles.actions}>
          <Text style={styles.actionsTitle}>Кто вы?</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Продолжить как разработчик"
            style={({ pressed }) => [styles.roleCard, pressed && styles.roleCardPressed]}
            onPress={() => navigation.navigate('Register', { role: 'developer' })}
          >
            <Text style={styles.roleTitle}>Я разработчик</Text>
            <Text style={styles.roleHint}>Ищу команду или проект</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Продолжить как работодатель"
            style={({ pressed }) => [styles.roleCard, pressed && styles.roleCardPressed]}
            onPress={() => navigation.navigate('Register', { role: 'employer' })}
          >
            <Text style={styles.roleTitle}>Я работодатель</Text>
            <Text style={styles.roleHint}>Нанимаю IT‑специалистов</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroLogo: {
    width: 200,
    height: 112,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  safe: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  headerBlock: {
    marginTop: 8,
    gap: 12,
  },
  brand: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 26,
    maxWidth: 320,
  },
  subcopy: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    maxWidth: 340,
  },
  actions: {
    marginBottom: 12,
    gap: 14,
  },
  actionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  roleCardPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  roleHint: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
