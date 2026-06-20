import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FabRouteGlyph } from "../icons/FabRouteGlyph";
import { GlassSurface } from "../ui/GlassSurface";
import { useMainSession } from "../../navigation/MainSessionContext";
import type { MainTabParamList } from "../../navigation/types";
import { outlineRadiusPill, outlineRadiusTab } from "../../theme/surface";

type TabName = keyof MainTabParamList;

const TAB_ORDER: TabName[] = ["Chats", "CandidateSwipe", "Profile"];

const TAB_ICON_SIZE: Record<TabName, number> = {
  CandidateSwipe: 32,
  Chats: 28,
  Profile: 29,
};

const BAR_PAD = 7;
const TAB_WIDTH = 68;
const TAB_HEIGHT = 48;
const TAB_GAP = 14;
const TAB_STEP = TAB_WIDTH + TAB_GAP;
const EDGE_RUBBER_BAND = 0.32;

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
  role: "finder" | "recruiter",
): string {
  switch (route) {
    case "CandidateSwipe":
      return role === "finder"
        ? t("tabs.feedVacancies")
        : t("tabs.feedCandidates");
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

    springToThumb(slideAnim, focusedIdx * TAB_STEP);
  }, [focusedIdx, slideAnim]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 6 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.1,
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          Math.abs(gesture.dx) > 10 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,
        onPanResponderGrant: () => {
          draggingRef.current = true;
          slideAnim.stopAnimation((value) => {
            dragStartRef.current = value;
          });
        },
        onPanResponderMove: (_, gesture) => {
          const raw = dragStartRef.current + gesture.dx;
          slideAnim.setValue(rubberBandX(raw, 0, maxSlide));
        },
        onPanResponderRelease: (_, gesture) => {
          draggingRef.current = false;

          const projected = clamp(
            slidePosRef.current + gesture.vx * 22,
            0,
            maxSlide,
          );
          const nextIdx = Math.round(projected / TAB_STEP);
          const targetX = nextIdx * TAB_STEP;

          navigation.navigate(TAB_ORDER[nextIdx]);

          springToThumb(slideAnim, targetX, gesture.vx);
        },
        onPanResponderTerminate: () => {
          draggingRef.current = false;
          springToThumb(slideAnim, focusedIdx * TAB_STEP);
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
      <View
        pointerEvents="box-none"
        style={[styles.wrap, { paddingBottom: bottomPad }]}
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
    pointerEvents: "box-none",
    zIndex: 100,
  },
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    pointerEvents: "box-none",
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
