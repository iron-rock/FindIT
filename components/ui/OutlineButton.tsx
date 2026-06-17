import { Pressable, StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import {
  outlineBorderPressed,
  outlineFill,
  outlineRadius,
  outlineSurface,
} from '../../theme/surface';
import { colors, font, Text } from '../../theme';

type OutlineButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

/** Кнопка с outline-рамкой (единый стиль Welcome и главных экранов). */
export function OutlineButton({
  title,
  onPress,
  disabled = false,
  radius = outlineRadius,
  style,
  textStyle,
}: OutlineButtonProps) {
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
            outlineSurface(radius),
            styles.surface,
            pressed && outlineBorderPressed,
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
    backgroundColor: outlineFill,
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
