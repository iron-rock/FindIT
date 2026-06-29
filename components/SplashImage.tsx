import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { colors } from '../theme/colors';

const SPLASH_SOURCE = require('../assets/Splash.png');

/** Длительность сплеша до начала затухания. */
const SPLASH_DURATION_MS = 3000;
/** Длительность плавного затухания в конце. */
const FADE_OUT_MS = 600;

type SplashImageProps = {
  onFinish: () => void;
};

/** Полноэкранный статичный сплеш поверх приложения; вызывает onFinish по завершении. */
export function SplashImage({ onFinish }: SplashImageProps) {
  const finishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  const opacity = useRef(new Animated.Value(1)).current;

  onFinishRef.current = onFinish;

  useEffect(() => {
    const finishOnce = () => {
      if (finishedRef.current) {
        return;
      }
      finishedRef.current = true;
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }).start(() => onFinishRef.current());
    };

    const timer = setTimeout(finishOnce, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [opacity]);

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="none">
      <Image
        source={SPLASH_SOURCE}
        style={styles.image}
        contentFit="cover"
        accessibilityIgnoresInvertColors
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    zIndex: 1000,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
