import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors } from '../../theme';

type StepDotsProps = {
  count: number;
  current: number;
};

function useAnimatedValues(count: number) {
  const store = useRef<Animated.Value[]>([]);

  if (store.current.length < count) {
    for (let i = store.current.length; i < count; i += 1) {
      store.current.push(new Animated.Value(0));
    }
  }

  return useMemo(() => store.current.slice(0, count), [count]);
}

/**
 * Индикатор этапов регистрации: светящиеся точки в стиле фона-созвездия,
 * растянутые на всю ширину и соединённые линиями. Пройденные/текущая горят
 * ярко и слегка пульсируют, будущие — приглушены.
 */
export function StepDots({ count, current }: StepDotsProps) {
  const safeCount = Math.max(count, 1);
  const lit = useAnimatedValues(safeCount);
  const pulse = useAnimatedValues(safeCount);
  const fills = useAnimatedValues(Math.max(safeCount - 1, 0));

  useEffect(() => {
    const dotAnims = lit.map((value, index) =>
      Animated.timing(value, {
        toValue: index <= current ? 1 : 0,
        duration: 360,
        useNativeDriver: true,
      }),
    );
    const lineAnims = fills.map((value, index) =>
      Animated.timing(value, {
        toValue: index < current ? 1 : 0,
        duration: 420,
        useNativeDriver: false,
      }),
    );
    Animated.parallel([...dotAnims, ...lineAnims]).start();
  }, [current, lit, fills]);

  useEffect(() => {
    const loops = pulse.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 1300 + index * 130,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 1300 + index * 130,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [pulse]);

  return (
    <View style={styles.row} accessibilityRole="progressbar">
      {lit.map((value, index) => {
        const pulseValue = pulse[index];
        const opacity = value.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
        const baseScale = value.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1] });
        const pulseScale = pulseValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.16],
        });
        const scale = Animated.multiply(baseScale, pulseScale);
        const glowOpacity = Animated.multiply(
          value.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] }),
          pulseValue.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }),
        );

        const isLast = index === safeCount - 1;
        const lineFill = fills[index];

        return (
          <View
            key={`dot-${index}`}
            style={[styles.segment, isLast && styles.segmentLast]}
          >
            <View style={styles.dotWrap}>
              <Animated.View
                pointerEvents="none"
                style={[styles.glow, { opacity: glowOpacity, transform: [{ scale }] }]}
              />
              <Animated.View
                style={[styles.dot, { opacity, transform: [{ scale }] }]}
              />
            </View>

            {lineFill ? (
              <View style={styles.lineTrack}>
                <Animated.View
                  style={[
                    styles.lineFill,
                    {
                      opacity: lineFill.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ]}
                />
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const DOT = 10;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  segmentLast: {
    flex: 0,
  },
  dotWrap: {
    width: DOT,
    height: DOT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: DOT * 2.6,
    height: DOT * 2.6,
    borderRadius: DOT * 1.3,
    backgroundColor: colors.accentGlow,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: '#ffffff',
  },
  lineTrack: {
    flex: 1,
    height: 2,
    marginHorizontal: 6,
    borderRadius: 1,
    backgroundColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  lineFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 1,
    backgroundColor: colors.accentBright,
  },
});
