import { StyleSheet, View } from 'react-native';

import { ConstellationBackground } from './ConstellationBackground';
import { GradientBackground } from './GradientBackground';
import { MovingShadowOverlay } from './MovingShadowOverlay';

type AppAtmosphereProps = {
  /**
   * Затемнение поверх градиента + созвездия.
   * Welcome ≈ 0.58; основные экраны — заметно темнее.
   */
  scrimOpacity?: number;
  /** Дрейфующая тень (как на Welcome). */
  movingShadow?: boolean;
};

/**
 * Единый атмосферный фон FindIT: радиальный градиент → созвездие →
 * опциональная тень → scrim. Кладётся absolute под контент экрана.
 */
export function AppAtmosphere({
  scrimOpacity = 0.58,
  movingShadow = true,
}: AppAtmosphereProps) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <GradientBackground />
      <ConstellationBackground />
      {movingShadow ? <MovingShadowOverlay /> : null}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: `rgba(3, 14, 32, ${scrimOpacity})` },
        ]}
      />
    </View>
  );
}
