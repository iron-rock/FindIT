import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FabRouteGlyph } from '../icons/FabRouteGlyph';
import { GlassSurface } from '../ui/GlassSurface';
import type { MainTabParamList } from '../../navigation/types';
import {
  outlineRadiusPill,
  outlineRadiusTab,
} from '../../theme/surface';

type TabName = keyof MainTabParamList;

const TAB_ORDER: TabName[] = ['Chats', 'CandidateSwipe', 'Profile'];

const TAB_ICON_SIZE: Record<TabName, number> = {
  CandidateSwipe: 29,
  Chats: 25,
  Profile: 26,
};

const TAB_BAR_BORDER = 'rgba(255, 255, 255, 0.4)';
const BAR_PAD = 6;
const TAB_SIZE = 52;
const TAB_GAP = 10;
const TAB_STEP = TAB_SIZE + TAB_GAP;

function tabIndex(name: TabName | undefined): number {
  const index = TAB_ORDER.indexOf(name ?? 'CandidateSwipe');
  return index >= 0 ? index : 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function accessibilityLabelForRoute(route: TabName, t: TFunction): string {
  switch (route) {
    case 'CandidateSwipe':
      return t('tabs.feed');
    case 'Chats':
      return t('tabs.chats');
    case 'Profile':
      return t('tabs.profile');
  }
}

/** Glass pill tab bar с draggable-ползунком активной вкладки. */
export function MainTabBar({ state, navigation }: BottomTabBarProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const bottomPad = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8) + 8;
  const focused = state.routes[state.index]?.name as TabName | undefined;
  const focusedIdx = tabIndex(focused);

  const maxSlide = TAB_STEP * (TAB_ORDER.length - 1);
  const slideAnim = useRef(new Animated.Value(focusedIdx * TAB_STEP)).current;
  const slidePosRef = useRef(focusedIdx * TAB_STEP);
  const draggingRef = useRef(false);
  const dragStartRef = useRef(0);

  useEffect(() => {
    const sub = slideAnim.addListener(({ value }) => {
      slidePosRef.current = value;
    });
    return () => slideAnim.removeListener(sub);
  }, [slideAnim]);

  useEffect(() => {
    if (draggingRef.current) {
      return;
    }

    Animated.spring(slideAnim, {
      toValue: focusedIdx * TAB_STEP,
      useNativeDriver: true,
      friction: 9,
      tension: 130,
    }).start();
  }, [focusedIdx, slideAnim]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 6 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.1,
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,
        onPanResponderGrant: () => {
          draggingRef.current = true;
          slideAnim.stopAnimation((value) => {
            dragStartRef.current = value;
          });
        },
        onPanResponderMove: (_, gesture) => {
          const next = clamp(dragStartRef.current + gesture.dx, 0, maxSlide);
          slideAnim.setValue(next);
        },
        onPanResponderRelease: (_, gesture) => {
          draggingRef.current = false;

          const projected = clamp(
            slidePosRef.current + gesture.vx * 18,
            0,
            maxSlide,
          );
          const nextIdx = Math.round(projected / TAB_STEP);
          const targetX = nextIdx * TAB_STEP;

          navigation.navigate(TAB_ORDER[nextIdx]);

          Animated.spring(slideAnim, {
            toValue: targetX,
            useNativeDriver: true,
            friction: 8,
            tension: 140,
            velocity: gesture.vx,
          }).start();
        },
        onPanResponderTerminate: () => {
          draggingRef.current = false;
          Animated.spring(slideAnim, {
            toValue: focusedIdx * TAB_STEP,
            useNativeDriver: true,
            friction: 9,
            tension: 130,
          }).start();
        },
      }),
    [focusedIdx, maxSlide, navigation, slideAnim],
  );

  const navigateTo = (name: TabName) => {
    if (name === focused) {
      return;
    }
    navigation.navigate(name);
  };

  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: bottomPad }]}>
        <GlassSurface
          radius={outlineRadiusPill}
          borderColor={TAB_BAR_BORDER}
          style={styles.barGlass}
        >
          <View style={styles.track} {...panResponder.panHandlers}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.thumbWrap,
                { transform: [{ translateX: slideAnim }] },
              ]}
            >
              <View style={styles.thumb} />
            </Animated.View>

            <View style={styles.tabsRow}>
              {TAB_ORDER.map((name) => {
                const active = focused === name;

                return (
                  <Pressable
                    key={name}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={accessibilityLabelForRoute(name, t)}
                    hitSlop={4}
                    onPress={() => navigateTo(name)}
                    style={({ pressed }) => [
                      styles.tab,
                      pressed && styles.tabPressed,
                    ]}
                  >
                    <FabRouteGlyph route={name} size={TAB_ICON_SIZE[name]} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        </GlassSurface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
    zIndex: 100,
  },
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  barGlass: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'ios' ? 0.28 : 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 18,
  },
  track: {
    position: 'relative',
    padding: BAR_PAD,
  },
  thumbWrap: {
    position: 'absolute',
    left: BAR_PAD,
    top: BAR_PAD,
    zIndex: 0,
  },
  thumb: {
    width: TAB_SIZE,
    height: TAB_SIZE,
    borderRadius: outlineRadiusTab,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TAB_GAP,
    zIndex: 1,
  },
  tab: {
    width: TAB_SIZE,
    height: TAB_SIZE,
    borderRadius: outlineRadiusTab,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
});
