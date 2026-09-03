import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { colors } from "../../theme";
import {
  outlineRadius,
  softSurface,
  softSurfacePressed,
} from "../../theme/surface";

export type SocialProvider = "google" | "apple" | "linkedin";

type SocialAuthButtonsProps = {
  onPress?: (provider: SocialProvider) => void;
  size?: "md" | "lg";
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

/**
 * Ряд соц. провайдеров на всю ширину (flex + gap как у Register/Login).
 * Soft-поверхность без рамки — тот же язык, что SoftButton на Welcome.
 */
export function SocialAuthButtons({
  onPress,
  size = "md",
}: SocialAuthButtonsProps) {
  const { t } = useTranslation();
  // Компактнее SoftButton: меньше вертикальный padding, иконки без клипа.
  const icon = size === "lg" ? 20 : 18;
  const padY = size === "lg" ? 10 : 8;

  if (!onPress) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.providersRow}>
        {PROVIDERS.map((provider) => (
          <Pressable
            key={provider.id}
            accessibilityRole="button"
            accessibilityLabel={t(`auth.${provider.a11yKey}`)}
            onPress={() => onPress(provider.id)}
            style={styles.pressable}
          >
            {({ pressed }) => (
              <View
                style={[
                  softSurface(outlineRadius, styles.button),
                  { paddingVertical: padY },
                  pressed && softSurfacePressed,
                ]}
              >
                <Ionicons
                  name={provider.icon}
                  size={icon}
                  color={colors.textPrimary}
                />
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "stretch",
  },
  providersRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch",
    alignSelf: "stretch",
  },
  pressable: {
    flex: 1,
    minWidth: 0,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
});
