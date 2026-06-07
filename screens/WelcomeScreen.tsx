import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ConstellationBackground } from "../components/background/ConstellationBackground";
import { BackLink } from "../components/navigation/BackLink";
import { LanguageToggle } from "../components/i18n/LanguageToggle";
import { WelcomeLogoVideo } from "../components/WelcomeLogoVideo";
import type {
  AuthMode,
  RootStackParamList,
  UserRole,
} from "../navigation/types";
import { colors, Text } from "../theme";

export type WelcomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Welcome"
>;

type Step = "role" | "intent";

export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<UserRole>("finder");
  const roleRef = useRef<UserRole>("finder");

  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentShift = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glow]);

  const switchStep = useCallback(
    (next: Step) => {
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(contentShift, {
          toValue: next === "intent" ? -16 : 16,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setStep(next);
        contentShift.setValue(next === "intent" ? 16 : -16);
        Animated.parallel([
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(contentShift, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
        ]).start();
      });
    },
    [contentOpacity, contentShift],
  );

  const chooseRole = (nextRole: UserRole) => {
    roleRef.current = nextRole;
    setRole(nextRole);
    switchStep("intent");
  };

  const chooseIntent = (mode: AuthMode) => {
    navigation.navigate("Register", { role: roleRef.current, mode });
  };

  return (
    <View style={styles.root}>
      <ConstellationBackground />
      <View style={styles.scrim} pointerEvents="none" />

      <SafeAreaView
        style={styles.safe}
        edges={["top", "left", "right", "bottom"]}
      >
        <View style={styles.logoBlock}>
          <WelcomeLogoVideo />
          <Text style={styles.brand}>{t("common.appName")}</Text>
          <Text style={styles.tagline}>{t("welcome.tagline")}</Text>
        </View>

        <View style={styles.center}>
          <Animated.View
            style={[
              styles.panel,
              {
                opacity: contentOpacity,
                transform: [{ translateY: contentShift }],
              },
            ]}
          >
            {step === "role" ? (
              <>
                <Text style={styles.panelTitle}>{t("welcome.whoAreYou")}</Text>

                <GlowButton
                  glow={glow}
                  title={t("welcome.finderTitle")}
                  hint={t("welcome.finderHint")}
                  accessibilityLabel={t("welcome.finderTitle")}
                  onPress={() => chooseRole("finder")}
                />
                <GlowButton
                  glow={glow}
                  title={t("welcome.recruiterTitle")}
                  hint={t("welcome.recruiterHint")}
                  accessibilityLabel={t("welcome.recruiterTitle")}
                  onPress={() => chooseRole("recruiter")}
                />
              </>
            ) : (
              <>
                <BackLink
                  label={t("common.back")}
                  accessibilityLabel={t("welcome.chooseRoleBack")}
                  onPress={() => switchStep("role")}
                />

                <Text style={styles.panelTitle}>{t(`roles.${role}`)}</Text>
                <Text style={styles.panelHint}>
                  {t("welcome.intentTitleHint")}
                </Text>

                <GlowButton
                  glow={glow}
                  title={t("welcome.register")}
                  hint={t("welcome.registerHint")}
                  accessibilityLabel={t("welcome.register")}
                  onPress={() => chooseIntent("register")}
                />
                <GlowButton
                  glow={glow}
                  title={t("welcome.login")}
                  hint={t("welcome.loginHint")}
                  accessibilityLabel={t("welcome.login")}
                  onPress={() => chooseIntent("login")}
                />
              </>
            )}
          </Animated.View>
        </View>

        <View style={styles.langToggleWrap}>
          <LanguageToggle />
        </View>
      </SafeAreaView>
    </View>
  );
}

type GlowButtonProps = {
  title: string;
  hint: string;
  accessibilityLabel: string;
  glow: Animated.Value;
  onPress: () => void;
};

function GlowButton({
  title,
  hint,
  accessibilityLabel,
  glow,
  onPress,
}: GlowButtonProps) {
  const haloOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.18],
  });

  return (
    <View style={styles.buttonWrap}>
      <Animated.View
        pointerEvents="none"
        style={[styles.buttonHalo, { opacity: haloOpacity }]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonTitle}>{title}</Text>
        <Text style={styles.buttonHint}>{hint}</Text>
      </Pressable>
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
    backgroundColor: "rgba(5, 22, 48, 0.35)",
  },
  safe: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoBlock: {
    alignItems: "center",
    marginTop: 36,
    gap: 6,
  },
  brand: {
    fontSize: 40,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 17,
    fontWeight: "500",
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },
  center: {
    flex: 1,
    justifyContent: "center",
  },
  langToggleWrap: {
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  panel: {
    gap: 12,
    paddingHorizontal: 4,
  },
  panelTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  panelHint: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 6,
    lineHeight: 20,
  },
  buttonWrap: {
    position: "relative",
  },
  buttonHalo: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 16,
    backgroundColor: colors.accentGlow,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: "rgba(26, 43, 69, 0.7)",
    shadowColor: "#000814",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 6,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: colors.interactivePressed,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  buttonHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 3,
  },
});
