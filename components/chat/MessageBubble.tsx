import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import type { ChatMessage } from '../../lib/chat';
import { colors, Text } from '../../theme';
import { outlineRadius } from '../../theme/surface';

type MessageBubbleProps = {
  message: ChatMessage;
  isOwn: boolean;
  onImagePress?: (uri: string) => void;
};

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message, isOwn, onImagePress }: MessageBubbleProps) {
  const imageUri = message.localImageUri ?? message.imageUrl;
  const showImage = message.kind === 'image' && imageUri;
  const showText = message.body.trim().length > 0;

  return (
    <View style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}>
      <View
        style={[
          styles.bubble,
          isOwn ? styles.bubbleOwn : styles.bubbleOther,
          showImage && !showText && styles.bubbleImageOnly,
        ]}
      >
        {showImage ? (
          <Pressable
            accessibilityRole="imagebutton"
            accessibilityLabel="Open image"
            onPress={() => onImagePress?.(imageUri)}
          >
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          </Pressable>
        ) : null}
        {showText ? (
          <Text style={[styles.body, isOwn ? styles.bodyOwn : styles.bodyOther]}>
            {message.body}
          </Text>
        ) : null}
        <Text style={[styles.time, isOwn ? styles.timeOwn : styles.timeOther]}>
          {formatTime(message.createdAt)}
          {message.pending ? ' · …' : ''}
        </Text>
      </View>
    </View>
  );
}

const BUBBLE_MAX = '82%';
const IMAGE_SIZE = 220;
/** Свои сообщения — на тон светлее `colors.interactive` (#243652). */
const OWN_BUBBLE_BG = '#33496b';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingHorizontal: 12,
  },
  rowOwn: {
    justifyContent: 'flex-end',
  },
  rowOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: BUBBLE_MAX,
    borderRadius: outlineRadius + 10,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    gap: 4,
  },
  bubbleOwn: {
    backgroundColor: OWN_BUBBLE_BG,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  bubbleImageOnly: {
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
  },
  bodyOwn: {
    color: colors.textPrimary,
  },
  bodyOther: {
    color: colors.textPrimary,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: outlineRadius + 6,
    backgroundColor: colors.surfaceMuted,
  },
  time: {
    fontSize: 11,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  timeOwn: {
    color: 'rgba(255, 255, 255, 0.55)',
  },
  timeOther: {
    color: colors.textMuted,
  },
});
