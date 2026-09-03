import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FabRouteGlyph } from "../icons/FabRouteGlyph";
import { GlassSurface } from "../ui/GlassSurface";
import { useMainSession } from "../../navigation/MainSessionContext";
import { requestLeaveProfileIfEditing } from "../../navigation/profileLeaveGuard";
import type { MainTabParamList } from "../../navigation/types";
import type { UserRole } from "../../lib/roles";
import { outlineRadiusPill, outlineRadiusTab } from "../../theme/surface";

type TabName = keyof MainTabParamList;

const TAB_ORDER: TabName[] = ["Chats", "CandidateSwipe", "Profile"];

const TAB_ICON_SIZE: Record<TabName, number> = {
  CandidateSwipe: 32,
  Chats: 25,
  Profile: 26,
};

const BAR_PAD = 7;
const TAB_WIDTH = 68;
const TAB_HEIGHT = 48;
const TAB_GAP = 10;
const TAB_STEP = TAB_WIDTH + TAB_GAP;
const EDGE_RUBBER_BAND = 0.32;
const BAR_PULSE_SCALE = 1.04;
const BAR_SCALE_MS = 320;

function springToThumb(anim: Animated.Value, toValue: number, velocity = 0) {
  Animated.spring(anim, {
    toValue,
    useNativeDriver: true,
    velocity,
    overshootClamping: false,
    friction: 10,
    tension: 120,
    restDisplacementThreshold: 0.4,
    restSpeedThreshold: 0.4,
  }).start();
}

function animateBarScale(scale: Animated.Value, toValue: number) {
  scale.stopAnimation();
  Animated.timing(scale, {
    toValue,
    duration: BAR_SCALE_MS,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();
}

function pressBarScale(scale: Animated.Value) {
  animateBarScale(scale, BAR_PULSE_SCALE);
}

function releaseBarScale(scale: Animated.Value) {
  animateBarScale(scale, 1);
}

function rubberBandX(value: number, min: number, max: number): number {
  if (value < min) {
    return min + (value - min) * EDGE_RUBBER_BAND;
  }
  if (value > max) {
    return max + (value - max) * EDGE_RUBBER_BAND;
  }
  return value;
}

function tabIndex(name: TabName | undefined): number {
  const index = TAB_ORDER.indexOf(name ?? "CandidateSwipe");
  return index >= 0 ? index : 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function accessibilityLabelForRoute(
  route: TabName,
  t: TFunction,
  role: UserRole,
): string {
  switch (route) {
    case "CandidateSwipe":
      return role === "finder"
        ? t("tabs.feedVacancies")
        : t("tabs.feedFinders");
    case "Chats":
      return t("tabs.chats");
    case "Profile":
      return t("tabs.profile");
  }
}

/** Glass pill tab bar с draggable-ползунком активной вкладки. */
export function MainTabBar({ state, navigation }: BottomTabBarProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { role } = useMainSession();

  const bottomPad =
    Math.max(insets.bottom, Platform.OS === "android" ? 12 : 8) - 12;
  const focused = state.routes[state.index]?.name as TabName | undefined;
  const focusedIdx = tabIndex(focused);

  const maxSlide = TAB_STEP * (TAB_ORDER.length - 1);
  const slideAnim = useRef(new Animated.Value(focusedIdx * TAB_STEP)).current;
  const barScale = useRef(new Animated.Value(1)).current;
  const slidePosRef = useRef(focusedIdx * TAB_STEP);
  const draggingRef = useRef(false);
  const fingerDownRef = useRef(false);
  const barHeldVisualRef = useRef(false);
  const dragStartRef = useRef(0);
  const skipNextFocusEffect = useRef(false);

  const syncDragStart = (gestureDx: number) => {
    dragStartRef.current = slidePosRef.current - gestureDx;
  };

  const updateBarHold = () => {
    const shouldHold = fingerDownRef.current || draggingRef.current;
    if (shouldHold === barHeldVisualRef.current) {
      return;
    }
    barHeldVisualRef.current = shouldHold;
    if (shouldHold) {
      pressBarScale(barScale);
    } else {
      releaseBarScale(barScale);
    }
  };

  const onBarPressIn = () => {
    fingerDownRef.current = true;
    updateBarHold();
  };

  const onBarPressOut = () => {
    if (draggingRef.current) {
      return;
    }
    fingerDownRef.current = false;
    updateBarHold();
  };

  const springThumb = (toValue: number, velocity = 0) => {
    springToThumb(slideAnim, toValue, velocity);
  };

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

    if (skipNextFocusEffect.current) {
      skipNextFocusEffect.current = false;
      return;
    }

    springThumb(focusedIdx * TAB_STEP);
  }, [focusedIdx, slideAnim, barScale]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 4 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.05,
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          Math.abs(gesture.dx) > 10 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (_, gesture) => {
          draggingRef.current = true;
          updateBarHold();
          syncDragStart(gesture.dx);
          slideAnim.stopAnimation();
        },
        onPanResponderMove: (_, gesture) => {
          const raw = dragStartRef.current + gesture.dx;
          slideAnim.setValue(rubberBandX(raw, 0, maxSlide));
        },
        onPanResponderRelease: (_, gesture) => {
          draggingRef.current = false;
          fingerDownRef.current = false;
          updateBarHold();

          const projected = clamp(
            slidePosRef.current + gesture.vx * 22,
            0,
            maxSlide,
          );
          const nextIdx = Math.round(projected / TAB_STEP);
          const targetX = nextIdx * TAB_STEP;

          skipNextFocusEffect.current = true;
          const nextName = TAB_ORDER[nextIdx];
          if (focused === "Profile" && nextName !== "Profile") {
            void requestLeaveProfileIfEditing().then((ok) => {
              if (!ok) {
                skipNextFocusEffect.current = false;
                springThumb(focusedIdx * TAB_STEP, 0);
                return;
              }
              navigation.navigate(nextName);
              springThumb(targetX, gesture.vx);
            });
            return;
          }
          navigation.navigate(nextName);

          springThumb(targetX, gesture.vx);
        },
        onPanResponderTerminate: () => {
          draggingRef.current = false;
          fingerDownRef.current = false;
          updateBarHold();
          const idx = Math.round(slidePosRef.current / TAB_STEP);
          springThumb(clamp(idx, 0, TAB_ORDER.length - 1) * TAB_STEP);
        },
      }),
    [focused, focusedIdx, maxSlide, navigation, slideAnim, barScale],
  );

  const navigateTo = (name: TabName) => {
    if (name === focused) {
      return;
    }
    if (focused === "Profile" && name !== "Profile") {
      void requestLeaveProfileIfEditing().then((ok) => {
        if (ok) {
          navigation.navigate(name);
        }
      });
      return;
    }
    navigation.navigate(name);
  };

  // Полностью прячем таб-бар внутри комнаты чата (ChatRoom).
  // Не размонтируем (display:none), чтобы растровые иконки не декодировались
  // заново при возврате на список — иначе главная иконка мигает с задержкой.
  const focusedRoute = state.routes[state.index];
  const nestedRouteName =
    focusedRoute?.name === "Chats"
      ? (getFocusedRouteNameFromRoute(focusedRoute) ?? "ChatsList")
      : undefined;
  const hidden = nestedRouteName === "ChatRoom";

  return (
    <View
      pointerEvents={hidden ? "none" : "box-none"}
      style={[styles.layer, hidden && styles.hidden]}
    >
      <View
        pointerEvents="box-none"
        style={[styles.wrap, { paddingBottom: bottomPad }]}
      >
        <Animated.View
          style={[styles.barScaleWrap, { transform: [{ scale: barScale }] }]}
        >
          <Pressable
            onPressIn={onBarPressIn}
            onPressOut={onBarPressOut}
            style={styles.barPressable}
          >
            <GlassSurface
              radius={outlineRadiusPill}
              borderless
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
                        accessibilityLabel={accessibilityLabelForRoute(
                          name,
                          t,
                          role,
                        )}
                        hitSlop={4}
                        onPressIn={onBarPressIn}
                        onPressOut={onBarPressOut}
                        onPress={() => {
                          if (draggingRef.current) {
                            return;
                          }
                          navigateTo(name);
                        }}
                        style={({ pressed }) => [
                          styles.tab,
                          pressed && styles.tabPressed,
                        ]}
                      >
                        <FabRouteGlyph
                          route={name}
                          size={TAB_ICON_SIZE[name]}
                        />
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </GlassSurface>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "box-none",
    zIndex: 100,
  },
  hidden: {
    display: "none",
  },
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    pointerEvents: "box-none",
  },
  barScaleWrap: {
    alignItems: "center",
  },
  barPressable: {
    borderRadius: outlineRadiusPill,
  },
  barGlass: {
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: Platform.OS === "ios" ? 0.28 : 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 18,
  },
  track: {
    position: "relative",
    padding: BAR_PAD,
  },
  thumbWrap: {
    position: "absolute",
    left: BAR_PAD,
    top: BAR_PAD,
    zIndex: 0,
  },
  thumb: {
    width: TAB_WIDTH,
    height: TAB_HEIGHT,
    borderRadius: outlineRadiusTab,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: TAB_GAP,
    zIndex: 1,
  },
  tab: {
    width: TAB_WIDTH,
    height: TAB_HEIGHT,
    borderRadius: outlineRadiusTab,
    alignItems: "center",
    justifyContent: "center",
  },
  tabPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
});
