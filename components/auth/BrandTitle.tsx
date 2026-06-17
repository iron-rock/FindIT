import { StyleSheet, Text, View } from 'react-native';

import { playfairFontFamily } from '../../theme';

/** Статичное свечение логотипа «FindIT» (без покадровой анимации букв). */
const GLOW_RADIUS = 8;
const TITLE_COLOR = 'rgba(255, 255, 255, 1)';

type BrandTitleProps = {
  fontSize?: number;
};

export function BrandTitle({ fontSize = 52 }: BrandTitleProps) {
  return (
    <View
      style={styles.row}
      accessibilityRole="header"
      accessibilityLabel="findIT"
    >
      <Text
        allowFontScaling={false}
        style={[
          styles.title,
          {
            fontSize,
            color: TITLE_COLOR,
            fontFamily: playfairFontFamily.semiBoldItalic,
            textShadowColor: 'rgba(143, 211, 255, 0.75)',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: GLOW_RADIUS,
          },
        ]}
      >
        FindIT
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    overflow: 'visible',
    paddingHorizontal: 6,
    paddingVertical: 4,
    transform: [{ skewX: '-10deg' }],
  },
  title: {
    letterSpacing: 0,
    includeFontPadding: false,
    overflow: 'visible',
    paddingHorizontal: 15,
    paddingVertical: 16,
  },
});
