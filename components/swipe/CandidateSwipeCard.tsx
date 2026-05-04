import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { CandidateAnketa } from '../../data/candidateAnkety';
import { colors } from '../../theme/colors';

const SCREEN_W = Dimensions.get('window').width;
const ROT_MAX_DEG = 11;
const SWIPE_THRESHOLD = SCREEN_W * 0.22;
const SWIPE_OFF = SCREEN_W * 1.35;

export type CandidateSwipeCardProps = {
  candidate: CandidateAnketa;
  onAgree: () => void;
  onDecline: () => void;
};

export function CandidateSwipeCard({
  candidate,
  onAgree,
  onDecline,
}: CandidateSwipeCardProps) {
  const tx = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    tx.setValue(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- смена только по id анкеты
  }, [candidate.id]);

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
        <View style={styles.topRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetters}>
              {candidate.displayName
                .split(' ')
                .map((p) => p[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </Text>
          </View>
          <View style={styles.topTexts}>
            <Text style={styles.name}>{candidate.displayName}</Text>
            <Text style={styles.headline}>{candidate.headline}</Text>
            <Text style={styles.meta}>
              {candidate.yearsExperience} года опыта · {candidate.locationFormat}
            </Text>
          </View>
        </View>

        <View style={styles.chipsWrap}>
          {candidate.stack.slice(0, 6).map((label) => (
            <View key={label} style={styles.chip}>
              <Text style={styles.chipText}>{label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.salary}>{candidate.salaryRange}</Text>
        <Text style={styles.about} numberOfLines={6}>
          {candidate.about}
        </Text>
        <View style={styles.highlights}>
          {candidate.highlights.map((h) => (
            <Text key={h} style={styles.highlightLine}>
              · {h}
            </Text>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: SCREEN_W - 56,
    alignSelf: 'center',
    zIndex: 2,
    borderRadius: 22,
    backgroundColor: 'transparent',
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
    borderRadius: 22,
    padding: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    minHeight: Dimensions.get('window').height * 0.62,
  },
  topRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 18,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: colors.interactivePressed,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  avatarLetters: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  topTexts: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  name: {
    fontSize: 23,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headline: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  salary: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 14,
  },
  about: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    marginBottom: 14,
  },
  highlights: {
    gap: 6,
    marginTop: 4,
  },
  highlightLine: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
    fontWeight: '500',
  },
});
