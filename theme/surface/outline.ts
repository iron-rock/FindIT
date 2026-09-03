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

/** Squircle-аватар профиля (квадрат со сглаженными углами). */
export const outlineRadiusAvatar = 18;

/** Радиус панелей профиля (по умолчанию совпадает с кнопками). */
export const outlineRadiusBrick = outlineRadius;

export const outlineBorderWidth = 1;
export const outlineBorderWidthFocused = 1.5;

export const outlineBorderColor = 'rgba(255, 255, 255, 0.22)';
export const outlineBorderColorPressed = 'rgba(255, 255, 255, 0.4)';
/** Акцент focus (не для текстовых инпутов — см. welcomeOutlineBorderFocused). */
export const outlineBorderColorFocused = colors.accentBright;

/** Welcome / текстовые инпуты: полностью белые рамки (default / pressed / focused). */
export const welcomeOutlineBorderColor = colors.textPrimary;
export const welcomeOutlineBorderColorPressed = colors.textPrimary;
/** Канон focus текстовых инпутов (регистрация, профиль, стек). */
export const welcomeOutlineBorderColorFocused = colors.textPrimary;

export const outlineFill = 'transparent';

/** Welcome soft-кнопки: заливка без рамки. */
export const softFill = 'rgba(255, 255, 255, 0.08)';
export const softFillPressed = 'rgba(255, 255, 255, 0.14)';

export const outlineBorder: ViewStyle = {
  borderWidth: outlineBorderWidth,
  borderColor: outlineBorderColor,
};

export const welcomeOutlineBorder: ViewStyle = {
  borderWidth: outlineBorderWidth,
  borderColor: welcomeOutlineBorderColor,
};

export const outlineBorderPressed: ViewStyle = {
  borderColor: outlineBorderColorPressed,
};

export const welcomeOutlineBorderPressed: ViewStyle = {
  borderColor: welcomeOutlineBorderColorPressed,
};

export const outlineBorderFocused: ViewStyle = {
  borderWidth: outlineBorderWidthFocused,
  borderColor: outlineBorderColorFocused,
};

export const welcomeOutlineBorderFocused: ViewStyle = {
  borderWidth: outlineBorderWidthFocused,
  borderColor: welcomeOutlineBorderColorFocused,
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

/** Outline-поверхность Welcome — белая рамка во всех состояниях. */
export function welcomeOutlineSurface(
  radius: number = outlineRadius,
  extra?: ViewStyle,
): ViewStyle {
  return {
    ...welcomeOutlineBorder,
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

/**
 * Soft-поверхность Welcome — как кнопка outline по размеру/радиусу,
 * но без бордера (только полупрозрачная заливка).
 */
export function softSurface(
  radius: number = outlineRadius,
  extra?: ViewStyle,
): ViewStyle {
  return {
    borderRadius: radius,
    backgroundColor: softFill,
    overflow: 'hidden',
    borderWidth: 0,
    ...extra,
  };
}

export const softSurfacePressed: ViewStyle = {
  backgroundColor: softFillPressed,
};

/**
 * Soft-заливка + outline-рамка (профиль / панели).
 * Как SoftButton по прозрачности и OutlineButton по бордеру.
 */
export function softOutlineSurface(
  radius: number = outlineRadius,
  extra?: ViewStyle,
): ViewStyle {
  return {
    ...outlineBorder,
    borderRadius: radius,
    backgroundColor: softFill,
    overflow: 'hidden',
    ...extra,
  };
}

/**
 * Profile chrome — как кнопка-карандаш: холодная полупрозрачная заливка, без рамки.
 */
export const chromeFill = 'rgba(26, 43, 69, 0.72)';
export const chromeFillPressed = 'rgba(26, 43, 69, 0.88)';
/** PreEdit-пульс: едва заметно ярче базового chrome. */
export const chromeFillGlow = 'rgba(32, 58, 98, 0.82)';
export const chromeRadius = 8;

export function chromeSurface(
  radius: number = chromeRadius,
  extra?: ViewStyle,
): ViewStyle {
  return {
    backgroundColor: chromeFill,
    borderRadius: radius,
    overflow: 'hidden',
    borderWidth: 0,
    ...extra,
  };
}

export const chromeSurfacePressed: ViewStyle = {
  backgroundColor: chromeFillPressed,
};
