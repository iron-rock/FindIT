import { FlatList, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import type { MainTabParamList } from '../navigation/types';
import { colors, Text } from '../theme';

/** Диалоги для макета; позже — реальная переписка с сервером. */
const CHAT_ROWS = [
  {
    id: 'ch1',
    title: 'Команда «НейроСофт»',
    preview: 'Добрый день! Готовы обсудить оффер и старт в команде?',
    date: 'сегодня',
  },
  {
    id: 'ch2',
    title: 'HR · финтех-банк',
    preview: 'Спасибо за интервью. Подберём следующий созвон с тимлидом.',
    date: 'вчера',
  },
];

export type ChatsScreenProps = BottomTabScreenProps<MainTabParamList, 'Chats'>;

export function ChatsScreen(_props: ChatsScreenProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{t('chats.title')}</Text>
      <Text style={styles.subtitle}>{t('chats.subtitle')}</Text>
      <FlatList
        contentContainerStyle={styles.list}
        data={CHAT_ROWS}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.thread}>
            <View style={styles.threadTop}>
              <Text style={styles.threadTitle}>{item.title}</Text>
              <Text style={styles.threadDate}>{item.date}</Text>
            </View>
            <Text style={styles.threadPreview} numberOfLines={2}>
              {item.preview}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 14,
    maxWidth: 360,
  },
  list: {
    gap: 10,
    paddingBottom: 140,
    paddingTop: 4,
  },
  thread: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 8,
  },
  threadTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  threadTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
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
});
