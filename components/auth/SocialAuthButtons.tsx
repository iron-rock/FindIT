import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { BackLink } from "../navigation/BackLink";
import { colors } from "../../theme";
import { glassAuthRadius } from "../ui/GlassSurface";

export type SocialProvider = "google" | "apple" | "linkedin";

type SocialAuthButtonsProps = {
  onPress?: (provider: SocialProvider) => void;
  onBack?: () => void;
};

const PROVIDERS: {
  id: SocialProvider;
  icon: keyof typeof Ionicons.glyphMap;
  a11yKey: "continueWithGoogle" | "continueWithApple" | "continueWithLinkedIn";
}[] = [
  { id: "google", icon: "logo-google", a11yKey: "continueWithGoogle" },
  { id: "apple", icon: "logo-apple", a11yKey: "continueWithApple" },
  { id: "linkedin", icon: "logo-linkedin", a11yKey: "continueWithLinkedIn" },
];

/** Нижний ряд: «назад» слева + иконки провайдеров по центру. */
export function SocialAuthButtons({ onPress, onBack }: SocialAuthButtonsProps) {
  const { t } = useTranslation();

  if (!onBack && !onPress) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      {onBack ? (
        <View style={styles.backSlot} pointerEvents="box-none">
          <BackLink
            iconOnly
            accessibilityLabel={t("common.back")}
            iconColor={colors.textPrimary}
            onPress={onBack}
          />
        </View>
      ) : null}

      {onPress ? (
        <View style={styles.providersRow}>
          {PROVIDERS.map((provider) => (
            <Pressable
              key={provider.id}
              accessibilityRole="button"
              accessibilityLabel={t(`auth.${provider.a11yKey}`)}
              onPress={() => onPress(provider.id)}
            >
              {({ pressed }) => (
                <View style={[styles.button, pressed && styles.buttonPressed]}>
                  <Ionicons
                    name={provider.icon}
                    size={18}
                    color={colors.textPrimary}
                  />
                </View>
              )}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "stretch",
    minHeight: 44,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  backSlot: {
    position: "absolute",
    left: -4,
    top: 0,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  providersRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: glassAuthRadius,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
  },
  buttonPressed: {
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
});
