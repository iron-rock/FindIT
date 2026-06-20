import type { ViewStyle } from 'react-native';

import { colors } from '../colors';

/**
 * Единая outline-рамка FindIT — как кнопки на Welcome.
 * Импортировать отсюда для кнопок, инпутов, карточек и любых bordered-блоков.
 */

/** Скругление pill-контейнеров (tab bar и т.п.). */
export const outlineRadiusPill = 28;

/** Скругление кнопок внутри pill-контейнеров. */
export const outlineRadiusTab = 20;

/** Радиус рамки по умолчанию (кнопка «Регистрация» на welcome). */
export const outlineRadius = 4;

export const outlineBorderWidth = 1;
export const outlineBorderWidthFocused = 1.5;

export const outlineBorderColor = 'rgba(255, 255, 255, 0.22)';
export const outlineBorderColorPressed = 'rgba(255, 255, 255, 0.4)';
export const outlineBorderColorFocused = colors.accentBright;

export const outlineFill = 'transparent';

export const outlineBorder: ViewStyle = {
  borderWidth: outlineBorderWidth,
  borderColor: outlineBorderColor,
};

export const outlineBorderPressed: ViewStyle = {
  borderColor: outlineBorderColorPressed,
};

export const outlineBorderFocused: ViewStyle = {
  borderWidth: outlineBorderWidthFocused,
  borderColor: outlineBorderColorFocused,
};

/** Базовая outline-поверхность (кнопка, инпут). */
export function outlineSurface(
  radius: number = outlineRadius,
  extra?: ViewStyle,
): ViewStyle {
  return {
    ...outlineBorder,
    borderRadius: radius,
    backgroundColor: outlineFill,
    overflow: 'hidden',
    ...extra,
  };
}

/** Outline-блок с заливкой surface (карточки на главных экранах). */
export function outlineBlock(
  radius: number = outlineRadius,
  extra?: ViewStyle,
): ViewStyle {
  return {
    ...outlineBorder,
    borderRadius: radius,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...extra,
  };
}

/** Заливка секции без outline-рамки (профиль и т.п.). */
export function sectionFill(
  radius: number = outlineRadius,
  extra?: ViewStyle,
): ViewStyle {
  return {
    borderRadius: radius,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...extra,
  };
}
