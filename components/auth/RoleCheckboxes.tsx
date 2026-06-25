import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import type { UserRole } from "../../navigation/types";
import { colors, font, Text } from "../../theme";
import {
  outlineBorderPressed,
  outlineRadius,
  outlineSurface,
} from "../../theme/surface";
import { useAuthOutline } from "./AuthOutlineContext";

type RoleCheckboxesProps = {
  role: UserRole | null;
  onChange: (role: UserRole) => void;
  /** 'column' — карточки в столбик (по умолчанию), 'row' — рядом в один ряд. */
  layout?: "row" | "column";
  /** Меньший текст на шаге выбора роли при регистрации. */
  compact?: boolean;
};

/**
 * Выбор роли двумя «стеклянными» чекбоксами (single-select).
 * Стилистика совпадает с остальными glass-поверхностями экрана.
 */
export function RoleCheckboxes({
  role,
  onChange,
  layout = "column",
  compact = false,
}: RoleCheckboxesProps) {
  const { t } = useTranslation();
  const row = layout === "row";

  return (
    <View style={[styles.wrap, row && styles.wrapRow]}>
      <RoleCheckbox
        label={t("roles.finder")}
        // hint={t('welcome.finderHint')}
        selected={role === "finder"}
        onPress={() => onChange("finder")}
        row={row}
        compact={compact}
      />
      <RoleCheckbox
        label={t("roles.recruiter")}
        // hint={t("welcome.recruiterHint")}
        selected={role === "recruiter"}
        onPress={() => onChange("recruiter")}
        row={row}
        compact={compact}
      />
    </View>
  );
}

type RoleCheckboxProps = {
  label: string;
  hint?: string;
  selected: boolean;
  onPress: () => void;
  row?: boolean;
  compact?: boolean;
};

function RoleCheckbox({
  label,
  hint,
  selected,
  onPress,
  row = false,
  compact = false,
}: RoleCheckboxProps) {
  const { selectedBorder } = useAuthOutline();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.pressable, row && styles.pressableRow]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.card,
            outlineSurface(outlineRadius),
            row && styles.cardRow,
            compact && styles.cardCompact,
            selected && selectedBorder,
            selected && styles.cardSelected,
            pressed && outlineBorderPressed,
          ]}
        >
          <View style={[styles.box, selected && styles.boxSelected]}>
            {selected ? (
              <Ionicons name="checkmark" size={16} color={colors.background} />
            ) : null}
          </View>
          <View style={[styles.textWrap, row && styles.textWrapRow]}>
            <Text
              style={[
                styles.label,
                compact && styles.labelCompact,
                selected && styles.labelSelected,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
            {!row && hint ? (
              <Text style={styles.hint} numberOfLines={1}>
                {hint}
              </Text>
            ) : null}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  wrapRow: {
    flexDirection: "row",
    gap: 12,
  },
  pressable: {
    alignSelf: "stretch",
  },
  pressableRow: {
    flex: 1,
    alignSelf: "stretch",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  cardSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  cardCompact: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 8,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  boxSelected: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  textWrapRow: {
    flexShrink: 1,
    alignSelf: "auto",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textMuted,
    ...font("500"),
  },
  labelCompact: {
    fontSize: 13,
  },
  labelSelected: {
    color: colors.textPrimary,
  },
  hint: {
    fontSize: 13,
    fontWeight: "400",
    color: colors.textMuted,
    ...font("400"),
  },
});
