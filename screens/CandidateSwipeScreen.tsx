import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CandidateSwipeCard } from "../components/swipe/CandidateSwipeCard";
import { VacancySwipeCard } from "../components/swipe/VacancySwipeCard";
import { candidateAnkety } from "../data/candidateAnkety";
import { vacancies } from "../data/vacancies";
import { useMainSession } from "../navigation/MainSessionContext";
import type { MainTabParamList } from "../navigation/types";
import { colors, Text } from "../theme";
import {
  outlineBlock,
  outlineBorder,
  outlineBorderPressed,
  outlineRadius,
} from "../theme/surface";

const FILTERS_ICON = require("../assets/settings-v2.png");
const FILTER_HEADER_BTN_H = 44;
const FILTER_MARGIN_BOTTOM = 10;
const CARD_TOP_GAP = 10;
const LEGACY_CARD_HEIGHT_RATIO = 0.62;

export type CandidateSwipeScreenProps = BottomTabScreenProps<
  MainTabParamList,
  "CandidateSwipe"
>;

export function CandidateSwipeScreen(_props: CandidateSwipeScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { role } = useMainSession();
  const [index, setIndex] = useState(0);

  const isFinder = role === "finder";
  const deckLength = isFinder ? vacancies.length : candidateAnkety.length;

  useEffect(() => {
    setIndex(0);
  }, [role]);

  const currentCandidate = !isFinder ? candidateAnkety[index] : undefined;
  const nextCandidate = !isFinder ? candidateAnkety[index + 1] : undefined;
  const currentVacancy = isFinder ? vacancies[index] : undefined;
  const nextVacancy = isFinder ? vacancies[index + 1] : undefined;

  const advance = useCallback(() => {
    setIndex((i) => Math.min(i + 1, deckLength));
  }, [deckLength]);

  const rewind = () => setIndex(0);

  const empty = isFinder ? !currentVacancy : !currentCandidate;
  const topPad = Math.max(insets.top, 10);
  const { height: windowH } = useWindowDimensions();

  const cardLayout = useMemo(() => {
    const stackBottomPad = Math.max(insets.bottom, 14);
    const filterBottomY = topPad + FILTER_HEADER_BTN_H + FILTER_MARGIN_BOTTOM;
    const stackInnerH = windowH - filterBottomY - stackBottomPad;
    const legacyCardH = windowH * LEGACY_CARD_HEIGHT_RATIO;
    const cardBottomInset = stackBottomPad + (stackInnerH - legacyCardH) / 2;
    const cardHeight = windowH - filterBottomY - CARD_TOP_GAP - cardBottomInset;

    return { cardHeight, cardBottomInset };
  }, [insets.bottom, topPad, windowH]);

  const behindLabel = isFinder
    ? nextVacancy?.title
    : nextCandidate?.displayName;

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.filterHeaderRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("swipe.filtersA11y")}
          hitSlop={10}
          onPress={() => {}}
          style={({ pressed }) => [
            styles.filterGearBtn,
            pressed && styles.filterGearPressed,
            pressed && outlineBorderPressed,
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
            accessibilityLabel={t("swipe.locationCaption")}
            style={({ pressed }) => [
              styles.filterBlock,
              pressed && styles.filterBlockPressed,
            ]}
            onPress={() => {}}
          >
            <Text style={styles.filterBlockCaption}>{t("swipe.locationCaption")}</Text>
            <Text style={styles.filterBlockValue}>{t("swipe.locationAny")}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("swipe.positionCaption")}
            style={({ pressed }) => [
              styles.filterBlock,
              pressed && styles.filterBlockPressed,
            ]}
            onPress={() => {}}
          >
            <Text style={styles.filterBlockCaption}>{t("swipe.positionCaption")}</Text>
            <Text style={styles.filterBlockValue}>{t("swipe.positionAll")}</Text>
          </Pressable>
        </View>
      </View>

      {!empty ? (
        <View style={[styles.stackArea, { paddingTop: CARD_TOP_GAP }]}>
          {behindLabel ? (
            <View
              pointerEvents="none"
              style={[
                styles.behindWrap,
                {
                  height: cardLayout.cardHeight,
                  bottom: cardLayout.cardBottomInset,
                },
              ]}
            >
              <View style={styles.miniCard}>
                <Text style={styles.behindName}>{behindLabel}</Text>
              </View>
            </View>
          ) : null}

          <View
            style={[
              styles.foreground,
              {
                height: cardLayout.cardHeight,
                marginBottom: cardLayout.cardBottomInset,
              },
            ]}
          >
            {isFinder && currentVacancy ? (
              <VacancySwipeCard
                key={currentVacancy.id}
                vacancy={currentVacancy}
                onAgree={advance}
                onDecline={advance}
              />
            ) : null}
            {!isFinder && currentCandidate ? (
              <CandidateSwipeCard
                key={currentCandidate.id}
                candidate={currentCandidate}
                onAgree={advance}
                onDecline={advance}
              />
            ) : null}
          </View>
        </View>
      ) : (
        <View
          style={[styles.empty, { paddingBottom: Math.max(insets.bottom, 24) }]}
        >
          <Text style={styles.emptyTitle}>
            {t(isFinder ? "swipe.emptyVacanciesTitle" : "swipe.emptyTitle")}
          </Text>
          <Text style={styles.emptyText}>
            {t(isFinder ? "swipe.emptyVacanciesText" : "swipe.emptyText")}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={rewind}
            style={styles.restartBtn}
          >
            <Text style={styles.restartLabel}>{t("swipe.restart")}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceDeep,
    paddingHorizontal: 14,
  },
  filterHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  filterGearBtn: {
    width: FILTER_HEADER_BTN_H,
    height: FILTER_HEADER_BTN_H,
    borderRadius: outlineRadius,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    ...outlineBorder,
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
    borderRadius: outlineRadius,
    backgroundColor: colors.surfaceMuted,
    justifyContent: "center",
    ...outlineBorder,
  },
  filterBlockPressed: outlineBorderPressed,
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
  stackArea: {
    flex: 1,
    alignSelf: "stretch",
  },
  behindWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 0,
    opacity: 0.55,
    transform: [{ scale: 0.96 }],
  },
  miniCard: {
    flex: 1,
    padding: 22,
    backgroundColor: colors.surfaceMuted,
    ...outlineBlock(outlineRadius),
  },
  behindName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  foreground: {
    width: "100%",
    zIndex: 1,
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
