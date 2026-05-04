import { useCallback, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CandidateSwipeCard } from "../components/swipe/CandidateSwipeCard";
import { candidateAnkety } from "../data/candidateAnkety";
import type { MainTabParamList } from "../navigation/types";
import { colors } from "../theme/colors";

const FILTERS_ICON = require("../assets/settings-v2.png");

export type CandidateSwipeScreenProps = BottomTabScreenProps<
  MainTabParamList,
  "CandidateSwipe"
>;

export function CandidateSwipeScreen(_props: CandidateSwipeScreenProps) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);

  const current = candidateAnkety[index];
  const next = candidateAnkety[index + 1];

  const advance = useCallback(() => {
    setIndex((i) => Math.min(i + 1, candidateAnkety.length));
  }, []);

  const rewind = () => setIndex(0);

  const empty = !current;
  const topPad = Math.max(insets.top, 10);

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.filterHeaderRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Фильтры поиска"
          hitSlop={10}
          onPress={() => {}}
          style={({ pressed }) => [
            styles.filterGearBtn,
            pressed && styles.filterGearPressed,
          ]}
        >
          <Image
            accessibilityIgnoresInvertColors
            source={FILTERS_ICON}
            resizeMode="contain"
            style={styles.filterGearIcon}
          />
        </Pressable>

        <View style={styles.filterBlocksWrap}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Фильтр: локация"
            style={({ pressed }) => [
              styles.filterBlock,
              pressed && styles.filterBlockPressed,
            ]}
            onPress={() => {}}
          >
            <Text style={styles.filterBlockCaption}>Локация</Text>
            <Text style={styles.filterBlockValue}>Любая</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Фильтр: позиция"
            style={({ pressed }) => [
              styles.filterBlock,
              pressed && styles.filterBlockPressed,
            ]}
            onPress={() => {}}
          >
            <Text style={styles.filterBlockCaption}>Позиция</Text>
            <Text style={styles.filterBlockValue}>Все уровни</Text>
          </Pressable>
        </View>
      </View>

      {!empty ? (
        <View
          style={[
            styles.stackArea,
            { paddingBottom: Math.max(insets.bottom, 14) },
          ]}
        >
          {next ? (
            <View style={styles.behindWrap} pointerEvents="none">
              <View style={styles.miniCard}>
                <Text style={styles.behindName}>{next.displayName}</Text>
                <Text style={styles.behindHeadline}>{next.headline}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.foreground}>
            <CandidateSwipeCard
              key={current.id}
              candidate={current}
              onAgree={advance}
              onDecline={advance}
            />
          </View>
        </View>
      ) : (
        <View
          style={[styles.empty, { paddingBottom: Math.max(insets.bottom, 24) }]}
        >
          <Text style={styles.emptyTitle}>Лента на сегодня закончилась</Text>
          <Text style={styles.emptyText}>
            Можно снова пройти доступные анкеты — когда подключится база, список
            подтянется оттуда.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={rewind}
            style={styles.restartBtn}
          >
            <Text style={styles.restartLabel}>Показать снова</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const FILTER_HEADER_BTN_H = 44;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
  },
  filterHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  filterGearBtn: {
    width: FILTER_HEADER_BTN_H,
    height: FILTER_HEADER_BTN_H,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  filterGearPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  filterGearIcon: {
    width: 24,
    height: 24,
    tintColor: colors.textPrimary,
  },
  filterBlocksWrap: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  filterBlock: {
    flex: 1,
    height: FILTER_HEADER_BTN_H,
    paddingVertical: 0,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    justifyContent: "center",
  },
  filterBlockPressed: {
    backgroundColor: colors.surface,
    borderColor: "rgba(255,255,255,0.22)",
  },
  filterBlockCaption: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.45,
    marginBottom: 2,
    lineHeight: 11,
  },
  filterBlockValue: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
    lineHeight: 14,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  screenHint: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 12,
  },
  stackArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  behindWrap: {
    position: "absolute",
    top: "8%",
    left: 14,
    right: 14,
    zIndex: 0,
    opacity: 0.72,
    transform: [{ scale: 0.9 }],
  },
  miniCard: {
    borderRadius: 22,
    padding: 20,
    minHeight: 120,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  behindName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  behindHeadline: {
    fontSize: 14,
    color: colors.textMuted,
  },
  foreground: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    gap: 14,
  },
  emptyTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320,
  },
  restartBtn: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  restartLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    textDecorationLine: "underline",
  },
});
