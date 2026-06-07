import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

/**
 * Анимированный логотип на Welcome. Зелёный фон ролика убран в ffmpeg, яркость
 * сконвертирована в альфа-канал и сохранена как анимированный WebP — поэтому
 * сквозь логотип просвечивает фон-созвездие. WebP с альфой рендерится через
 * expo-image на iOS, Android и web (в отличие от webm/mp4).
 */
const LOGO_SOURCE = require('../assets/LogoWelcome.webp');

export const WELCOME_LOGO_SIZE = 210;

export function WelcomeLogoVideo() {
  return (
    <Image
      source={LOGO_SOURCE}
      style={styles.logo}
      contentFit="contain"
      accessible
      accessibilityLabel="FindIT"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    width: WELCOME_LOGO_SIZE,
    height: WELCOME_LOGO_SIZE,
    backgroundColor: 'transparent',
  },
});
