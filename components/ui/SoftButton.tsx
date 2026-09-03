import { Pressable, StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import {
  outlineRadius,
  softSurface,
  softSurfacePressed,
} from '../../theme/surface';
import { colors, font, Text } from '../../theme';

type SoftButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

/**
 * Welcome soft-кнопка: тот же размер/радиус, что OutlineButton,
 * но без рамки — только полупрозрачная заливка.
 */
export function SoftButton({
  title,
  onPress,
  disabled = false,
  radius = outlineRadius,
  style,
  textStyle,
}: SoftButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled}
      onPress={onPress}
      style={[styles.pressable, style]}
    >
      {({ pressed }) => (
        <View
          style={[
            softSurface(radius),
            styles.surface,
            pressed && softSurfacePressed,
            disabled && styles.disabled,
          ]}
        >
          <Text style={[styles.label, textStyle]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignSelf: 'stretch',
  },
  surface: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    textAlign: 'center',
    ...font('500'),
  },
});
