import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { registerPresetsByRole } from '../data/registerPresets';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

export type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation, route }: RegisterScreenProps) {
  const { role } = route.params;
  const preset = registerPresetsByRole[role];

  const [email, setEmail] = useState(preset.email);
  const [password, setPassword] = useState(preset.password);
  const [primary, setPrimary] = useState(preset.primaryValue);
  const [secondary, setSecondary] = useState(preset.secondaryValue);

  const heading = useMemo(
    () => (role === 'developer' ? 'Регистрация разработчика' : 'Регистрация работодателя'),
    [role],
  );

  const onSubmit = () => {
    navigation.replace('Main', {
      role,
      greetingTitle:
        role === 'developer' ? `Привет, ${primary.trim()}!` : primary.trim(),
      greetingSubtitle:
        role === 'developer'
          ? `${secondary.trim()} · ${email.trim()}`
          : `${secondary.trim()} · ${email.trim()}`,
    });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heading}>{heading}</Text>
          <Text style={styles.helper}>
            Поля заполнены — после подключения базы здесь будет настоящая регистрация.
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@company.com"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Пароль</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{preset.primaryLabel}</Text>
            <TextInput
              value={primary}
              onChangeText={setPrimary}
              placeholder={preset.primaryValue}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{preset.secondaryLabel}</Text>
            <TextInput
              value={secondary}
              onChangeText={setSecondary}
              placeholder={preset.secondaryValue}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Продолжить в приложение"
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            onPress={onSubmit}
          >
            <Text style={styles.ctaText}>Продолжить</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={styles.backLink}
          >
            <Text style={styles.backLinkText}>Выбрать другую роль</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 4,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  helper: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 16,
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  cta: {
    marginTop: 12,
    backgroundColor: colors.interactive,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  ctaPressed: {
    backgroundColor: colors.interactivePressed,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  backLink: {
    marginTop: 18,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backLinkText: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '500',
  },
});
