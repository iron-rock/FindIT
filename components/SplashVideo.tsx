import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { colors } from '../theme/colors';

const SPLASH_SOURCE = require('../assets/SplashFinal_clean.mp4');

/** Подстраховка: если событие окончания не пришло, скрываем сплеш принудительно. */
const MAX_DURATION_MS = 8000;
/** Длительность плавного затухания в конце. */
const FADE_OUT_MS = 600;

type SplashVideoProps = {
  onFinish: () => void;
};

/** Полноэкранный видео-сплеш поверх приложения; вызывает onFinish по завершении. */
export function SplashVideo({ onFinish }: SplashVideoProps) {
  const finishedRef = useRef(false);
  const opacity = useRef(new Animated.Value(1)).current;

  const player = useVideoPlayer(SPLASH_SOURCE, (instance) => {
    instance.loop = false;
    instance.muted = true;
    // Не запускаем сразу: ждём, пока появится первый кадр (см. statusChange).
  });

  const finishOnce = useCallback(() => {
    if (finishedRef.current) {
      return;
    }
    finishedRef.current = true;
    Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_OUT_MS,
      useNativeDriver: true,
    }).start(() => onFinish());
  }, [opacity, onFinish]);

  useEffect(() => {
    // Как только видео готово (первый кадр уже виден) — даём ему «подержаться»
    // статичным мгновение и запускаем воспроизведение.
    const statusSub = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') {
        player.play();
      } else if (status === 'error') {
        finishOnce();
      }
    });
    if (player.status === 'readyToPlay') {
      player.play();
    }

    const endSub = player.addListener('playToEnd', finishOnce);
    const fallback = setTimeout(finishOnce, MAX_DURATION_MS);

    return () => {
      statusSub.remove();
      endSub.remove();
      clearTimeout(fallback);
    };
  }, [player, finishOnce]);

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="none">
      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"
        nativeControls={false}
        fullscreenOptions={{ enable: false }}
        allowsPictureInPicture={false}
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
  video: {
    flex: 1,
  },
});
