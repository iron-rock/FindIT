import { useEffect, useRef } from "react";
import { Animated, StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

/**
 * Мягкое движущееся затемнение поверх фона: сверху темнее, снизу светлее,
 * вертикальный градиент медленно дрейфует — даёт ощущение «дышащей» тени.
 * Реализовано на react-native-svg (уже в проекте), без нативной пересборки.
 */
export function MovingShadowOverlay() {
  const { width, height } = useWindowDimensions();
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 7000,
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 7000,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift]);

  const gradientHeight = height * 1.3;
  const translateY = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [-height * 0.14, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, { transform: [{ translateY }] }]}
    >
      <Svg width={width} height={gradientHeight}>
        <Defs>
          <LinearGradient id="movingShadow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000308" stopOpacity={0.7} />
            <Stop offset="0.5" stopColor="#000308" stopOpacity={0.28} />
            <Stop offset="1" stopColor="#000308" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width={width}
          height={gradientHeight}
          fill="url(#movingShadow)"
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    top: -StyleSheet.hairlineWidth,
  },
});
