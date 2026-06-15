import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Alert,
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
import { AiToolsPicker } from "../components/auth/AiToolsPicker";
import { FormField } from "../components/auth/FormField";
import { OtpInput } from "../components/auth/OtpInput";
import { PhoneField } from "../components/auth/PhoneField";
import { RoleCheckboxes } from "../components/auth/RoleCheckboxes";
import { SocialAuthButtons } from "../components/auth/SocialAuthButtons";
import { StepDots } from "../components/auth/StepDots";
import { ConstellationBackground } from "../components/background/ConstellationBackground";
import { GradientBackground } from "../components/background/GradientBackground";
import { MovingShadowOverlay } from "../components/background/MovingShadowOverlay";
import { glassAuthRadius } from "../components/ui/GlassSurface";
import { registerPresetsByRole } from "../data/registerPresets";
import { formatSelectedAiTools } from "../data/aiToolsCatalog";
import {
  EMPTY_REGISTER_FORM,
  REGISTER_DOTS_PLACEHOLDER,
  REGISTER_STEPS_BY_ROLE,
  type RegisterFieldDef,
  type RegisterFieldKey,
  type RegisterFormState,
  type RegisterStepDef,
} from "../data/registerStepDefs";
import {
  detectPhoneCountry,
  formatPhoneDisplay,
  getDefaultPhoneCountry,
  isPhoneCountryCode,
  toE164,
  type PhoneCountryCode,
} from "../lib/phoneFormat";
import { RegisterAuthError, sendPhoneOtp } from "../lib/registerAuth";
import { useSplashDone } from "../contexts/SplashContext";
import type { RootStackParamList, UserRole } from "../navigation/types";
import { colors, font, Text } from "../theme";

export type WelcomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Welcome"
>;

/** Верхняя позиция названия на шагах входа/регистрации. */
const AUTH_TITLE_TOP = 48;

type Phase = "intent" | "login" | "register";

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
const INTENT_ENTER_SHIFT = 12;

function getPhoneCountry(form: RegisterFormState): PhoneCountryCode {
  return (
    detectPhoneCountry(form.phone) ??
    (isPhoneCountryCode(form.phoneCountry)
      ? form.phoneCountry
      : getDefaultPhoneCountry())
  );
}

function syncPhoneCountry(
  setField: (key: RegisterFieldKey, value: string) => void,
  country: PhoneCountryCode | null,
) {
  if (country) {
    setField("phoneCountry", country);
  }
}

export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const { t } = useTranslation();
  const splashDone = useSplashDone();
  const { height: windowHeight } = useWindowDimensions();

  const [phase, setPhase] = useState<Phase>("intent");
  const [role, setRole] = useState<UserRole | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<RegisterFormState>(() => ({
    ...EMPTY_REGISTER_FORM,
  }));
  const [focused, setFocused] = useState<RegisterFieldKey | null>(null);
  const [resendingCode, setResendingCode] = useState(false);

  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentShift = useRef(new Animated.Value(0)).current;
  const logoLift = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(1)).current;
  const intentTitleOpacity = useRef(new Animated.Value(0)).current;
  const intentTitleShift = useRef(new Animated.Value(-INTENT_ENTER_SHIFT)).current;
  const intentButtonsOpacity = useRef(new Animated.Value(0)).current;
  const intentButtonsShift = useRef(new Animated.Value(INTENT_ENTER_SHIFT)).current;
  const intentEnterPlayed = useRef(false);

  const runIntentEnterAnim = useCallback(() => {
    intentTitleOpacity.setValue(0);
    intentTitleShift.setValue(-INTENT_ENTER_SHIFT);
    intentButtonsOpacity.setValue(0);
    intentButtonsShift.setValue(INTENT_ENTER_SHIFT);

    Animated.parallel([
      Animated.timing(intentTitleOpacity, {
        toValue: 1,
        duration: CONTENT_FADE_IN_MS,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(intentTitleShift, {
        toValue: 0,
        duration: CONTENT_FADE_IN_MS,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(intentButtonsOpacity, {
        toValue: 1,
        duration: CONTENT_FADE_IN_MS,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(intentButtonsShift, {
        toValue: 0,
        duration: CONTENT_FADE_IN_MS,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    intentButtonsOpacity,
    intentButtonsShift,
    intentTitleOpacity,
    intentTitleShift,
  ]);

  useEffect(() => {
    if (!splashDone || intentEnterPlayed.current) {
      return;
    }
    intentEnterPlayed.current = true;
    runIntentEnterAnim();
  }, [splashDone, runIntentEnterAnim]);

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
  const isAccountStep = stepIndex === 0;
  const currentStep: RegisterStepDef | undefined = isAccountStep
    ? undefined
    : formSteps[stepIndex - 1];
  const isLast = !isAccountStep && stepIndex === formSteps.length;
  const stepDotsCount = role
    ? 1 + formSteps.length
    : REGISTER_DOTS_PLACEHOLDER;

  const setField = (key: RegisterFieldKey, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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
        phone: prev.phone || preset.phone,
        phoneCountry: prev.phoneCountry || preset.phoneCountry,
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
      phone: prev.phone || preset.phone,
      phoneCountry: prev.phoneCountry || preset.phoneCountry,
      password: prev.password || preset.password,
    }));
    setRole(next);
  };

  const completeRegister = () => {
    if (!role) {
      return;
    }
    const fallback = t(`roles.${role}`);
    const phoneLabel = formatPhoneDisplay(form.phone, getPhoneCountry(form));
    const selectedToolsLabel = formatSelectedAiTools(form.selectedAiTools, t);
    const subtitleParts =
      role === "finder"
        ? [
            selectedToolsLabel,
            form.aiTools.trim(),
            form.github.trim(),
            phoneLabel,
          ].filter(Boolean)
        : [phoneLabel].filter(Boolean);

    navigation.replace("Main", {
      role,
      greetingTitle: fallback,
      greetingSubtitle: subtitleParts.join(" · ") || fallback,
    });
  };

  const completeLogin = () => {
    navigation.replace("Main", {
      role: "finder",
      greetingTitle: t("profile.greeting", { name: t("roles.finder") }),
      greetingSubtitle:
        formatPhoneDisplay(form.phone, getPhoneCountry(form)) ||
        t("roles.finder"),
    });
  };

  const goNextRegister = () => {
    if (isAccountStep) {
      if (role) {
        transition(
          () => {
            setStepIndex(1);
            setForm((prev) => ({
              ...prev,
              otpCode: prev.otpCode || "123456",
            }));
          },
          1,
          { pulseTitle: true },
        );
      }
      return;
    }
    if (isLast) {
      completeRegister();
      return;
    }
    transition(() => setStepIndex(stepIndex + 1), 1, { pulseTitle: true });
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
  const formattedPhone = formatPhoneDisplay(form.phone, getPhoneCountry(form));

  const handleResendCode = useCallback(async () => {
    const e164 = toE164(form.phone, getPhoneCountry(form));
    if (!e164) {
      Alert.alert(t("auth.invalidPhone"));
      return;
    }

    setResendingCode(true);
    try {
      await sendPhoneOtp(e164);
    } catch (error) {
      if (error instanceof RegisterAuthError) {
        Alert.alert(
          t("common.appName"),
          error.code === "supabaseNotConfigured"
            ? t("auth.supabaseNotConfigured")
            : t("auth.authFailed"),
        );
      } else {
        Alert.alert(t("common.appName"), t("auth.authFailed"));
      }
    } finally {
      setResendingCode(false);
    }
  }, [form.phone, form.phoneCountry, t]);

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
                      opacity: intentTitleOpacity,
                      transform: [
                        { scale: titleScale },
                        { translateY: intentTitleShift },
                      ],
                    },
                  ]}
                >
                  <BrandTitle fontSize={56} />

                  {showDots ? (
                    <View style={styles.dotsWrap}>
                      <StepDots count={stepDotsCount} current={stepIndex} />
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
                    <Animated.View
                      style={[
                        styles.intentColumn,
                        {
                          opacity: intentButtonsOpacity,
                          transform: [{ translateY: intentButtonsShift }],
                        },
                      ]}
                    >
                      <GlassButton
                        title={t("welcome.register")}
                        onPress={goToRegister}
                        style={styles.intentPrimaryButton}
                        textStyle={styles.intentButtonText}
                      />
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t("welcome.login")}
                        onPress={goToLogin}
                        style={styles.intentLoginLink}
                      >
                        <Text style={styles.intentLoginText}>
                          {t("welcome.login")}
                        </Text>
                      </Pressable>
                    </Animated.View>
                  ) : phase === "login" ? (
                    <LoginContent
                      phone={form.phone}
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
                        <PhoneField
                          value={form.phone}
                          focused={focused === "phone"}
                          onChangeText={(text) => setField("phone", text)}
                          onCountryDetected={(country) =>
                            syncPhoneCountry(setField, country)
                          }
                          onFocus={() => setFocused("phone")}
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
                          compact
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
                  ) : currentStep?.kind === "verify" ? (
                    <>
                      <Text style={[styles.helper, styles.verifyHint]}>
                        {t(currentStep.hintKey ?? "auth.verifyPhoneHint", {
                          phone: formattedPhone,
                        })}
                      </Text>

                      <View style={styles.verifyForm}>
                        <OtpInput
                          value={form.otpCode}
                          focused={focused === "otpCode"}
                          onChangeText={(text) => setField("otpCode", text)}
                          onFocus={() => setFocused("otpCode")}
                          onBlur={() => setFocused(null)}
                        />
                      </View>

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t("auth.resendCode")}
                        accessibilityState={{ disabled: resendingCode }}
                        disabled={resendingCode}
                        onPress={handleResendCode}
                        style={styles.resendLink}
                      >
                        <Text
                          style={[
                            styles.resendLinkText,
                            resendingCode && styles.resendLinkTextDisabled,
                          ]}
                        >
                          {t("auth.resendCode")}
                        </Text>
                      </Pressable>

                      <GlassButton
                        title={registerCtaLabel}
                        onPress={goNextRegister}
                        style={styles.cta}
                      />

                      <View style={styles.socialBlock}>
                        <SocialAuthButtons onBack={goBack} />
                      </View>
                    </>
                  ) : currentStep?.kind === "highlights" ? (
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
                        <AiToolsPicker
                          value={form.selectedAiTools}
                          onChange={(value) => setField("selectedAiTools", value)}
                        />
                        <FormField
                          field={currentStep.fields[0]}
                          value={form.aiTools}
                          focused={focused === "aiTools"}
                          hidePlaceholder
                          onChangeText={(text) => setField("aiTools", text)}
                          onFocus={() => setFocused("aiTools")}
                          onBlur={() => setFocused(null)}
                        />
                        <FormField
                          field={currentStep.fields[1]}
                          value={form.github}
                          focused={focused === "github"}
                          onChangeText={(text) => setField("github", text)}
                          onFocus={() => setFocused("github")}
                          onBlur={() => setFocused(null)}
                        />
                      </View>

                      <GlassButton
                        title={registerCtaLabel}
                        onPress={goNextRegister}
                        style={styles.cta}
                      />

                      <View style={styles.socialBlock}>
                        <SocialAuthButtons onBack={goBack} />
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
                        <SocialAuthButtons onBack={goBack} />
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
  phone: string;
  password: string;
  focused: RegisterFieldKey | null;
  onChange: (key: RegisterFieldKey, value: string) => void;
  onFocus: (key: RegisterFieldKey) => void;
  onBlur: () => void;
  onSubmit: () => void;
  onBack: () => void;
};

function LoginContent({
  phone,
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
        <PhoneField
          value={phone}
          focused={focused === "phone"}
          onChangeText={(text) => onChange("phone", text)}
          onCountryDetected={(country) => {
            if (country) {
              onChange("phoneCountry", country);
            }
          }}
          onFocus={() => onFocus("phone")}
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
  radius?: number;
  style?: object;
  textStyle?: object;
};

function GlassButton({
  title,
  onPress,
  disabled = false,
  radius = glassAuthRadius,
  style,
  textStyle,
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
            { borderRadius: radius },
            pressed && styles.buttonPressed,
            disabled && styles.buttonDisabled,
          ]}
        >
          <Text style={[styles.buttonText, textStyle]}>{title}</Text>
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
  intentColumn: {
    alignItems: "center",
    alignSelf: "stretch",
  },
  intentPrimaryButton: {
    alignSelf: "center",
    minWidth: 220,
    maxWidth: 280,
  },
  intentLoginLink: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  intentButtonText: {
    ...font("600"),
  },
  intentLoginText: {
    fontSize: 14,
    color: colors.textPrimary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.55)",
    paddingBottom: 1,
    ...font("600"),
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
  verifyHint: {
    textAlign: "center",
    alignSelf: "center",
    marginBottom: 28,
  },
  verifyForm: {
    alignSelf: "stretch",
  },
  resendLink: {
    marginTop: 16,
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  resendLinkText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: "400",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.55)",
    paddingBottom: 1,
    ...font("400"),
  },
  resendLinkTextDisabled: {
    opacity: 0.45,
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
