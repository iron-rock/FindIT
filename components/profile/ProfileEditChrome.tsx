import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../../theme';
import {
  chromeFill,
  chromeFillPressed,
  chromeRadius,
} from '../../theme/surface';

const BTN = 40;

type ProfileEditChromeProps = {
  active: boolean;
  onPress: () => void;
};

/** Кнопка PreEdit: chrome-заливка, без рамки. */
export function ProfileEditChrome({ active, onPress }: ProfileEditChromeProps) {
  const { t } = useTranslation();
  const icon = active ? 'close' : 'pencil';
  const a11y = active ? t('profile.exitEdit') : t('profile.editProfile');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: pressed ? chromeFillPressed : chromeFill,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color={colors.textPrimary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: BTN,
    height: BTN,
    borderRadius: chromeRadius,
    overflow: 'hidden',
    shadowColor: '#000814',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 8,
  },
  iconWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
