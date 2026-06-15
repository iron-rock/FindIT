import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { devSignIn, devSignOut, readAccountRole, setAccountRole } from '../../lib/devAuth';
import { isSupabaseConfigured } from '../../lib/supabase';
import { colors } from '../../theme/colors';

const TAB_WIDTH = 30;
const TAB_HEIGHT = 88;
const ACTIONS_SIDE_PADDING = 8;
const ACTIONS_WIDTH = 34 * 2 + 6 + ACTIONS_SIDE_PADDING * 2;
const CORNER_MARGIN = 8;
const DRAG_THRESHOLD = 6;

type DevAction = 'finder' | 'recruiter' | 'login' | 'logout' | null;
type PanelCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

function isLeftCorner(corner: PanelCorner): boolean {
  return corner.endsWith('left');
}

function getNearestCorner(
  x: number,
  y: number,
  width: number,
  height: number,
): PanelCorner {
  const horizontal = x < width / 2 ? 'left' : 'right';
  const vertical = y < height / 2 ? 'top' : 'bottom';
  return `${vertical}-${horizontal}` as PanelCorner;
}

function getCornerAnchorStyle(
  corner: PanelCorner,
  insets: { top: number; bottom: number },
): ViewStyle {
  const vertical: ViewStyle = corner.startsWith('top')
    ? { top: insets.top + CORNER_MARGIN }
    : { bottom: insets.bottom + CORNER_MARGIN };

  const horizontal: ViewStyle = corner.endsWith('right') ? { right: 0 } : { left: 0 };

  return { position: 'absolute', ...vertical, ...horizontal };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function DevIconButton({
  icon,
  active,
  disabled,
  onPress,
  accessibilityLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconBtn,
        active && styles.iconBtnActive,
        pressed && !disabled && styles.iconBtnPressed,
        disabled && styles.iconBtnDisabled,
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={disabled ? colors.textMuted : active ? '#8fd3ff' : colors.textPrimary}
      />
    </Pressable>
  );
}

export function DevPanel() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { user } = useSupabaseAuth();
  const [busyAction, setBusyAction] = useState<DevAction>(null);
  const [expanded, setExpanded] = useState(false);
  const [corner, setCorner] = useState<PanelCorner>('top-right');
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [tabPressed, setTabPressed] = useState(false);

  const expandedRef = useRef(expanded);
  expandedRef.current = expanded;

  const didDragRef = useRef(false);
  const contentOffset = useRef(new Animated.Value(ACTIONS_WIDTH)).current;

  const closedOffset = isLeftCorner(corner) ? -ACTIONS_WIDTH : ACTIONS_WIDTH;

  const setOpen = useCallback(
    (open: boolean) => {
      setExpanded(open);
      Animated.spring(contentOffset, {
        toValue: open ? 0 : closedOffset,
        useNativeDriver: true,
        bounciness: 0,
        speed: 24,
      }).start();
    },
    [closedOffset, contentOffset],
  );

  const toggle = useCallback(() => {
    setOpen(!expandedRef.current);
  }, [setOpen]);

  const clampDragPosition = useCallback(
    (x: number, y: number) => ({
      x: clamp(x - TAB_WIDTH / 2, 0, screenWidth - TAB_WIDTH),
      y: clamp(
        y - TAB_HEIGHT / 2,
        insets.top + CORNER_MARGIN,
        screenHeight - insets.bottom - CORNER_MARGIN - TAB_HEIGHT,
      ),
    }),
    [insets.bottom, insets.top, screenHeight, screenWidth],
  );

  const snapToCorner = useCallback(
    (x: number, y: number) => {
      const nextCorner = getNearestCorner(x, y, screenWidth, screenHeight);
      setCorner(nextCorner);
      setDragPos(null);

      if (expandedRef.current) {
        return;
      }

      const nextClosed = isLeftCorner(nextCorner) ? -ACTIONS_WIDTH : ACTIONS_WIDTH;
      contentOffset.setValue(nextClosed);
    },
    [contentOffset, screenHeight, screenWidth],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !expandedRef.current,
        onMoveShouldSetPanResponder: (_, gesture) =>
          !expandedRef.current &&
          (Math.abs(gesture.dx) > DRAG_THRESHOLD || Math.abs(gesture.dy) > DRAG_THRESHOLD),
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          didDragRef.current = false;
          setTabPressed(true);
        },
        onPanResponderMove: (_, gesture) => {
          if (
            Math.abs(gesture.dx) <= DRAG_THRESHOLD &&
            Math.abs(gesture.dy) <= DRAG_THRESHOLD
          ) {
            return;
          }

          didDragRef.current = true;
          setDragPos(clampDragPosition(gesture.moveX, gesture.moveY));
        },
        onPanResponderRelease: (_, gesture) => {
          setTabPressed(false);

          if (didDragRef.current) {
            snapToCorner(gesture.moveX, gesture.moveY);
            return;
          }

          toggle();
        },
        onPanResponderTerminate: () => {
          setTabPressed(false);
          setDragPos(null);
        },
      }),
    [clampDragPosition, snapToCorner, toggle],
  );

  const runAction = useCallback(async (action: DevAction, fn: () => Promise<void>) => {
    if (!isSupabaseConfigured) {
      Alert.alert('Dev', 'Supabase не настроен: URL + publishable key в .env');
      return;
    }
    setBusyAction(action);
    try {
      await fn();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      Alert.alert('Dev', message);
    } finally {
      setBusyAction(null);
    }
  }, []);

  if (!__DEV__) {
    return null;
  }

  const currentRole = readAccountRole(user);
  const onLeft = isLeftCorner(corner);
  const anchorStyle = dragPos
    ? { position: 'absolute' as const, left: dragPos.x, top: dragPos.y }
    : getCornerAnchorStyle(corner, insets);

  const tabStyle = [
    styles.tab,
    onLeft ? styles.tabLeft : styles.tabRight,
    expanded && (onLeft ? styles.tabOpenLeft : styles.tabOpenRight),
    tabPressed && styles.tabPressed,
  ];

  const tabNode = expanded ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Свернуть dev-панель"
      onPress={toggle}
      style={({ pressed }) => [...tabStyle, pressed && styles.tabPressed]}
    >
      <Ionicons
        name={onLeft ? 'chevron-back' : 'chevron-forward'}
        size={16}
        color={colors.textPrimary}
      />
    </Pressable>
  ) : (
    <View
      accessibilityRole="button"
      accessibilityLabel="Открыть dev-панель. Перетащите в угол экрана"
      {...panResponder.panHandlers}
      style={tabStyle}
    >
      <Ionicons name="code-slash" size={16} color={colors.textPrimary} />
    </View>
  );

  const contentNode = (
    <Animated.View
      pointerEvents={expanded ? 'auto' : 'none'}
      style={[
        styles.contentClip,
        !expanded && styles.contentClipCollapsed,
        { transform: [{ translateX: contentOffset }] },
      ]}
    >
      <View style={[styles.content, onLeft ? styles.contentLeft : styles.contentRight]}>
        {busyAction ? (
          <ActivityIndicator color={colors.textPrimary} style={styles.loader} />
        ) : null}

        <View style={styles.actionsRow}>
          <DevIconButton
            icon="search"
            active={currentRole === 'finder'}
            disabled={busyAction !== null}
            accessibilityLabel="Роль finder"
            onPress={() =>
              runAction('finder', async () => {
                await setAccountRole('finder');
              })
            }
          />
          <DevIconButton
            icon="briefcase-outline"
            active={currentRole === 'recruiter'}
            disabled={busyAction !== null}
            accessibilityLabel="Роль recruiter"
            onPress={() =>
              runAction('recruiter', async () => {
                await setAccountRole('recruiter');
              })
            }
          />
        </View>

        <View style={styles.actionsRow}>
          <DevIconButton
            icon="log-in-outline"
            disabled={busyAction !== null || !!user}
            accessibilityLabel="Войти"
            onPress={() =>
              runAction('login', async () => {
                await devSignIn();
              })
            }
          />
          <DevIconButton
            icon="log-out-outline"
            disabled={busyAction !== null || !user}
            accessibilityLabel="Выйти"
            onPress={() => runAction('logout', devSignOut)}
          />
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View pointerEvents="box-none" style={styles.host}>
      {expanded ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Закрыть dev-панель"
          style={styles.backdrop}
          onPress={() => setOpen(false)}
        />
      ) : null}

      <View style={[styles.panelAnchor, anchorStyle]}>
        {onLeft ? (
          <>
            {tabNode}
            {contentNode}
          </>
        ) : (
          <>
            {contentNode}
            {tabNode}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  panelAnchor: {
    flexDirection: 'row',
    alignItems: 'stretch',
    zIndex: 2,
  },
  contentClip: {
    width: ACTIONS_WIDTH,
    overflow: 'hidden',
  },
  contentClipCollapsed: {
    width: 0,
  },
  content: {
    width: ACTIONS_WIDTH,
    paddingVertical: 8,
    paddingHorizontal: ACTIONS_SIDE_PADDING,
    gap: 6,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  contentRight: {
    borderRightWidth: 0,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  contentLeft: {
    borderLeftWidth: 0,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
  },
  tab: {
    width: TAB_WIDTH,
    minHeight: TAB_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.interactive,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  tabRight: {
    borderLeftWidth: 0,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  tabLeft: {
    borderRightWidth: 0,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  tabOpenRight: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  tabOpenLeft: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  tabPressed: {
    backgroundColor: colors.interactivePressed,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  iconBtnActive: {
    borderColor: '#5eb8e8',
    backgroundColor: colors.interactive,
  },
  iconBtnPressed: {
    backgroundColor: colors.interactivePressed,
  },
  iconBtnDisabled: {
    opacity: 0.45,
  },
  loader: {
    position: 'absolute',
    top: 4,
    alignSelf: 'center',
  },
});
