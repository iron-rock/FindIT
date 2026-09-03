import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import type { ReactNode } from "react";
import {
  Platform,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import {
  outlineBorderColor,
  outlineBorderColorFocused,
  outlineBorderWidth,
  outlineBorderWidthFocused,
  outlineRadius,
} from "../../theme/surface";

const isIOS = Platform.OS === "ios";

/**
 * iOS 26+ с активным Liquid Glass; иначе на iOS — blur-стекло, на Android —
 * полупрозрачная поверхность. try/catch — на случай dev-билда без вшитого
 * нативного модуля ExpoGlassEffect.
 */
export const useLiquidGlass = ((): boolean => {
  if (!isIOS) {
    return false;
  }
  try {
    return isLiquidGlassAvailable();
  } catch {
    return false;
  }
})();

/** Радиусы «стекла» по режимам — общие для кнопок и инпутов. */
export const glassButtonRadius = useLiquidGlass ? 14 : isIOS ? 10 : 8;
export const glassInputRadius = useLiquidGlass ? 12 : isIOS ? 8 : 8;
/** Минимальный радиус рамки на экранах входа/регистрации (как кнопка «Регистрация» на welcome). */
export const glassAuthRadius = outlineRadius;

type GlassSurfaceProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  /** Состояние нажатия — рисует мягкую белую подсветку (как обычный клик). */
  pressed?: boolean;
  /** Яркая рамка-подсветка (для сфокусированного инпута). */
  highlight?: boolean;
  /** Переопределение цвета рамки (например белая на tab bar). */
  borderColor?: string;
  /** Без outline-рамки (tab bar, full-bleed строки списка). */
  borderless?: boolean;
  /**
   * `auto` — Liquid Glass если доступен (таб-бар, единичные контролы).
   * `static` — только Blur / тёмная заливка: для списков и нескольких панелей
   * на экране. Стек Liquid Glass белеет и «залипает» active на соседних View.
   */
  effect?: 'auto' | 'static';
  onLayout?: (event: LayoutChangeEvent) => void;
};

/**
 * Универсальная «стеклянная» поверхность — тот же эффект, что на велком-экране.
 * Кладёт стекло (Liquid Glass / blur / поверхность) и рисует тонкую рамку.
 *
 * Важно: не используем нативный isInteractive у Liquid Glass — он даёт слишком
 * яркое «сияние», которое вспыхивает белым во время переходов между экранами.
 * Вместо него — управляемая мягкая белая подсветка по нажатию.
 */
export function GlassSurface({
  children,
  style,
  radius = glassButtonRadius,
  pressed = false,
  highlight = false,
  borderColor,
  borderless = false,
  effect = 'auto',
  onLayout,
}: GlassSurfaceProps) {
  const ringColor =
    borderColor ?? (highlight ? outlineBorderColorFocused : outlineBorderColor);
  const allowLiquid = effect === 'auto' && useLiquidGlass;

  const ring = borderless ? null : (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        {
          borderRadius: radius,
          borderWidth: highlight ? outlineBorderWidthFocused : outlineBorderWidth,
          borderColor: ringColor,
        },
      ]}
    />
  );

  const pressOverlay = pressed ? (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, styles.pressOverlay, { borderRadius: radius }]}
    />
  ) : null;

  if (allowLiquid) {
    return (
      <GlassView
        glassEffectStyle="regular"
        colorScheme="dark"
        isInteractive={false}
        onLayout={onLayout}
        style={[
          styles.clip,
          { borderRadius: radius },
          style,
          pressed && styles.scalePressed,
        ]}
      >
        {ring}
        {children}
        {pressOverlay}
      </GlassView>
    );
  }

  if (isIOS) {
    return (
      <View
        onLayout={onLayout}
        style={[
          styles.iosGlass,
          { borderRadius: radius },
          style,
          pressed && styles.scalePressed,
        ]}
      >
        <BlurView
          intensity={40}
          tint="systemThinMaterialDark"
          style={StyleSheet.absoluteFill}
        />
        {ring}
        {children}
        {pressOverlay}
      </View>
    );
  }

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.androidSurface,
        { borderRadius: radius },
        style,
        pressed && styles.scalePressed,
      ]}
    >
      {ring}
      {children}
      {pressOverlay}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: "hidden",
  },
  iosGlass: {
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  androidSurface: {
    backgroundColor: "rgba(26, 43, 69, 0.7)",
  },
  scalePressed: {
    transform: [{ scale: 0.99 }],
  },
  pressOverlay: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
});
