import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";

import { colors, Text } from "../../theme";

type BackLinkProps = {
  onPress: () => void;
  accessibilityLabel?: string;
  label?: string;
  /** Только стрелка, без подписи «Назад». */
  iconOnly?: boolean;
  /** Центрировать в квадратном слоте рядом с CTA. */
  inCtaRow?: boolean;
  iconColor?: string;
  labelColor?: string;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
};

/** Кнопка «назад» для auth-флоу: крупная стрелка + лёгкая подпись. */
export function BackLink({
  onPress,
  accessibilityLabel,
  label,
  iconOnly = false,
  inCtaRow = false,
  iconColor = colors.accentBright,
  labelColor = colors.accentBright,
  iconSize,
  style,
}: BackLinkProps) {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t("common.back");
  const resolvedA11y = accessibilityLabel ?? resolvedLabel;
  const resolvedIconSize = iconSize ?? (iconOnly ? 20 : 12);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={resolvedA11y}
      hitSlop={12}
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        iconOnly && styles.rootIconOnly,
        inCtaRow && styles.rootInCtaRow,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.row}>
        <Ionicons
          name="chevron-back"
          size={resolvedIconSize}
          color={iconColor}
        />
        {!iconOnly ? (
          <Text style={[styles.label, { color: labelColor }]}>{resolvedLabel}</Text>
        ) : null}
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
  rootIconOnly: {
    marginBottom: 0,
  },
  rootInCtaRow: {
    marginLeft: 0,
    marginBottom: 0,
    paddingVertical: 0,
    paddingRight: 0,
    alignSelf: 'center',
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
