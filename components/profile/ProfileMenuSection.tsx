import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, font, Text } from '../../theme';
import {
  chromeRadius,
  chromeSurface,
  softFillPressed,
} from '../../theme/surface';

export type ProfileMenuItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

type ProfileMenuSectionProps = {
  items: ProfileMenuItem[];
};

/**
 * C3-меню: chrome-заливка как у карандаша, без рамки.
 */
export function ProfileMenuSection({ items }: ProfileMenuSectionProps) {
  return (
    <View style={[chromeSurface(chromeRadius), styles.surface]}>
      {items.map((item, index) => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          onPress={item.onPress}
          style={({ pressed }) => [
            styles.row,
            index < items.length - 1 && styles.rowBorder,
            pressed && styles.rowPressed,
          ]}
        >
          <Ionicons name={item.icon} size={20} color={colors.textPrimary} />
          <Text style={styles.label}>{item.label}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  rowPressed: {
    backgroundColor: softFillPressed,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    ...font('500'),
  },
});
