import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, font, Text } from '../../theme';
import { outlineRadius, outlineSurface } from '../../theme/surface';

const SHOW_MS = 1800;
const ANIM_IN_MS = 280;
const ANIM_OUT_MS = 220;
/** Темновато-зелёный для текста успеха. */
const SUCCESS_TEXT = '#6bb88a';

type SuccessToastProps = {
  /** Инкремент токена — каждый показ. 0 = скрыт. */
  token: number;
  topInset: number;
  onHide?: () => void;
};

/**
 * Единый toast успеха: сверху, outline-блок, плавный slide+fade.
 */
export function SuccessToast({ token, topInset, onHide }: SuccessToastProps) {
  const { t } = useTranslation();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (token <= 0) {
      return;
    }

    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }

    opacity.setValue(0);
    translateY.setValue(-12);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIM_IN_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIM_IN_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    hideTimer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: ANIM_OUT_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -8,
          duration: ANIM_OUT_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          onHide?.();
        }
      });
    }, SHOW_MS);

    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, [token, opacity, translateY, onHide]);

  if (token <= 0) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[styles.host, { paddingTop: topInset + 8 }]}
    >
      <Animated.View
        style={[
          outlineSurface(outlineRadius),
          styles.toast,
          { opacity, transform: [{ translateY }] },
        ]}
      >
        <Text style={styles.label}>{t('common.success')}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    zIndex: 100,
  },
  toast: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    minWidth: 140,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: SUCCESS_TEXT,
    letterSpacing: 0.4,
    ...font('600'),
  },
});
