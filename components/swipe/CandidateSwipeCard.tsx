import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';

import type { FinderResume } from '../../data/finderResumes';
import { colors, Text } from '../../theme';
import { outlineBlock, outlineBorder, outlineRadius } from '../../theme/surface';

const SCREEN_W = Dimensions.get('window').width;
const ROT_MAX_DEG = 11;
const SWIPE_THRESHOLD = SCREEN_W * 0.22;
const SWIPE_OFF = SCREEN_W * 1.35;

export type CandidateSwipeCardProps = {
  resume: FinderResume;
  onAgree: () => void;
  onDecline: () => void;
};

export function CandidateSwipeCard({
  resume,
  onAgree,
  onDecline,
}: CandidateSwipeCardProps) {
  const tx = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    tx.setValue(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when resume changes
  }, [resume.id]);

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
            }).start(({ finished }) => {
              if (finished) onAgree();
            });
          } else if (dx < -SWIPE_THRESHOLD) {
            Animated.timing(tx, {
              toValue: -SWIPE_OFF,
              duration: 220,
              useNativeDriver: true,
            }).start(({ finished }) => {
              if (finished) onDecline();
            });
          } else {
            Animated.spring(tx, {
              toValue: 0,
              friction: 7,
              tension: 80,
              useNativeDriver: true,
            }).start();
          }
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
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetters}>
              {resume.displayName
                .split(' ')
                .map((p) => p[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{resume.displayName}</Text>
        </View>
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
    ...outlineBlock(outlineRadius),
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: outlineRadius,
    backgroundColor: colors.interactivePressed,
    alignItems: 'center',
    justifyContent: 'center',
    ...outlineBorder,
  },
  avatarLetters: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  name: {
    flex: 1,
    fontSize: 23,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
