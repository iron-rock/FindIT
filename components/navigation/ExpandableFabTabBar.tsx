import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FabRouteGlyph } from '../icons/FabRouteGlyph';
import type { MainTabParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

const FAB = 54;
const GAP = 12;
/** Совпадает с длительностью `Animated.parallel` закрытия вспомогательных кнопок */
const FAB_CLOSE_DURATION_MS = 160;

/** Целевой размер «иконки таба» в якорном FAB (до масштаба логотипа внутри FabRouteGlyph). */
const ANCHOR_TAB_ICON_DP = 30;
const ANCHOR_CLOSE_ICON_DP = 30;

const ANCHOR_GLYPH_FADE_MS = 300;
const ANCHOR_GLYPH_FADE_IN_DELAY_MS = 40;

type TabName = keyof MainTabParamList;

function accessibilityLabelForRoute(route: TabName): string {
  switch (route) {
    case 'CandidateSwipe':
      return 'Лента анкет';
    case 'Chats':
      return 'Чаты';
    case 'Profile':
      return 'Профиль';
  }
}

/**
 * При раскрытии FAB показываем два экрана, на которых пользователь СЕЙЧАС НЕ находится:
 * — на главной (лента): сверху профиль, слева чаты;
 * — в профиле: сверху главная, слева чаты;
 * — в чатах: сверху главная, слева профиль.
 */
function auxiliarySlots(focused: TabName | undefined): {
  above: TabName;
  left: TabName;
} {
  switch (focused) {
    case 'CandidateSwipe':
      return { above: 'Profile', left: 'Chats' };
    case 'Profile':
      return { above: 'CandidateSwipe', left: 'Chats' };
    case 'Chats':
      return { above: 'CandidateSwipe', left: 'Profile' };
    default:
      return { above: 'Profile', left: 'Chats' };
  }
}

/**
 * FAB справа снизу. Затемнение под кластером кнопок — не Modal.
 */
export function ExpandableFabTabBar({ state, navigation }: BottomTabBarProps) {
  const [open, setOpen] = useState(false);
  /** Пока `false`, на якоре держим `close`, пока докручивается анимация сворачивания */
  const [collapsedIconReady, setCollapsedIconReady] = useState(true);
  const routeWhenMenuOpened = useRef<TabName | undefined>(undefined);
  const insets = useSafeAreaInsets();

  const bottomPad = useMemo(
    () => Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8) + 6,
    [insets.bottom],
  );
  const rightPad = 18;

  const focused = state.routes[state.index]?.name as TabName | undefined;

  const slotBasis: TabName | undefined =
    open || !collapsedIconReady ? routeWhenMenuOpened.current ?? focused : focused;
  const { above, left } = useMemo(() => auxiliarySlots(slotBasis), [slotBasis]);

  const isActive = (name: TabName) => focused === name;

  const beginCloseFab = () => {
    setCollapsedIconReady(false);
    setOpen(false);
  };

  const beginOpenFab = () => {
    routeWhenMenuOpened.current = focused;
    setOpen(true);
  };

  const navigateTo = (name: TabName) => {
    navigation.navigate(name);
    beginCloseFab();
  };

  const aboveAnim = useRef(new Animated.Value(0)).current;
  const leftAnim = useRef(new Animated.Value(0)).current;
  const glyphLayerOpacity = useRef(new Animated.Value(1)).current;
  const closeLayerOpacity = useRef(new Animated.Value(0)).current;
  const anchorFadeInitDoneRef = useRef(false);

  useEffect(() => {
    if (open) {
      setCollapsedIconReady(false);
      aboveAnim.setValue(0);
      leftAnim.setValue(0);
      Animated.stagger(54, [
        Animated.spring(aboveAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 76,
        }),
        Animated.spring(leftAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 76,
        }),
      ]).start();
      return;
    }

    let cancelled = false;
    Animated.parallel([
      Animated.timing(aboveAnim, {
        toValue: 0,
        duration: FAB_CLOSE_DURATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(leftAnim, {
        toValue: 0,
        duration: FAB_CLOSE_DURATION_MS,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished && !cancelled) {
        requestAnimationFrame(() => setCollapsedIconReady(true));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [open, aboveAnim, leftAnim]);

  useEffect(() => {
    const closeMenuGlyph = open || !collapsedIconReady;

    if (!anchorFadeInitDoneRef.current) {
      anchorFadeInitDoneRef.current = true;
      glyphLayerOpacity.setValue(closeMenuGlyph ? 0 : 1);
      closeLayerOpacity.setValue(closeMenuGlyph ? 1 : 0);
      return;
    }

    glyphLayerOpacity.stopAnimation();
    closeLayerOpacity.stopAnimation();

    if (closeMenuGlyph) {
      Animated.parallel([
        Animated.timing(closeLayerOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(glyphLayerOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(closeLayerOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.sequence([
        Animated.delay(ANCHOR_GLYPH_FADE_IN_DELAY_MS),
        Animated.timing(glyphLayerOpacity, {
          toValue: 1,
          duration: ANCHOR_GLYPH_FADE_MS,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]),
    ]).start();
  }, [
    open,
    collapsedIconReady,
    glyphLayerOpacity,
    closeLayerOpacity,
  ]);

  const aboveMotionStyle = useMemo(
    () => ({
      opacity: aboveAnim,
      transform: [
        {
          translateY: aboveAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [FAB * 0.35, 0],
          }),
        },
        {
          scale: aboveAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.82, 1],
          }),
        },
      ],
    }),
    [aboveAnim],
  );

  const leftMotionStyle = useMemo(
    () => ({
      opacity: leftAnim,
      transform: [
        {
          translateX: leftAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [FAB * 0.45, 0],
          }),
        },
        {
          scale: leftAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.82, 1],
          }),
        },
      ],
    }),
    [leftAnim],
  );

  const closedMenuHint = `${accessibilityLabelForRoute(above)} и ${accessibilityLabelForRoute(left)}`;

  const showCloseGlyph = open || !collapsedIconReady;

  const mainAccessibilityLabel = showCloseGlyph
    ? 'Закрыть меню'
    : focused === 'CandidateSwipe'
      ? `Меню: ${closedMenuHint}`
      : `Открыть меню: ${closedMenuHint}`;

  const sizeAbove =
    above === 'CandidateSwipe' ? 29 : above === 'Chats' ? 25 : 26;
  const sizeLeft =
    left === 'CandidateSwipe' ? 29 : left === 'Chats' ? 25 : 26;

  return (
    <View pointerEvents="box-none" style={styles.layer}>
      {open ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Закрыть меню"
          style={styles.backdropHit}
          onPress={beginCloseFab}
        />
      ) : null}

      <View
        pointerEvents="box-none"
        style={[
          styles.cluster,
          {
            bottom: bottomPad,
            right: rightPad,
            height: FAB * 2 + GAP,
            width: FAB * 2 + GAP,
          },
        ]}
      >
        <Animated.View pointerEvents={open ? 'box-none' : 'none'} style={[styles.aboveSlot, aboveMotionStyle]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabelForRoute(above)}
            disabled={!open}
            hitSlop={8}
            onPress={() => navigateTo(above)}
            style={({ pressed }) => [
              styles.roundBtn,
              isActive(above) && styles.roundBtnFocused,
              pressed && styles.roundBtnPressed,
            ]}
          >
            <FabRouteGlyph route={above} size={sizeAbove} />
          </Pressable>
        </Animated.View>

        <Animated.View pointerEvents={open ? 'box-none' : 'none'} style={[styles.leftSlot, leftMotionStyle]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabelForRoute(left)}
            disabled={!open}
            hitSlop={8}
            onPress={() => navigateTo(left)}
            style={({ pressed }) => [
              styles.roundBtn,
              isActive(left) && styles.roundBtnFocused,
              pressed && styles.roundBtnPressed,
            ]}
          >
            <FabRouteGlyph route={left} size={sizeLeft} />
          </Pressable>
        </Animated.View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={mainAccessibilityLabel}
          hitSlop={6}
          onPress={() => {
            if (open) beginCloseFab();
            else beginOpenFab();
          }}
          style={({ pressed }) => [
            styles.roundBtn,
            styles.anchorFab,
            !open && collapsedIconReady && !!focused && styles.roundBtnFocused,
            pressed && styles.roundBtnPressed,
          ]}
        >
          <View style={styles.anchorGlyphStack} pointerEvents="none">
            <Animated.View style={[styles.anchorGlyphLayer, { opacity: glyphLayerOpacity }]}>
              <FabRouteGlyph route={focused ?? 'CandidateSwipe'} size={ANCHOR_TAB_ICON_DP} />
            </Animated.View>
            <Animated.View style={[styles.anchorGlyphLayer, { opacity: closeLayerOpacity }]}>
              <Ionicons name="close" size={ANCHOR_CLOSE_ICON_DP} color={colors.textPrimary} />
            </Animated.View>
          </View>
        </Pressable>
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
  backdropHit: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 10, 24, 0.42)',
    zIndex: 0,
  },
  cluster: {
    position: 'absolute',
    pointerEvents: 'box-none',
    zIndex: 20,
    elevation: 28,
  },
  anchorFab: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'ios' ? 0.38 : 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 16,
  },
  aboveSlot: {
    position: 'absolute',
    right: 0,
    bottom: FAB + GAP,
  },
  leftSlot: {
    position: 'absolute',
    right: FAB + GAP,
    bottom: 0,
  },
  roundBtn: {
    width: FAB,
    height: FAB,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.interactive,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  roundBtnFocused: {
    borderColor: 'rgba(255,255,255,0.45)',
    backgroundColor: colors.interactivePressed,
  },
  roundBtnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.96 }],
  },
  anchorGlyphStack: {
    width: FAB,
    height: FAB,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anchorGlyphLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
