/**
 * Архив: покадровая анимация букв логотипа «FindIT».
 * Раньше использовалась в `BrandTitle.tsx` — буквы по очереди загорались и гасли.
 * Оставлено закомментированным на случай возврата эффекта.
 */

/*
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type TextStyle } from 'react-native';

import { playfairFontFamily } from '../../theme';

const LETTERS = ['F', 'i', 'n', 'd', 'I', 'T'] as const;

const N = LETTERS.length;
const LIGHTUP_MS = 2400;
const HOLD_MS = 6000;
const OFF_MS = 1600;
const TOTAL = LIGHTUP_MS + HOLD_MS + OFF_MS;
const LETTER_DUR = 620;

const OFF_COLOR = 'rgba(255, 255, 255, 0.08)';
const ON_COLOR = 'rgba(255, 255, 255, 1)';

type BrandTitleAnimatedProps = {
  fontSize?: number;
};

export function BrandTitleAnimated({ fontSize = 52 }: BrandTitleAnimatedProps) {
  const m = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(m, {
        toValue: 1,
        duration: TOTAL,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [m]);

  return (
    <View
      style={styles.row}
      accessibilityRole="header"
      accessibilityLabel="findIT"
    >
      {LETTERS.map((letter, index) => {
        const lightStart = (index * (LIGHTUP_MS - LETTER_DUR)) / (N - 1);
        const lightEnd = lightStart + LETTER_DUR;
        const offStart = LIGHTUP_MS + HOLD_MS + (index * (OFF_MS - LETTER_DUR)) / (N - 1);
        const offEnd = offStart + LETTER_DUR;

        const color = m.interpolate({
          inputRange: [
            lightStart / TOTAL,
            lightEnd / TOTAL,
            offStart / TOTAL,
            offEnd / TOTAL,
          ],
          outputRange: [OFF_COLOR, ON_COLOR, ON_COLOR, OFF_COLOR],
          extrapolate: 'clamp',
        });

        const glow = m.interpolate({
          inputRange: [
            lightStart / TOTAL,
            lightEnd / TOTAL,
            offStart / TOTAL,
            offEnd / TOTAL,
          ],
          outputRange: [0, 8, 8, 0],
          extrapolate: 'clamp',
        });

        const letterStyle: Animated.WithAnimatedObject<TextStyle> = {
          fontSize,
          color,
          textShadowColor: 'rgba(143, 211, 255, 0.75)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: glow,
          fontFamily: playfairFontFamily.semiBoldItalic,
        };

        return (
          <Animated.Text
            key={`${letter}-${index}`}
            allowFontScaling={false}
            style={[styles.letter, letterStyle]}
          >
            {letter}
          </Animated.Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    overflow: 'visible',
    paddingHorizontal: 6,
    paddingVertical: 4,
    transform: [{ skewX: '-10deg' }],
  },
  letter: {
    letterSpacing: 0,
    includeFontPadding: false,
    overflow: 'visible',
    paddingHorizontal: 15,
    paddingVertical: 16,
    marginHorizontal: -14,
  },
});
*/

export {};
