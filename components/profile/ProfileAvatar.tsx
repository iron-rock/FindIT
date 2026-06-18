import { StyleSheet, View } from 'react-native';

import { colors, Text } from '../../theme';
import { outlineBlock, outlineRadius } from '../../theme/surface';

type ProfileAvatarProps = {
  name: string;
  size?: number;
};

function initialsFromName(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ProfileAvatar({ name, size = 64 }: ProfileAvatarProps) {
  const fontSize = size >= 80 ? 26 : size >= 64 ? 22 : 18;

  return (
    <View
      accessibilityLabel={name}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: outlineRadius },
      ]}
    >
      <Text style={[styles.letters, { fontSize }]}>{initialsFromName(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    ...outlineBlock(outlineRadius),
  },
  letters: {
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
});
