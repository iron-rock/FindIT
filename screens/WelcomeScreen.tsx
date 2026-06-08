import { Platform, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import { GlassContainer, GlassView } from "expo-glass-effect";
import type { ReactNode } from "react";

import { ConstellationBackground } from "../components/background/ConstellationBackground";
import { GradientBackground } from "../components/background/GradientBackground";
import { MovingShadowOverlay } from "../components/background/MovingShadowOverlay";
import { useLiquidGlass } from "../components/ui/GlassSurface";
import type { AuthMode, RootStackParamList } from "../navigation/types";
import { colors, font, Text } from "../theme";

export type WelcomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Welcome"
>;

const isIOS = Platform.OS === "ios";

export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const { t } = useTranslation();

  const chooseIntent = (mode: AuthMode) => {
    navigation.navigate("Register", { mode });
  };

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
        <View style={styles.centerBlock}>
          <Text style={styles.brand} accessibilityRole="header">
            <Text style={styles.brandFind}>Find</Text>
            <Text style={styles.brandBrace}>{"{"}</Text>
            <Text style={styles.brandIt}>IT</Text>
            <Text style={styles.brandBrace}>{"}"}</Text>
          </Text>

          <ButtonRow>
            <GlowButton
              title={t("welcome.login")}
              accessibilityLabel={t("welcome.login")}
              onPress={() => chooseIntent("login")}
            />
            <GlowButton
              title={t("welcome.register")}
              accessibilityLabel={t("welcome.register")}
              onPress={() => chooseIntent("register")}
            />
          </ButtonRow>
        </View>
      </SafeAreaView>
    </View>
  );
}

function ButtonRow({ children }: { children: ReactNode }) {
  if (useLiquidGlass) {
    return <GlassContainer style={styles.buttonRow}>{children}</GlassContainer>;
  }
  return <View style={styles.buttonRow}>{children}</View>;
}

type GlowButtonProps = {
  title: string;
  accessibilityLabel: string;
  onPress: () => void;
};

function GlowButton({ title, accessibilityLabel, onPress }: GlowButtonProps) {
  if (useLiquidGlass) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={styles.buttonWrap}
      >
        {({ pressed }) => (
          <GlassView
            glassEffectStyle="regular"
            colorScheme="dark"
            style={[
              styles.buttonLiquid,
              pressed && styles.buttonLiquidPressed,
            ]}
          >
            <Text style={styles.buttonTitle}>{title}</Text>
            {pressed ? (
              <View pointerEvents="none" style={styles.buttonPressOverlay} />
            ) : null}
          </GlassView>
        )}
      </Pressable>
    );
  }

  return (
    <View style={styles.buttonWrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [
          isIOS ? styles.buttonGlass : styles.button,
          pressed &&
            (isIOS ? styles.buttonGlassPressed : styles.buttonPressed),
        ]}
      >
        {isIOS ? (
          <BlurView
            intensity={55}
            tint="systemThinMaterialDark"
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        {isIOS ? (
          <View pointerEvents="none" style={styles.buttonGlassEdge} />
        ) : null}
        <Text style={styles.buttonTitle}>{title}</Text>
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
    paddingHorizontal: 16,
  },
  centerBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 36,
  },
  brand: {
    fontSize: 44,
    letterSpacing: -1,
    textAlign: "center",
  },
  brandFind: {
    fontWeight: "500",
    color: colors.textPrimary,
    ...font("500"),
  },
  brandBrace: {
    fontWeight: "300",
    color: colors.textPrimary,
    ...font("300"),
  },
  brandIt: {
    fontWeight: "600",
    color: colors.textPrimary,
    ...font("600"),
  },
  buttonRow: {
    flexDirection: "row",
    gap: 16,
    alignSelf: "stretch",
    alignItems: "flex-start",
  },
  buttonWrap: {
    position: "relative",
    flex: 1,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: "rgba(26, 43, 69, 0.7)",
    shadowColor: "#000814",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLiquid: {
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  buttonLiquidPressed: {
    transform: [{ scale: 0.97 }],
  },
  buttonPressOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
  buttonGlass: {
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 8,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  buttonGlassEdge: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.12)",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: colors.interactivePressed,
  },
  buttonGlassPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.88,
  },
  buttonTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
    textAlign: "center",
    ...font("500"),
  },
});
