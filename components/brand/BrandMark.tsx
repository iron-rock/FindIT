import { memo, useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colors } from '../../theme';

const FIND_GLYPH = require('../../assets/Find_icon.png');
const VECTOR_LOGO = require('../../assets/Vector_logo.png');

/** У PNG-глифа большой внутренний паддинг — визуально мельче, чем Vector_logo. */
const GLYPH_SCALE = 1.58;

/** Диаметр ореола относительно размера марки. */
const GLOW_SCALE = 2.15;

type BrandMarkProps = {
  size: number;
  /** Герой Welcome: Vector_logo + ореол. Появление — снаружи (Welcome opacity). */
  glow?: boolean;
};

function BrandMarkComponent({ size, glow = false }: BrandMarkProps) {
  if (!glow) {
    const px = Math.round(size * GLYPH_SCALE);
    return (
      <Image
        accessibilityIgnoresInvertColors
        source={FIND_GLYPH}
        resizeMode="contain"
        fadeDuration={0}
        style={{ width: px, height: px, tintColor: colors.textPrimary }}
      />
    );
  }

  const glowSize = Math.round(size * GLOW_SCALE);

  return (
    <View style={[styles.heroWrap, { width: glowSize, height: glowSize }]}>
      <BrandMarkGlow diameter={glowSize} />
      <View
        style={[
          styles.logoClip,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Image
          accessibilityIgnoresInvertColors
          source={VECTOR_LOGO}
          resizeMode="cover"
          fadeDuration={0}
          style={{ width: size, height: size }}
        />
      </View>
    </View>
  );
}

type BrandMarkGlowProps = {
  diameter: number;
};

/** Ореол на весь контейнер; центр градиента = центр контейнера = центр лого. */
const BrandMarkGlow = memo(function BrandMarkGlow({ diameter }: BrandMarkGlowProps) {
  const pulse = useRef(new Animated.Value(0)).current;
  const mid = diameter / 2;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.78, 1],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { opacity }]}
    >
      <Svg width={diameter} height={diameter}>
        <Defs>
          <RadialGradient
            id="brandMarkGlow"
            cx={mid}
            cy={mid}
            r={mid}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#3D7FA8" stopOpacity={0.22} />
            <Stop offset="0.2" stopColor="#4A90B8" stopOpacity={0.28} />
            <Stop offset="0.45" stopColor={colors.accent} stopOpacity={0.18} />
            <Stop offset="0.72" stopColor={colors.accent} stopOpacity={0.06} />
            <Stop offset="1" stopColor={colors.accent} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={diameter} height={diameter} fill="url(#brandMarkGlow)" />
      </Svg>
    </Animated.View>
  );
});

export const BrandMark = memo(BrandMarkComponent);

const styles = StyleSheet.create({
  heroWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoClip: {
    overflow: 'hidden',
    zIndex: 1,
  },
});
