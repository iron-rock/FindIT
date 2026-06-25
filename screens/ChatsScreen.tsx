import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileAvatar } from '../components/profile/ProfileAvatar';
import { fetchConversations, type ConversationPreview } from '../lib/chat';
import type { ChatsStackParamList } from '../navigation/types';
import { colors, Text } from '../theme';
import { outlineRadius } from '../theme/surface';

const AVATAR_SIZE = 52;
const ROW_PAD_H = 20;
const ROW_GAP = 14;
const DIVIDER_INSET = ROW_PAD_H + AVATAR_SIZE + ROW_GAP;

const GRID_COLS = 3;
const GRID_PAD = 12;
const GRID_GAP = 5;
/** Высота блока относительно ширины — выше, чем шире. */
const CELL_ASPECT = 1.48;
const TEXT_BLOCK_H = 40;

type ChatContact = {
  id: string;
  name: string;
  stack: string[];
};

/** Контакты для сетки 3×3; позже — мэтчи / избранное с сервера. */
const CHAT_CONTACTS: ChatContact[] = [
  { id: 'p1', name: 'Алексей Петров', stack: ['TypeScript', 'React Native', 'Expo'] },
  { id: 'p2', name: 'Дарья Соколова', stack: ['Go', 'PostgreSQL', 'Kafka'] },
  { id: 'p3', name: 'Иван Ким', stack: ['Next.js', 'Node', 'Prisma'] },
  { id: 'p4', name: 'Милана В.', stack: ['Figma', 'React', 'Motion'] },
  { id: 'p5', name: 'Никита Орлов', stack: ['Python', 'PyTorch', 'FastAPI'] },
  { id: 'p6', name: 'Олег Морозов', stack: ['Terraform', 'AWS', 'K8s'] },
  { id: 'p7', name: 'София Ли', stack: ['Swift', 'SwiftUI', 'Combine'] },
  { id: 'p8', name: 'Артём Г.', stack: ['Kotlin', 'Compose', 'Coroutines'] },
  { id: 'p9', name: 'Елена Р.', stack: ['Playwright', 'TypeScript', 'CI'] },
];

function formatStack(stack: string[]): string {
  return stack.join(' · ');
}

function initialsFromName(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

type ChatContactTileProps = {
  contact: ChatContact;
  width: number;
  height: number;
};

function ChatContactTile({ contact, width, height }: ChatContactTileProps) {
  const initialsSize = Math.round(width * 0.38);

  return (
    <View
      accessibilityLabel={contact.name}
      style={[styles.contactCell, { width, height }]}
    >
      <View style={styles.contactAvatarLayer}>
        <Text style={[styles.contactInitials, { fontSize: initialsSize }]}>
          {initialsFromName(contact.name)}
        </Text>
      </View>
      <View style={styles.contactOverlay}>
        <Text
          style={styles.contactName}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.72}
        >
          {contact.name}
        </Text>
        <Text
          style={styles.contactStack}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
        >
          {formatStack(contact.stack)}
        </Text>
      </View>
    </View>
  );
}

export type ChatsScreenProps = NativeStackScreenProps<ChatsStackParamList, 'ChatsList'>;

export function ChatsScreen({ navigation }: ChatsScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const topPad = Math.max(insets.top, 10) + 16;
  const [threads, setThreads] = useState<ConversationPreview[]>([]);

  const loadThreads = useCallback(async () => {
    const data = await fetchConversations();
    setThreads(data);
  }, []);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  const openChat = useCallback(
    (thread: ConversationPreview) => {
      navigation.navigate('ChatRoom', {
        conversationId: thread.id,
        counterpartName: thread.counterpartName,
      });
    },
    [navigation],
  );

  const cellWidth =
    (screenW - GRID_PAD * 2 - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS;
  const cellHeight = cellWidth * CELL_ASPECT;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: 140 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad }]}>
        <Text style={styles.title}>{t('chats.title')}</Text>
      </View>

      <View style={styles.contactsSection}>
        <View style={styles.contactsGrid}>
          {CHAT_CONTACTS.map((contact) => (
            <ChatContactTile
              key={contact.id}
              contact={contact}
              width={cellWidth}
              height={cellHeight}
            />
          ))}
        </View>
      </View>

      <View style={styles.listBlock}>
        {threads.map((item, index) => (
          <View key={item.id}>
            <Pressable
              accessibilityRole="button"
              onPress={() => openChat(item)}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <ProfileAvatar name={item.counterpartName} size={AVATAR_SIZE} />
              <View style={styles.rowBody}>
                <View style={styles.rowTop}>
                  <Text style={styles.threadTitle} numberOfLines={1}>
                    {item.counterpartName}
                  </Text>
                  <Text style={styles.threadDate}>{item.dateLabel}</Text>
                </View>
                <Text style={styles.threadPreview} numberOfLines={2}>
                  {item.lastMessagePreview}
                </Text>
              </View>
            </Pressable>
            {index < threads.length - 1 ? (
              <View style={styles.separator}>
                <View style={styles.separatorLine} />
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceDeep,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'flex-start',
    paddingHorizontal: GRID_PAD,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  contactsSection: {
    paddingBottom: 10,
  },
  contactsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    paddingHorizontal: GRID_PAD,
  },
  contactCell: {
    overflow: 'hidden',
    position: 'relative',
    borderRadius: outlineRadius,
    backgroundColor: colors.surface,
  },
  contactAvatarLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInitials: {
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
    opacity: 0.35,
  },
  contactOverlay: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 8,
    height: TEXT_BLOCK_H,
    justifyContent: 'flex-end',
    gap: 1,
  },
  contactName: {
    height: 14,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    textShadowColor: 'rgba(5, 22, 48, 0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  contactStack: {
    height: 24,
    fontSize: 10,
    lineHeight: 12,
    color: colors.textMuted,
    textAlign: 'center',
    textShadowColor: 'rgba(5, 22, 48, 0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  listBlock: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: ROW_GAP,
    paddingHorizontal: ROW_PAD_H,
    paddingVertical: 14,
  },
  rowPressed: {
    opacity: 0.72,
  },
  rowBody: {
    flex: 1,
    gap: 4,
    paddingTop: 2,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  threadTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  threadDate: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  threadPreview: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textMuted,
  },
  separator: {
    paddingLeft: DIVIDER_INSET,
    paddingRight: ROW_PAD_H,
  },
  separatorLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
});
