import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { colors, Text } from "../../theme";

type BackLinkProps = {
  onPress: () => void;
  accessibilityLabel?: string;
  label?: string;
};

/** Кнопка «назад» для auth-флоу: крупная стрелка + лёгкая подпись. */
export function BackLink({
  onPress,
  accessibilityLabel,
  label,
}: BackLinkProps) {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t("common.back");
  const resolvedA11y = accessibilityLabel ?? resolvedLabel;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={resolvedA11y}
      hitSlop={12}
      onPress={onPress}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <Ionicons name="chevron-back" size={12} color={colors.accentBright} />
        <Text style={styles.label}>{resolvedLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingRight: 8,
    marginLeft: -4,
    marginBottom: 6,
  },
  pressed: {
    opacity: 0.72,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "400",
    color: colors.accentBright,
  },
});
