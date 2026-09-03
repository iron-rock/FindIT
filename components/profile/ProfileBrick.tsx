import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, font, Text } from '../../theme';
import {
  chromeFill,
  chromeFillGlow,
  chromeRadius,
  chromeSurface,
  softSurface,
  softSurfacePressed,
  outlineRadius,
} from '../../theme/surface';

const EXPAND_MS = 300;

type ProfileBrickProps = {
  title: string;
  children: ReactNode;
  preEdit?: boolean;
  editing?: boolean;
  dirty?: boolean;
  /** Общий 0…1 пульс PreEdit с хаба (синхрон с шапкой). */
  glowProgress?: Animated.Value | Animated.AnimatedInterpolation<number>;
  onSelect?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
};

/**
 * Кирпич профиля — chrome-заливка как у карандаша, без рамки.
 * Edit: раскрытие сверху вниз; закрытие — обратная анимация, затем колбэк.
 */
export function ProfileBrick({
  title,
  children,
  preEdit = false,
  editing = false,
  dirty = false,
  glowProgress,
  onSelect,
  onSave,
  onCancel,
}: ProfileBrickProps) {
  const { t } = useTranslation();
  const expand = useRef(new Animated.Value(editing ? 1 : 0)).current;
  const closing = useRef(false);

  useEffect(() => {
    if (!editing) {
      if (!closing.current) {
        expand.setValue(0);
      }
      return;
    }
    closing.current = false;
    expand.setValue(0);
    Animated.timing(expand, {
      toValue: 1,
      duration: EXPAND_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [editing, expand]);

  const runCloseThen = (cb?: () => void) => {
    if (closing.current) {
      return;
    }
    closing.current = true;
    Animated.timing(expand, {
      toValue: 0,
      duration: EXPAND_MS,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        closing.current = false;
        return;
      }
      cb?.();
      closing.current = false;
    });
  };

  const showGlow = preEdit && !editing && Boolean(glowProgress);
  const selectable = showGlow && Boolean(onSelect);

  const bgColor =
    showGlow && glowProgress
      ? glowProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [chromeFill, chromeFillGlow],
        })
      : chromeFill;

  const bodyStyle = editing
    ? {
        opacity: expand.interpolate({
          inputRange: [0, 0.35, 1],
          outputRange: [0, 0.55, 1],
        }),
        transform: [
          {
            translateY: expand.interpolate({
              inputRange: [0, 1],
              outputRange: [-28, 0],
            }),
          },
        ],
      }
    : null;

  const header = (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {editing ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={dirty ? t('common.save') : t('common.cancel')}
          onPress={() => runCloseThen(dirty ? onSave : onCancel)}
          style={({ pressed }) => [
            softSurface(outlineRadius),
            styles.actionBtn,
            pressed && softSurfacePressed,
          ]}
        >
          <Ionicons
            name={dirty ? 'checkmark' : 'close'}
            size={20}
            color={colors.textPrimary}
          />
        </Pressable>
      ) : null}
    </View>
  );

  const body = (
    <Animated.View
      style={[styles.body, editing ? bodyStyle : null]}
      pointerEvents={selectable ? 'none' : 'auto'}
    >
      {children}
    </Animated.View>
  );

  const content = (
    <>
      {header}
      {body}
    </>
  );

  if (showGlow) {
    return (
      <Animated.View
        style={[
          chromeSurface(chromeRadius),
          styles.surfaceBase,
          { backgroundColor: bgColor },
        ]}
      >
        {selectable ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={title}
            onPress={onSelect}
            style={({ pressed }) => [styles.pressFill, pressed && styles.pressed]}
          >
            {content}
          </Pressable>
        ) : (
          content
        )}
      </Animated.View>
    );
  }

  return (
    <View
      style={[
        chromeSurface(chromeRadius),
        styles.surfaceBase,
        editing && styles.surfaceEditing,
      ]}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  surfaceBase: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  surfaceEditing: {
    overflow: 'visible',
    zIndex: 30,
    elevation: 30,
  },
  pressFill: {
    marginHorizontal: -16,
    marginTop: -14,
    marginBottom: -14,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    minHeight: 28,
  },
  title: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
    paddingRight: 8,
    ...font('500'),
  },
  actionBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
  body: {
    gap: 10,
    overflow: 'visible',
  },
});
