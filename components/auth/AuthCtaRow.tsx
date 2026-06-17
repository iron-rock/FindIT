import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { BackLink } from '../navigation/BackLink';
import { colors, font, Text } from '../../theme';
import {
  outlineBorder,
  outlineBorderPressed,
  outlineFill,
  outlineRadius,
  outlineSurface,
} from '../../theme/surface';

type AuthCtaRowProps = {
  title: string;
  onPress: () => void;
  onBack: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** «Назад» слева на одной линии с основной CTA-кнопкой шага. */
export function AuthCtaRow({
  title,
  onPress,
  onBack,
  disabled = false,
  style,
}: AuthCtaRowProps) {
  const { t } = useTranslation();

  return (
    <View style={[styles.row, style]}>
      <View style={styles.backSlot}>
        <BackLink
          iconOnly
          inCtaRow
          accessibilityLabel={t('common.back')}
          iconColor={colors.textPrimary}
          onPress={onBack}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        disabled={disabled}
        onPress={onPress}
        style={[styles.ctaPressable, disabled && styles.ctaDisabled]}
      >
        {({ pressed }) => (
          <View
            style={[
              outlineSurface(outlineRadius, styles.ctaSurface),
              pressed && outlineBorderPressed,
            ]}
          >
            <Text style={styles.ctaText}>{title}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const CTA_HEIGHT = 48;
const BACK_SLOT = 48;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 10,
  },
  backSlot: {
    width: BACK_SLOT,
    height: CTA_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: outlineRadius,
    backgroundColor: outlineFill,
    ...outlineBorder,
  },
  ctaPressable: {
    flex: 1,
    minHeight: CTA_HEIGHT,
  },
  ctaSurface: {
    flex: 1,
    minHeight: CTA_HEIGHT,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: {
    opacity: 0.45,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    textAlign: 'center',
    ...font('500'),
  },
});
