import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { colors } from "../../theme";
import {
  outlineBorder,
  outlineBorderPressed,
  outlineFill,
  outlineRadius,
} from "../../theme/surface";

export type SocialProvider = "google" | "apple" | "linkedin";

type SocialAuthButtonsProps = {
  onPress?: (provider: SocialProvider) => void;
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

/** Ряд иконок соц. провайдеров (без «назад» — он в AuthCtaRow). */
export function SocialAuthButtons({ onPress }: SocialAuthButtonsProps) {
  const { t } = useTranslation();

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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "stretch",
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
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
    borderRadius: outlineRadius,
    backgroundColor: outlineFill,
    ...outlineBorder,
  },
  buttonPressed: outlineBorderPressed,
});
