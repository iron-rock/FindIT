import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';

import type { Vacancy } from '../../data/vacancies';
import { colors, Text } from '../../theme';
import { outlineBlock, outlineRadius } from '../../theme/surface';

const SCREEN_W = Dimensions.get('window').width;
const ROT_MAX_DEG = 11;
const SWIPE_THRESHOLD = SCREEN_W * 0.22;
const SWIPE_OFF = SCREEN_W * 1.35;

export type VacancySwipeCardProps = {
  vacancy: Vacancy;
  onAgree: () => void;
  onDecline: () => void;
};

export function VacancySwipeCard({ vacancy, onAgree, onDecline }: VacancySwipeCardProps) {
  const tx = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    tx.setValue(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- смена только по id вакансии
  }, [vacancy.id]);

  const agreeOpacity = useMemo(
    () =>
      tx.interpolate({
        inputRange: [0, SWIPE_THRESHOLD],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }),
    [tx],
  );

  const declineOpacity = useMemo(
    () =>
      tx.interpolate({
        inputRange: [-SWIPE_THRESHOLD, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      }),
    [tx],
  );

  const rotate = useMemo(
    () =>
      tx.interpolate({
        inputRange: [-SCREEN_W / 2, SCREEN_W / 2],
        outputRange: [`-${ROT_MAX_DEG}deg`, `${ROT_MAX_DEG}deg`],
        extrapolate: 'clamp',
      }),
    [tx],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy) * 0.7,
        onPanResponderMove: (_, g) => {
          tx.setValue(g.dx);
        },
        onPanResponderRelease: (_, g) => {
          const dx = g.dx;
          if (dx > SWIPE_THRESHOLD) {
            Animated.timing(tx, {
              toValue: SWIPE_OFF,
              duration: 220,
              useNativeDriver: true,
            }).start(() => onAgree());
            return;
          }
          if (dx < -SWIPE_THRESHOLD) {
            Animated.timing(tx, {
              toValue: -SWIPE_OFF,
              duration: 220,
              useNativeDriver: true,
            }).start(() => onDecline());
            return;
          }
          Animated.spring(tx, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
            speed: 24,
          }).start();
        },
      }),
    [onAgree, onDecline, tx],
  );

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.wrapper,
        { transform: [{ translateX: tx }, { rotate }] },
      ]}
      accessibilityRole="none"
    >
      <Animated.Text style={[styles.floatAgree, { opacity: agreeOpacity }]} pointerEvents="none">
        Интерес
      </Animated.Text>
      <Animated.Text style={[styles.floatDecline, { opacity: declineOpacity }]} pointerEvents="none">
        Пропуск
      </Animated.Text>
      <View style={styles.card}>
        <Text style={styles.company}>{vacancy.company}</Text>
        <Text style={styles.title}>{vacancy.title}</Text>
        <Text style={styles.grade}>{vacancy.grade}</Text>
        <View style={styles.tags}>
          {vacancy.stack.slice(0, 4).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.meta}>{vacancy.salaryRange}</Text>
        <Text style={styles.meta}>{vacancy.locationFormat}</Text>
        <Text style={styles.about} numberOfLines={4}>
          {vacancy.about}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: '100%',
    width: '100%',
    zIndex: 2,
  },
  floatAgree: {
    position: 'absolute',
    top: 18,
    right: 22,
    zIndex: 3,
    fontSize: 22,
    fontWeight: '800',
    color: 'rgba(120, 220, 170, 1)',
    transform: [{ rotate: '12deg' }],
  },
  floatDecline: {
    position: 'absolute',
    top: 18,
    left: 22,
    zIndex: 3,
    fontSize: 22,
    fontWeight: '800',
    color: 'rgba(245, 130, 130, 1)',
    transform: [{ rotate: '-12deg' }],
  },
  card: {
    flex: 1,
    padding: 22,
    gap: 8,
    ...outlineBlock(outlineRadius),
  },
  company: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 23,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 28,
  },
  grade: {
    fontSize: 15,
    color: colors.textMuted,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: outlineRadius,
    backgroundColor: colors.surfaceMuted,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  about: {
    marginTop: 6,
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
});
