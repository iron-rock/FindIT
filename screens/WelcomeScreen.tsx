import { useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { BrandTitle } from "../components/auth/BrandTitle";
import { FormField } from "../components/auth/FormField";
import { RoleCheckboxes } from "../components/auth/RoleCheckboxes";
import { SocialAuthButtons } from "../components/auth/SocialAuthButtons";
import { StepDots } from "../components/auth/StepDots";
import { ConstellationBackground } from "../components/background/ConstellationBackground";
import { GradientBackground } from "../components/background/GradientBackground";
import { MovingShadowOverlay } from "../components/background/MovingShadowOverlay";
import { glassButtonRadius } from "../components/ui/GlassSurface";
import { registerPresetsByRole } from "../data/registerPresets";
import {
  EMPTY_REGISTER_FORM,
  REGISTER_STEPS_BY_ROLE,
  type RegisterFieldDef,
  type RegisterFieldKey,
  type RegisterFormState,
  type RegisterStepDef,
} from "../data/registerStepDefs";
import type { RootStackParamList, UserRole } from "../navigation/types";
import { colors, font, Text } from "../theme";

export type WelcomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Welcome"
>;

/** Полоса шагов всегда рисуется на это число точек (потом завязать на роль). */
const STEP_DOTS_COUNT = 5;

/** Верхняя позиция названия на шагах входа/регистрации. */
const AUTH_TITLE_TOP = 48;

type Phase = "intent" | "login" | "register";

const LOGIN_EMAIL_FIELD: RegisterFieldDef = {
  key: "email",
  labelKey: "auth.email",
  placeholderKey: "auth.emailPlaceholder",
  keyboardType: "email-address",
  autoCapitalize: "none",
};

const LOGIN_PASSWORD_FIELD: RegisterFieldDef = {
  key: "password",
  labelKey: "auth.password",
  placeholderKey: "auth.passwordPlaceholder",
  secure: true,
  autoCapitalize: "none",
};

const TITLE_ANIM_MS = 720;
const CONTENT_FADE_OUT_MS = 200;
const CONTENT_FADE_IN_MS = 300;

export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const { t } = useTranslation();
  const { height: windowHeight } = useWindowDimensions();

  const [phase, setPhase] = useState<Phase>("intent");
  // Регистрация: stepIndex 0 — выбор роли; 1..N — шаги выбранной роли.
  const [role, setRole] = useState<UserRole | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<RegisterFormState>(() => ({
    ...EMPTY_REGISTER_FORM,
  }));
  const [focused, setFocused] = useState<RegisterFieldKey | null>(null);

  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentShift = useRef(new Animated.Value(0)).current;
  // 0 — intent (название по центру), 1 — вход/регистрация (название приподнято).
  const logoLift = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(1)).current;

  // Сдвиг всей группы (название + контент) вниз на intent, чтобы визуально быть по центру.
  const intentGroupOffset = Math.max(
    0,
    (windowHeight - AUTH_TITLE_TOP - 340) / 2,
  );

  const groupTranslateY = logoLift.interpolate({
    inputRange: [0, 1],
    outputRange: [intentGroupOffset, 0],
  });

  const createTitleGrowAnim = () =>
    Animated.sequence([
      Animated.timing(titleScale, {
        toValue: 0.97,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(titleScale, {
        toValue: 1,
        duration: 440,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

  /** Мягкое увеличение названия без резкого setValue. */
  const pulseTitleGrow = () => {
    titleScale.stopAnimation();
    createTitleGrowAnim().start();
  };

  const liftLogo = (toValue: 0 | 1) => {
    titleScale.stopAnimation();
    const moves: Animated.CompositeAnimation[] = [
      Animated.timing(logoLift, {
        toValue,
        duration: TITLE_ANIM_MS,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ];

    if (toValue === 1) {
      moves.push(createTitleGrowAnim());
    } else {
      moves.push(
        Animated.timing(titleScale, {
          toValue: 1,
          duration: TITLE_ANIM_MS,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      );
    }

    Animated.parallel(moves).start();
  };

  const formSteps = role ? REGISTER_STEPS_BY_ROLE[role] : [];
  // Шаг 0 — объединённый «аккаунт + выбор роли»; шаги 1..N — формы выбранной роли.
  const isAccountStep = stepIndex === 0;
  const currentStep: RegisterStepDef | undefined = isAccountStep
    ? undefined
    : formSteps[stepIndex];
  const isLast = !isAccountStep && stepIndex === formSteps.length - 1;

  const setField = (key: RegisterFieldKey, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /** Кросс-фейд содержимого; смену состояния делаем в колбэке. */
  const transition = (
    apply: () => void,
    direction: 1 | -1 = 1,
    options?: { pulseTitle?: boolean },
  ) => {
    if (options?.pulseTitle) {
      pulseTitleGrow();
    }

    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: CONTENT_FADE_OUT_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentShift, {
        toValue: direction * -12,
        duration: CONTENT_FADE_OUT_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      try {
        apply();
      } finally {
        setFocused(null);
        contentShift.setValue(direction * 12);
        Animated.parallel([
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: CONTENT_FADE_IN_MS,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(contentShift, {
            toValue: 0,
            duration: CONTENT_FADE_IN_MS,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      }
    });
  };

  const goToIntent = () => {
    liftLogo(0);
    transition(() => {
      setPhase("intent");
      setRole(null);
      setStepIndex(0);
      setForm({ ...EMPTY_REGISTER_FORM });
    }, -1);
  };

  const goToLogin = () => {
    const preset = registerPresetsByRole.finder;
    liftLogo(1);
    transition(() => {
      setPhase("login");
      setForm((prev) => ({
        ...prev,
        email: prev.email || preset.email,
        password: prev.password || preset.password,
      }));
    }, 1);
  };

  const goToRegister = () => {
    liftLogo(1);
    transition(() => {
      setPhase("register");
      setRole(null);
      setStepIndex(0);
    }, 1);
  };

  const chooseRole = (next: UserRole) => {
    const preset = registerPresetsByRole[next];
    setForm((prev) => ({
      ...prev,
      email: prev.email || preset.email,
      password: prev.password || preset.password,
    }));
    setRole(next);
  };

  const completeRegister = () => {
    if (!role) {
      return;
    }
    const name = role === "finder" ? form.fullName.trim() : form.company.trim();
    const fallback = t(`roles.${role}`);
    const subtitleParts = [
      role === "finder" ? form.headline.trim() : form.industry.trim(),
      form.email.trim(),
    ].filter(Boolean);

    navigation.replace("Main", {
      role,
      greetingTitle:
        role === "finder"
          ? t("profile.greeting", { name: name || fallback })
          : name || fallback,
      greetingSubtitle: subtitleParts.join(" · ") || fallback,
    });
  };

  const completeLogin = () => {
    navigation.replace("Main", {
      role: "finder",
      greetingTitle: t("profile.greeting", { name: t("roles.finder") }),
      greetingSubtitle: form.email.trim() || t("roles.finder"),
    });
  };

  const goNextRegister = () => {
    if (isAccountStep) {
      if (role) {
        transition(() => setStepIndex(1), 1, { pulseTitle: true });
      }
      return;
    }
    if (isLast) {
      completeRegister();
    } else {
      transition(() => setStepIndex(stepIndex + 1), 1, { pulseTitle: true });
    }
  };

  const goBack = () => {
    if (phase === "login") {
      goToIntent();
      return;
    }
    if (phase === "register") {
      if (stepIndex === 0) {
        goToIntent();
      } else {
        transition(() => setStepIndex(stepIndex - 1), -1, { pulseTitle: true });
      }
    }
  };

  const showDots = phase === "register";
  const ctaDisabled = phase === "register" && isAccountStep && !role;
  const registerCtaLabel = isLast ? t("auth.finish") : t("auth.next");

  return (
    <View style={styles.root}>
      <GradientBackground />
      <ConstellationBackground />
      <MovingShadowOverlay />
      <View style={styles.scrim} pointerEvents="none" />

      <SafeAreaView
        style={styles.safe}
        edges={["top", "left", "right", "bottom"]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.mainColumn}>
              <Animated.View
                style={{
                  transform: [{ translateY: groupTranslateY }],
                }}
              >
                <Animated.View
                  style={[
                    styles.titleBlock,
                    phase === "intent" && styles.titleBlockIntent,
                    showDots && styles.titleBlockWithDots,
                    styles.titleBlockAuth,
                    {
                      transform: [{ scale: titleScale }],
                    },
                  ]}
                >
                  <BrandTitle fontSize={56} />

                  {showDots ? (
                    <View style={styles.dotsWrap}>
                      <StepDots count={STEP_DOTS_COUNT} current={stepIndex} />
                    </View>
                  ) : null}
                </Animated.View>

                <Animated.View
                  style={[
                    styles.content,
                    phase === "intent" && styles.contentIntent,
                    {
                      opacity: contentOpacity,
                      transform: [{ translateX: contentShift }],
                    },
                  ]}
                >
                  {phase === "intent" ? (
                    <View style={styles.intentRow}>
                      <GlassButton
                        title={t("welcome.login")}
                        onPress={goToLogin}
                        style={styles.intentButton}
                      />
                      <GlassButton
                        title={t("welcome.register")}
                        onPress={goToRegister}
                        style={styles.intentButton}
                      />
                    </View>
                  ) : phase === "login" ? (
                    <LoginContent
                      email={form.email}
                      password={form.password}
                      focused={focused}
                      onChange={setField}
                      onFocus={setFocused}
                      onBlur={() => setFocused(null)}
                      onSubmit={completeLogin}
                      onBack={goBack}
                    />
                  ) : isAccountStep ? (
                    <>
                      <View style={styles.form}>
                        <FormField
                          field={LOGIN_EMAIL_FIELD}
                          value={form.email}
                          focused={focused === "email"}
                          onChangeText={(text) => setField("email", text)}
                          onFocus={() => setFocused("email")}
                          onBlur={() => setFocused(null)}
                        />
                        <FormField
                          field={LOGIN_PASSWORD_FIELD}
                          value={form.password}
                          focused={focused === "password"}
                          onChangeText={(text) => setField("password", text)}
                          onFocus={() => setFocused("password")}
                          onBlur={() => setFocused(null)}
                        />
                        <RoleCheckboxes
                          role={role}
                          onChange={chooseRole}
                          layout="row"
                        />
                      </View>

                      <GlassButton
                        title={registerCtaLabel}
                        onPress={goNextRegister}
                        disabled={ctaDisabled}
                        style={styles.cta}
                      />

                      <View style={styles.socialBlock}>
                        <SocialAuthButtons
                          onBack={goBack}
                          onPress={completeRegister}
                        />
                      </View>
                    </>
                  ) : currentStep ? (
                    <>
                      <Text style={styles.heading}>
                        {t(currentStep.titleKey)}
                      </Text>
                      {currentStep.hintKey && t(currentStep.hintKey) ? (
                        <Text style={styles.helper}>
                          {t(currentStep.hintKey)}
                        </Text>
                      ) : null}

                      <View style={styles.form}>
                        {currentStep.fields.map((field) => (
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

                      <GlassButton
                        title={registerCtaLabel}
                        onPress={goNextRegister}
                        style={styles.cta}
                      />

                      <View style={styles.socialBlock}>
                        <SocialAuthButtons
                          onBack={goBack}
                          onPress={
                            currentStep.social ? completeRegister : undefined
                          }
                        />
                      </View>

                      {currentStep.skippable ? (
                        <Pressable
                          accessibilityRole="button"
                          onPress={goNextRegister}
                          style={styles.subtleLink}
                        >
                          <Text style={styles.subtleLinkText}>
                            {t("auth.skip")}
                          </Text>
                        </Pressable>
                      ) : null}
                    </>
                  ) : null}
                </Animated.View>
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

type LoginContentProps = {
  email: string;
  password: string;
  focused: RegisterFieldKey | null;
  onChange: (key: RegisterFieldKey, value: string) => void;
  onFocus: (key: RegisterFieldKey) => void;
  onBlur: () => void;
  onSubmit: () => void;
  onBack: () => void;
};

function LoginContent({
  email,
  password,
  focused,
  onChange,
  onFocus,
  onBlur,
  onSubmit,
  onBack,
}: LoginContentProps) {
  const { t } = useTranslation();

  return (
    <>
      <View style={styles.form}>
        <FormField
          field={LOGIN_EMAIL_FIELD}
          value={email}
          focused={focused === "email"}
          onChangeText={(text) => onChange("email", text)}
          onFocus={() => onFocus("email")}
          onBlur={onBlur}
        />
        <FormField
          field={LOGIN_PASSWORD_FIELD}
          value={password}
          focused={focused === "password"}
          onChangeText={(text) => onChange("password", text)}
          onFocus={() => onFocus("password")}
          onBlur={onBlur}
        />
      </View>

      <GlassButton
        title={t("auth.signInCta")}
        onPress={onSubmit}
        style={styles.cta}
      />

      <View style={styles.socialBlock}>
        <SocialAuthButtons onBack={onBack} onPress={onSubmit} />
      </View>
    </>
  );
}

type GlassButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: object;
};

function GlassButton({
  title,
  onPress,
  disabled = false,
  style,
}: GlassButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled}
      onPress={onPress}
      style={[styles.buttonPressable, style]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.buttonSurface,
            { borderRadius: glassButtonRadius },
            pressed && styles.buttonPressed,
            disabled && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.buttonText}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 22, 48, 0.4)",
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  mainColumn: {
    flexGrow: 1,
  },
  titleBlock: {
    alignItems: "center",
    marginBottom: 22,
    gap: 22,
  },
  titleBlockIntent: {
    marginBottom: 6,
  },
  titleBlockWithDots: {
    marginBottom: 52,
  },
  titleBlockAuth: {
    marginTop: AUTH_TITLE_TOP,
  },
  dotsWrap: {
    alignSelf: "stretch",
    gap: 12,
  },
  content: {
    alignSelf: "stretch",
  },
  contentIntent: {
    marginTop: -8,
  },
  intentRow: {
    flexDirection: "row",
    gap: 14,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  intentButton: {
    flex: 1,
    alignSelf: "stretch",
  },
  heading: {
    fontSize: 26,
    fontWeight: "500",
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 8,
    ...font("500"),
  },
  helper: {
    fontSize: 15,
    fontWeight: "400",
    color: colors.textPrimary,
    lineHeight: 21,
    marginBottom: 20,
    maxWidth: 340,
    ...font("400"),
  },
  roleWrap: {
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  socialBlock: {
    marginTop: 20,
    alignItems: "center",
  },
  cta: {
    marginTop: 26,
  },
  subtleLink: {
    marginTop: 16,
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  subtleLinkText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: "400",
    ...font("400"),
  },
  buttonPressable: {
    alignSelf: "stretch",
  },
  buttonSurface: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
  },
  buttonPressed: {
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
    textAlign: "center",
    ...font("500"),
  },
});
