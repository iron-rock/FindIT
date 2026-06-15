import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { colors } from '../theme/colors';

const SPLASH_SOURCE = require('../assets/SplashIntro.mp4');

/** Длительность сплеша до начала затухания. */
const SPLASH_DURATION_MS = 3000;
/** Длительность плавного затухания в конце. */
const FADE_OUT_MS = 600;

type SplashVideoProps = {
  onFinish: () => void;
};

/** Полноэкранный видео-сплеш поверх приложения; вызывает onFinish по завершении. */
export function SplashVideo({ onFinish }: SplashVideoProps) {
  const finishedRef = useRef(false);
  const playbackStartedRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  const opacity = useRef(new Animated.Value(1)).current;

  onFinishRef.current = onFinish;

  const player = useVideoPlayer(SPLASH_SOURCE, (instance) => {
    instance.loop = false;
    instance.muted = true;
    instance.volume = 0;
  });

  useEffect(() => {
    const finishOnce = () => {
      if (finishedRef.current) {
        return;
      }
      finishedRef.current = true;
      player.pause();
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }).start(() => onFinishRef.current());
    };

    const startPlaybackOnce = () => {
      if (finishedRef.current || playbackStartedRef.current) {
        return;
      }
      if (player.status !== 'readyToPlay') {
        return;
      }
      playbackStartedRef.current = true;
      player.play();
    };

    const statusSub = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') {
        startPlaybackOnce();
      } else if (status === 'error') {
        finishOnce();
      }
    });

    startPlaybackOnce();

    const timer = setTimeout(finishOnce, SPLASH_DURATION_MS);

    return () => {
      statusSub.remove();
      clearTimeout(timer);
    };
  }, [opacity, player]);

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
