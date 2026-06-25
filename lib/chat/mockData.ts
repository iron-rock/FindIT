import type { ChatMessage, ConversationPreview } from './types';

/** Dev/mock ID текущего пользователя (заменить на auth.uid() при wiring). */
export const MOCK_CURRENT_USER_ID = '00000000-0000-4000-8000-000000000001';

export const MOCK_CONVERSATIONS: ConversationPreview[] = [
  {
    id: 'conv-ch1',
    counterpartName: 'Команда «НейроСофт»',
    lastMessagePreview: 'Добрый день! Готовы обсудить оффер и старт в команде?',
    lastMessageAt: '2026-06-24T10:30:00.000Z',
    dateLabel: 'сегодня',
  },
  {
    id: 'conv-ch2',
    counterpartName: 'HR · финтех-банк',
    lastMessagePreview: 'Спасибо за интервью. Подберём следующий созвон с тимлидом.',
    lastMessageAt: '2026-06-23T15:45:00.000Z',
    dateLabel: 'вчера',
  },
];

const COUNTERPART_ID = '00000000-0000-4000-8000-000000000099';

export const MOCK_MESSAGES_BY_CONVERSATION: Record<string, ChatMessage[]> = {
  'conv-ch1': [
    {
      id: 'msg-1',
      conversationId: 'conv-ch1',
      senderId: COUNTERPART_ID,
      kind: 'text',
      body: 'Здравствуйте! Мы посмотрели ваш профиль — очень сильный стек по React Native.',
      imageUrl: null,
      createdAt: '2026-06-24T09:00:00.000Z',
    },
    {
      id: 'msg-2',
      conversationId: 'conv-ch1',
      senderId: MOCK_CURRENT_USER_ID,
      kind: 'text',
      body: 'Спасибо! Буду рад обсудить детали.',
      imageUrl: null,
      createdAt: '2026-06-24T09:05:00.000Z',
    },
    {
      id: 'msg-3',
      conversationId: 'conv-ch1',
      senderId: COUNTERPART_ID,
      kind: 'text',
      body: 'Добрый день! Готовы обсудить оффер и старт в команде?',
      imageUrl: null,
      createdAt: '2026-06-24T10:30:00.000Z',
    },
  ],
  'conv-ch2': [
    {
      id: 'msg-4',
      conversationId: 'conv-ch2',
      senderId: COUNTERPART_ID,
      kind: 'text',
      body: 'Добрый день! Спасибо, что прошли техническое интервью.',
      imageUrl: null,
      createdAt: '2026-06-23T14:00:00.000Z',
    },
    {
      id: 'msg-5',
      conversationId: 'conv-ch2',
      senderId: MOCK_CURRENT_USER_ID,
      kind: 'text',
      body: 'Спасибо вам! Было интересно.',
      imageUrl: null,
      createdAt: '2026-06-23T14:20:00.000Z',
    },
    {
      id: 'msg-6',
      conversationId: 'conv-ch2',
      senderId: COUNTERPART_ID,
      kind: 'text',
      body: 'Спасибо за интервью. Подберём следующий созвон с тимлидом.',
      imageUrl: null,
      createdAt: '2026-06-23T15:45:00.000Z',
    },
  ],
};

export function getMockCounterpartName(conversationId: string): string {
  return (
    MOCK_CONVERSATIONS.find((c) => c.id === conversationId)?.counterpartName ??
    'Собеседник'
  );
}
