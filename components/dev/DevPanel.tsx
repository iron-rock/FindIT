import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { devSignIn, devSignOut, readAccountRole, setAccountRole } from '../../lib/devAuth';
import { isSupabaseConfigured } from '../../lib/supabase';
import { colors } from '../../theme/colors';

/** Всегда видимая кнопка-вкладка у правого края */
const TAB_WIDTH = 30;
const ACTIONS_SIDE_PADDING = 8;
const ACTIONS_WIDTH = 34 * 2 + 6 + ACTIONS_SIDE_PADDING * 2;

type DevAction = 'finder' | 'recruiter' | 'login' | 'logout' | null;

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
  const { user } = useSupabaseAuth();
  const [busyAction, setBusyAction] = useState<DevAction>(null);
  const [expanded, setExpanded] = useState(false);

  const contentOffset = useRef(new Animated.Value(ACTIONS_WIDTH)).current;

  const setOpen = useCallback(
    (open: boolean) => {
      setExpanded(open);
      Animated.spring(contentOffset, {
        toValue: open ? 0 : ACTIONS_WIDTH,
        useNativeDriver: true,
        bounciness: 0,
        speed: 24,
      }).start();
    },
    [contentOffset],
  );

  const toggle = useCallback(() => {
    setOpen(!expanded);
  }, [expanded, setOpen]);

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
  const panelTop = insets.top + 120;

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

      <View pointerEvents="box-none" style={[styles.panelAnchor, { top: panelTop }]}>
        <Animated.View
          pointerEvents={expanded ? 'auto' : 'none'}
          style={[styles.contentClip, { transform: [{ translateX: contentOffset }] }]}
        >
          <View style={styles.content}>
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

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Свернуть dev-панель' : 'Открыть dev-панель'}
          onPress={toggle}
          style={({ pressed }) => [
            styles.tab,
            expanded && styles.tabOpen,
            pressed && styles.tabPressed,
          ]}
        >
          <Ionicons
            name={expanded ? 'chevron-forward' : 'code-slash'}
            size={16}
            color={colors.textPrimary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  panelAnchor: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
    zIndex: 2,
  },
  contentClip: {
    width: ACTIONS_WIDTH,
    overflow: 'hidden',
  },
  content: {
    width: ACTIONS_WIDTH,
    paddingVertical: 8,
    paddingHorizontal: ACTIONS_SIDE_PADDING,
    gap: 6,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: colors.borderSubtle,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  tab: {
    width: TAB_WIDTH,
    minHeight: 88,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.interactive,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: colors.borderSubtle,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  tabOpen: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
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
