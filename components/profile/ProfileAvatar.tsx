import { Image } from 'expo-image';
import { Animated, StyleSheet, View } from 'react-native';

import { colors, Text } from '../../theme';
import {
  outlineBorderColor,
  outlineBorderWidth,
  outlineRadiusAvatar,
} from '../../theme/surface';

type ProfileAvatarProps = {
  name: string;
  size?: number;
  /** Локальный / remote URI фото; иначе инициалы. */
  uri?: string;
  /** Переопределение радиуса (по умолчанию squircle профиля). */
  radius?: number;
  /** Цвет рамки (строка или Animated — для glow в PreEdit). */
  borderColor?: string | Animated.AnimatedInterpolation<string | number>;
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

export function ProfileAvatar({
  name,
  size = 64,
  uri,
  radius = outlineRadiusAvatar,
  borderColor,
}: ProfileAvatarProps) {
  const fontSize = size >= 100 ? 32 : size >= 80 ? 26 : size >= 64 ? 22 : 18;
  const resolvedRadius = Math.min(radius, size / 2);
  const photo = uri?.trim();
  const animated = borderColor != null && typeof borderColor !== 'string';

  const inner = photo ? (
    <Image
      source={{ uri: photo }}
      style={{ width: size, height: size, borderRadius: resolvedRadius }}
      contentFit="cover"
      transition={200}
    />
  ) : (
    <Text style={[styles.letters, { fontSize }]}>{initialsFromName(name)}</Text>
  );

  const sizeStyle = {
    width: size,
    height: size,
    borderRadius: resolvedRadius,
    borderWidth: outlineBorderWidth,
    backgroundColor: colors.surface,
  };

  if (animated) {
    return (
      <Animated.View
        accessibilityLabel={name}
        style={[
          styles.avatar,
          sizeStyle,
          { borderColor: borderColor as Animated.AnimatedInterpolation<string> },
        ]}
      >
        {inner}
      </Animated.View>
    );
  }

  return (
    <View
      accessibilityLabel={name}
      style={[
        styles.avatar,
        sizeStyle,
        { borderColor: (borderColor as string | undefined) ?? outlineBorderColor },
      ]}
    >
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  letters: {
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
});
