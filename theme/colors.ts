/**
 * Статичная палитра FindIT (React Native / Expo).
 * Базовый тёмный #051630; #1a2b45 — поверхности; интерактив на 1–2 тона светлее для кнопок и акцентов.
 */
export const colors = {
  /** Основной фон экранов */
  background: '#051630',
  /** Промежуточный тон (между фоном и surface) */
  surfaceMuted: '#0f2440',
  /** Карточки, инпуты, панели */
  surface: '#1a2b45',
  /** Кнопки, активные заливки, primary interactive */
  interactive: '#243652',
  /** Нажатое состояние / чуть ярче hover */
  interactivePressed: '#2d4158',

  textPrimary: '#ffffff',
  textMuted: 'rgba(255, 255, 255, 0.72)',
  /** Затемнение поверх фоновых изображений */
  overlayScrim: 'rgba(5, 22, 48, 0.78)',
  borderSubtle: 'rgba(255, 255, 255, 0.14)',

  /** Акцент свечения (точки/линии на фоне, glow-кнопки) */
  accent: '#5eb8e8',
  accentBright: '#8fd3ff',
  /** Полупрозрачное свечение для теней/ореолов */
  accentGlow: 'rgba(120, 200, 255, 0.55)',
} as const;

export type Colors = typeof colors;
