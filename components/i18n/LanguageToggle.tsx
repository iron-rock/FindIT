import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { toggleAppLanguage } from '../../lib/i18n';
import { colors, Text } from '../../theme';

/** Компактная кнопка переключения языка ru ⇄ en — стили как у GlowButton на Welcome. */
export function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const [busy, setBusy] = useState(false);
  const glow = useRef(new Animated.Value(0)).current;

  const current = i18n.language === 'ru' ? 'RU' : 'EN';
  const next = i18n.language === 'ru' ? 'EN' : 'RU';

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glow]);

  const haloOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.18],
  });

  const onPress = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      await toggleAppLanguage();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Animated.View
        pointerEvents="none"
        style={[styles.halo, { opacity: haloOpacity }]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.switchLanguage', { lang: next })}
        hitSlop={10}
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Ionicons name="language-outline" size={15} color={colors.textPrimary} />
        <Text style={styles.label}>{current}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-end',
    position: 'relative',
  },
  halo: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 16,
    backgroundColor: colors.accentGlow,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: 'rgba(26, 43, 69, 0.7)',
    shadowColor: '#000814',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 6,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: colors.interactivePressed,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.textPrimary,
  },
});
