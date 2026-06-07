import { useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { SocialAuthButtons } from '../components/auth/SocialAuthButtons';
import { StepDots } from '../components/auth/StepDots';
import { ConstellationBackground } from '../components/background/ConstellationBackground';
import { LanguageToggle } from '../components/i18n/LanguageToggle';
import { BackLink } from '../components/navigation/BackLink';
import { registerPresetsByRole } from '../data/registerPresets';
import {
  EMPTY_REGISTER_FORM,
  REGISTER_STEPS_BY_ROLE,
  type RegisterFieldDef,
  type RegisterFieldKey,
  type RegisterFormState,
} from '../data/registerStepDefs';
import type { RootStackParamList, UserRole } from '../navigation/types';
import { colors, Text, TextInput } from '../theme';

export type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation, route }: RegisterScreenProps) {
  const { role, mode = 'register' } = route.params;

  if (mode === 'login') {
    return <LoginView navigation={navigation} role={role} />;
  }

  return <RegisterWizard navigation={navigation} role={role} />;
}

type ViewProps = {
  navigation: RegisterScreenProps['navigation'];
  role: UserRole;
};

function RegisterWizard({ navigation, role }: ViewProps) {
  const { t } = useTranslation();
  const preset = registerPresetsByRole[role];
  const steps = REGISTER_STEPS_BY_ROLE[role];

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<RegisterFormState>({
    ...EMPTY_REGISTER_FORM,
    email: preset.email,
    password: preset.password,
  });
  const [focused, setFocused] = useState<RegisterFieldKey | null>(null);

  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentShift = useRef(new Animated.Value(0)).current;

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  const setField = (key: RegisterFieldKey, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const complete = () => {
    const name = role === 'finder' ? form.fullName.trim() : form.company.trim();
    const fallback = t(`roles.${role}`);
    const subtitleParts = [
      role === 'finder' ? form.headline.trim() : form.industry.trim(),
      form.email.trim(),
    ].filter(Boolean);

    navigation.replace('Main', {
      role,
      greetingTitle:
        role === 'finder'
          ? t('profile.greeting', { name: name || fallback })
          : name || fallback,
      greetingSubtitle: subtitleParts.join(' · ') || fallback,
    });
  };

  const animateTo = (next: number) => {
    const direction = next > stepIndex ? 1 : -1;
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(contentShift, { toValue: direction * -20, duration: 140, useNativeDriver: true }),
    ]).start(() => {
      setStepIndex(next);
      setFocused(null);
      contentShift.setValue(direction * 20);
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(contentShift, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  };

  const goNext = () => {
    if (isLast) {
      complete();
    } else {
      animateTo(stepIndex + 1);
    }
  };

  const goBack = () => {
    if (stepIndex === 0) {
      navigation.goBack();
    } else {
      animateTo(stepIndex - 1);
    }
  };

  return (
    <AuthShell>
      <BackLink label={t('common.back')} onPress={goBack} />

      <View style={styles.progress}>
        <StepDots count={steps.length} current={stepIndex} />
        <Text style={styles.stepCounter}>
          {t('auth.stepOf', { current: stepIndex + 1, total: steps.length })}
        </Text>
      </View>

      <Animated.View
        style={{
          opacity: contentOpacity,
          transform: [{ translateX: contentShift }],
        }}
      >
        <Text style={styles.heading}>{t(step.titleKey)}</Text>
        <Text style={styles.helper}>{t(step.hintKey)}</Text>

        <View style={styles.form}>
          {step.fields.map((field) => (
            <FormField
              key={field.key}
              field={field}
              value={form[field.key]}
              focused={focused === field.key}
              onChangeText={(text) => setField(field.key, text)}
              onFocus={() => setFocused(field.key)}
              onBlur={() => setFocused(null)}
            />
          ))}
        </View>

        {step.social ? (
          <View style={styles.socialBlock}>
            <SocialAuthButtons onPress={() => complete()} />
          </View>
        ) : null}
      </Animated.View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isLast ? t('auth.finish') : t('auth.next')}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        onPress={goNext}
      >
        <Text style={styles.ctaText}>{isLast ? t('auth.finish') : t('auth.next')}</Text>
      </Pressable>

      {step.skippable ? (
        <Pressable accessibilityRole="button" onPress={goNext} style={styles.subtleLink}>
          <Text style={styles.subtleLinkText}>{t('auth.skip')}</Text>
        </Pressable>
      ) : null}

      {stepIndex === 0 ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.replace('Register', { role, mode: 'login' })}
          style={styles.subtleLink}
        >
          <Text style={styles.switchLinkText}>{t('auth.switchToLogin')}</Text>
        </Pressable>
      ) : null}

      <View style={styles.langToggleWrap}>
        <LanguageToggle />
      </View>
    </AuthShell>
  );
}

function LoginView({ navigation, role }: ViewProps) {
  const { t } = useTranslation();
  const preset = registerPresetsByRole[role];

  const [email, setEmail] = useState(preset.email);
  const [password, setPassword] = useState(preset.password);
  const [focused, setFocused] = useState<RegisterFieldKey | null>(null);

  const complete = () => {
    navigation.replace('Main', {
      role,
      greetingTitle:
        role === 'finder'
          ? t('profile.greeting', { name: t('roles.finder') })
          : t('roles.recruiter'),
      greetingSubtitle: email.trim() || t(`roles.${role}`),
    });
  };

  const emailField: RegisterFieldDef = {
    key: 'email',
    labelKey: 'auth.email',
    placeholderKey: 'auth.emailPlaceholder',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
  };

  const passwordField: RegisterFieldDef = {
    key: 'password',
    labelKey: 'auth.password',
    placeholderKey: 'auth.passwordPlaceholder',
    secure: true,
    autoCapitalize: 'none',
  };

  return (
    <AuthShell>
      <BackLink label={t('common.back')} onPress={() => navigation.goBack()} />

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{t(`roles.${role}`)}</Text>
      </View>

      <Text style={styles.heading}>{t('auth.welcomeBack')}</Text>
      <Text style={styles.helper}>{t('auth.loginHelper')}</Text>

      <View style={styles.form}>
        <FormField
          field={emailField}
          value={email}
          focused={focused === 'email'}
          onChangeText={setEmail}
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(null)}
        />
        <FormField
          field={passwordField}
          value={password}
          focused={focused === 'password'}
          onChangeText={setPassword}
          onFocus={() => setFocused('password')}
          onBlur={() => setFocused(null)}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('auth.signInA11y')}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        onPress={complete}
      >
        <Text style={styles.ctaText}>{t('auth.signInCta')}</Text>
      </Pressable>

      <View style={styles.socialBlock}>
        <SocialAuthButtons onPress={() => complete()} />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.replace('Register', { role, mode: 'register' })}
        style={styles.subtleLink}
      >
        <Text style={styles.switchLinkText}>{t('auth.switchToRegister')}</Text>
      </Pressable>

      <View style={styles.langToggleWrap}>
        <LanguageToggle />
      </View>
    </AuthShell>
  );
}

type AuthShellProps = {
  children: ReactNode;
};

function AuthShell({ children }: AuthShellProps) {
  return (
    <View style={styles.root}>
      <ConstellationBackground />
      <View style={styles.scrim} pointerEvents="none" />

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

type FormFieldProps = {
  field: RegisterFieldDef;
  value: string;
  focused: boolean;
  onChangeText: (text: string) => void;
  onFocus: () => void;
  onBlur: () => void;
};

function FormField({ field, value, focused, onChangeText, onFocus, onBlur }: FormFieldProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{t(field.labelKey)}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        secureTextEntry={field.secure}
        multiline={field.multiline}
        keyboardType={field.keyboardType ?? 'default'}
        autoCapitalize={field.autoCapitalize ?? 'sentences'}
        autoCorrect={!field.secure}
        placeholder={t(field.placeholderKey)}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          field.multiline && styles.inputMultiline,
          focused && styles.inputFocused,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 22, 48, 0.45)',
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  progress: {
    marginTop: 10,
    marginBottom: 26,
    gap: 12,
  },
  stepCounter: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(94, 184, 232, 0.14)',
    borderWidth: 1,
    borderColor: colors.accent,
    marginTop: 8,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.accentBright,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  helper: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 21,
    marginBottom: 24,
    maxWidth: 340,
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
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
    backgroundColor: 'rgba(26, 43, 69, 0.7)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 15 : 12,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  inputFocused: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  socialBlock: {
    marginTop: 24,
  },
  cta: {
    marginTop: 26,
    backgroundColor: colors.interactive,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
    shadowColor: '#000814',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 6,
  },
  ctaPressed: {
    backgroundColor: colors.interactivePressed,
    transform: [{ scale: 0.99 }],
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtleLink: {
    marginTop: 16,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  subtleLinkText: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '600',
  },
  switchLinkText: {
    fontSize: 15,
    color: colors.accentBright,
    fontWeight: '600',
  },
  langToggleWrap: {
    alignItems: 'flex-end',
    paddingHorizontal: 4,
    marginTop: 24,
    marginBottom: 8,
  },
});
