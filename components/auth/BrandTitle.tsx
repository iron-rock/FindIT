import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type TextStyle } from 'react-native';

import { font } from '../../theme';

/**
 * Анимированный логотип-заголовок «FindIT».
 * Сначала буквы полностью невидимы, затем медленно загораются по одной из
 * прозрачного в белый, держатся белыми, потом по очереди гаснут — цикл
 * повторяется.
 */

type Letter = { ch: string; weight: '300' | '500' | '600' | '700' };

const LETTERS: Letter[] = [
  { ch: 'F', weight: '700' },
  { ch: 'i', weight: '500' },
  { ch: 'n', weight: '500' },
  { ch: 'd', weight: '500' },
  { ch: 'I', weight: '700' },
  { ch: 'T', weight: '700' },
];

const N = LETTERS.length;
const LIGHTUP_MS = 2400;
const HOLD_MS = 6000;
const OFF_MS = 1600;
const TOTAL = LIGHTUP_MS + HOLD_MS + OFF_MS;
const LETTER_DUR = 620;

const OFF_COLOR = 'rgba(255, 255, 255, 0.08)';
const ON_COLOR = 'rgba(255, 255, 255, 1)';

type BrandTitleProps = {
  fontSize?: number;
};

export function BrandTitle({ fontSize = 52 }: BrandTitleProps) {
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
          outputRange: [0, 14, 14, 0],
          extrapolate: 'clamp',
        });

        const letterStyle: Animated.WithAnimatedObject<TextStyle> = {
          fontSize,
          color,
          textShadowColor: 'rgba(143, 211, 255, 0.9)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: glow,
          ...font(letter.weight),
        };

        return (
          <Animated.Text
            key={`${letter.ch}-${index}`}
            allowFontScaling={false}
            style={[styles.letter, letterStyle]}
          >
            {letter.ch}
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
  },
  letter: {
    letterSpacing: -1,
    includeFontPadding: false,
    overflow: 'visible',
    // Свечение (textShadowRadius) на Android обрезается по рамке самого Text —
    // даём внутренний запас под радиус тени и стягиваем буквы отрицательным
    // margin, чтобы слово осталось плотным.
    paddingHorizontal: 15,
    paddingVertical: 16,
    marginHorizontal: -14,
  },
});
