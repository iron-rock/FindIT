import { StyleSheet, Text, View } from "react-native";

import { colors, playfairFontFamily } from "../../theme";

const WORDMARK = "findit";

type BrandTitleProps = {
  fontSize?: number;
};

export function BrandTitle({ fontSize = 52 }: BrandTitleProps) {
  const letterGap = Math.round(fontSize * 0.12);
  const lockupPadY = Math.round(fontSize * 0.14);
  const firstLetterInset = Math.round(fontSize * 0.3);
  const lastLetterInset = Math.round(fontSize * 0.14);
  const narrowLetterInset = 5;
  const lineHeight = fontSize * 1.28;

  return (
    <View
      style={[styles.lockup, { paddingVertical: lockupPadY }]}
      accessibilityRole="header"
      accessibilityLabel="findit"
    >
      <View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={[styles.titleWrap, { gap: letterGap }]}
      >
        {WORDMARK.split("").map((letter, index) => (
          <View key={`${letter}-${index}`} style={styles.letterCell}>
            <Text
              allowFontScaling={false}
              accessible={false}
              style={[
                styles.letter,
                { fontSize, lineHeight },
                index === 0 && {
                  paddingHorizontal: firstLetterInset,
                  marginHorizontal: -firstLetterInset,
                },
                index === WORDMARK.length - 1 && {
                  paddingRight: lastLetterInset,
                  marginRight: -lastLetterInset,
                },
                letter === "i" && {
                  paddingHorizontal: narrowLetterInset,
                  marginHorizontal: -narrowLetterInset,
                },
              ]}
            >
              {letter}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lockup: {
    alignItems: "center",
    alignSelf: "center",
    overflow: "visible",
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  letterCell: {
    overflow: "visible",
    flexShrink: 0,
  },
  letter: {
    color: colors.textPrimary,
    fontFamily: playfairFontFamily.semiBoldItalic,
    includeFontPadding: false,
  },
});
