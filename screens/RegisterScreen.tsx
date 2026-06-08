import { useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
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

import { RoleToggle } from '../components/auth/RoleToggle';
import { SocialAuthButtons } from '../components/auth/SocialAuthButtons';
import { StepDots } from '../components/auth/StepDots';
import { ConstellationBackground } from '../components/background/ConstellationBackground';
import { BackLink } from '../components/navigation/BackLink';
import {
  GlassSurface,
  glassButtonRadius,
  glassInputRadius,
} from '../components/ui/GlassSurface';
import { registerPresetsByRole } from '../data/registerPresets';
import {
  EMPTY_REGISTER_FORM,
  REGISTER_STEPS_BY_ROLE,
  type RegisterFieldDef,
  type RegisterFieldKey,
  type RegisterFormState,
  type RegisterStepDef,
} from '../data/registerStepDefs';
import type { RootStackParamList, UserRole } from '../navigation/types';
import { colors, font, Text, TextInput } from '../theme';

export type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation, route }: RegisterScreenProps) {
  const { role, mode = 'register' } = route.params;

  if (mode === 'login') {
    return <LoginView navigation={navigation} role={role ?? 'finder'} />;
  }

  return <RegisterWizard navigation={navigation} initialRole={role ?? null} />;
}

type ViewProps = {
  navigation: RegisterScreenProps['navigation'];
  role: UserRole;
};

type WizardProps = {
  navigation: RegisterScreenProps['navigation'];
  initialRole: UserRole | null;
};

function RegisterWizard({ navigation, initialRole }: WizardProps) {
  const { t } = useTranslation();

  const [role, setRole] = useState<UserRole | null>(initialRole);
  // stepIndex 0 — выбор роли; 1..N — шаги выбранной роли.
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<RegisterFormState>(() => {
    if (!initialRole) {
      return { ...EMPTY_REGISTER_FORM };
    }
    const preset = registerPresetsByRole[initialRole];
    return { ...EMPTY_REGISTER_FORM, email: preset.email, password: preset.password };
  });
  const [focused, setFocused] = useState<RegisterFieldKey | null>(null);

  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentShift = useRef(new Animated.Value(0)).current;
  // Появление индикатора шагов после выбора роли (ease-in-out).
  const progressAnim = useRef(new Animated.Value(initialRole ? 1 : 0)).current;

  const formSteps = role ? REGISTER_STEPS_BY_ROLE[role] : [];
  const isRoleStep = stepIndex === 0;
  const currentStep = isRoleStep ? null : formSteps[stepIndex - 1];
  const isLast = !isRoleStep && stepIndex - 1 === formSteps.length - 1;

  const setField = (key: RegisterFieldKey, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const chooseRole = (next: UserRole) => {
    const preset = registerPresetsByRole[next];
    setForm((prev) => ({
      ...prev,
      email: prev.email || preset.email,
      password: prev.password || preset.password,
    }));
    setRole(next);
    // Каждый выбор перезапускает плавное появление степов под выбранную роль.
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 420,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const complete = () => {
    if (!role) {
      return;
    }
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
    if (isRoleStep) {
      if (role) {
        animateTo(1);
      }
      return;
    }
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

  const ctaDisabled = isRoleStep && !role;
  const ctaLabel = isLast ? t('auth.finish') : t('auth.next');

  const renderFormStep = (step: RegisterStepDef) => (
    <>
      <Text style={styles.heading}>{t(step.titleKey)}</Text>
      {step.hintKey && t(step.hintKey) ? (
        <Text style={styles.helper}>{t(step.hintKey)}</Text>
      ) : null}

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
    </>
  );

  return (
    <AuthShell>
      <BackLink
        label={t('common.back')}
        iconColor={colors.textPrimary}
        labelColor={colors.textPrimary}
        onPress={goBack}
      />

      <Animated.View
        style={[
          styles.progress,
          {
            opacity: progressAnim,
            transform: [
              {
                translateY: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0],
                }),
              },
            ],
          },
        ]}
      >
        {role ? (
          <>
            <StepDots key={role} count={formSteps.length} current={stepIndex - 1} />
            {!isRoleStep ? (
              <Text style={styles.stepCounter}>
                {t('auth.stepOf', { current: stepIndex, total: formSteps.length })}
              </Text>
            ) : null}
          </>
        ) : null}
      </Animated.View>

      <Animated.View
        style={{
          opacity: contentOpacity,
          transform: [{ translateX: contentShift }],
        }}
      >
        {isRoleStep ? (
          <>
            <Text style={styles.heading}>{t('welcome.whoAreYou')}</Text>
            <View style={styles.roleToggleWrap}>
              <RoleToggle role={role} onChange={chooseRole} />
            </View>
          </>
        ) : currentStep ? (
          renderFormStep(currentStep)
        ) : null}
      </Animated.View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={ctaLabel}
        disabled={ctaDisabled}
        style={styles.ctaWrap}
        onPress={goNext}
      >
        {({ pressed }) => (
          <GlassSurface
            pressed={pressed}
            radius={glassButtonRadius}
            style={[styles.ctaSurface, ctaDisabled && styles.ctaDisabled]}
          >
            <Text style={styles.ctaText}>{ctaLabel}</Text>
          </GlassSurface>
        )}
      </Pressable>

      {currentStep?.social ? (
        <View style={styles.socialBlock}>
          <SocialAuthButtons onPress={() => complete()} />
        </View>
      ) : null}

      {currentStep?.skippable ? (
        <Pressable accessibilityRole="button" onPress={goNext} style={styles.subtleLink}>
          <Text style={styles.subtleLinkText}>{t('auth.skip')}</Text>
        </Pressable>
      ) : null}
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
      <BackLink
        label={t('common.back')}
        iconColor={colors.textPrimary}
        labelColor={colors.textPrimary}
        onPress={() => navigation.goBack()}
      />

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{t(`roles.${role}`)}</Text>
      </View>

      <Text style={styles.heading}>{t('auth.welcomeBack')}</Text>
      {/* <Text style={styles.helper}>{t('auth.loginHelper')}</Text> */}

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
        style={styles.ctaWrapCompact}
        onPress={complete}
      >
        {({ pressed }) => (
          <GlassSurface
            pressed={pressed}
            radius={glassButtonRadius}
            style={styles.ctaSurfaceCompact}
          >
            <Text style={styles.ctaText}>{t('auth.signInCta')}</Text>
          </GlassSurface>
        )}
      </Pressable>

      <View style={styles.socialBlock}>
        <SocialAuthButtons onPress={() => complete()} />
      </View>

      {/* <Pressable
        accessibilityRole="button"
        onPress={() => navigation.replace('Register', { role, mode: 'register' })}
        style={styles.subtleLink}
      >
        <Text style={styles.switchLinkText}>{t('auth.switchToRegister')}</Text>
      </Pressable> */}
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
      <GlassSurface radius={glassInputRadius} highlight={focused}>
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
          placeholderTextColor="rgba(255, 255, 255, 0.45)"
          style={[
            styles.input,
            field.multiline && styles.inputMultiline,
          ]}
        />
      </GlassSurface>
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
    fontWeight: '400',
    color: colors.textPrimary,
    letterSpacing: 0.3,
    ...font('400'),
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    marginTop: 8,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textPrimary,
    ...font('400'),
  },
  heading: {
    fontSize: 26,
    fontWeight: '500',
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 8,
    ...font('500'),
  },
  helper: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textPrimary,
    lineHeight: 21,
    marginBottom: 24,
    maxWidth: 340,
    ...font('400'),
  },
  form: {
    gap: 16,
  },
  roleToggleWrap: {
    marginTop: 8,
  },
  ctaDisabled: {
    opacity: 0.45,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    ...font('400'),
  },
  input: {
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 15,
    fontWeight: '400',
    color: colors.textPrimary,
    ...font('400'),
  },
  inputMultiline: {
    minHeight: 88,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  socialBlock: {
    marginTop: 20,
    alignItems: 'center',
  },
  ctaWrap: {
    marginTop: 26,
  },
  ctaWrapCompact: {
    marginTop: 26,
    alignSelf: 'center',
  },
  ctaSurface: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaSurfaceCompact: {
    paddingVertical: 13,
    paddingHorizontal: 32,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    ...font('500'),
  },
  subtleLink: {
    marginTop: 16,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  subtleLinkText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '400',
    ...font('400'),
  },
  switchLinkText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '400',
    ...font('400'),
  },
});
