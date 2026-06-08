import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { useTranslation } from "react-i18next";

import type { UserRole } from "../../navigation/types";
import { colors, font, Text } from "../../theme";
import { GlassSurface, glassButtonRadius } from "../ui/GlassSurface";

type RoleToggleProps = {
  /** Выбранная роль; null — ещё ничего не выбрано. */
  role: UserRole | null;
  onChange: (role: UserRole) => void;
};

/**
 * Сегментированный переключатель роли (recruiter | finder) на «стекле».
 * Бегунок плавно переезжает к выбранной стороне.
 */
export function RoleToggle({ role, onChange }: RoleToggleProps) {
  const { t } = useTranslation();
  const [width, setWidth] = useState(0);
  const anim = useRef(new Animated.Value(role === "finder" ? 1 : 0)).current;

  useEffect(() => {
    if (!role) {
      return;
    }
    Animated.spring(anim, {
      toValue: role === "finder" ? 1 : 0,
      useNativeDriver: true,
      friction: 9,
      tension: 80,
    }).start();
  }, [role, anim]);

  const half = width / 2;
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, half],
  });

  const onLayout = (event: LayoutChangeEvent) =>
    setWidth(event.nativeEvent.layout.width);

  return (
    <GlassSurface radius={glassButtonRadius} style={styles.toggle} onLayout={onLayout}>
      {width > 0 && role ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.thumb,
            {
              width: half - 4,
              borderRadius: glassButtonRadius - 2,
              transform: [{ translateX }],
            },
          ]}
        />
      ) : null}

      <ToggleOption
        active={role === "recruiter"}
        label={t("roles.recruiter")}
        onPress={() => onChange("recruiter")}
      />
      <ToggleOption
        active={role === "finder"}
        label={t("roles.finder")}
        onPress={() => onChange("finder")}
      />
    </GlassSurface>
  );
}

type ToggleOptionProps = {
  active: boolean;
  label: string;
  onPress: () => void;
};

function ToggleOption({ active, label, onPress }: ToggleOptionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.option}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: "row",
  },
  thumb: {
    position: "absolute",
    top: 2,
    bottom: 2,
    left: 2,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
  option: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "400",
    color: colors.textMuted,
    ...font("400"),
  },
  labelActive: {
    color: colors.textPrimary,
    fontWeight: "500",
    ...font("500"),
  },
});
