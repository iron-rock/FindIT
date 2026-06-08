import { StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

/**
 * Базовый «премиум»-фон как на видео-сплеше: радиальный градиент — ярче всего
 * в центре и темнота по краям. Кладётся самым нижним слоем, поверх него
 * рисуется анимация созвездия.
 *
 * Реализовано на react-native-svg (уже в проекте), чтобы не требовать
 * пересборки нативного модуля expo-linear-gradient.
 */
export function GradientBackground() {
  const { width, height } = useWindowDimensions();

  return (
    <Svg
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      width={width}
      height={height}
    >
      <Defs>
        <RadialGradient
          id="premiumBackground"
          cx={width / 2}
          cy={height * 0.42}
          r={Math.max(width, height) * 0.75}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#1B3E6B" />
          <Stop offset="0.5" stopColor="#0C2245" />
          <Stop offset="1" stopColor="#02101F" />
        </RadialGradient>
      </Defs>
      <Rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="url(#premiumBackground)"
      />
    </Svg>
  );
}
