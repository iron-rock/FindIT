/** Тип сообщения в чате (соответствует enum message_type в БД). */
export type MessageKind = 'text' | 'image';

/** Сообщение в комнате чата (UI + API). */
export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  kind: MessageKind;
  /** Текст; для image-only — пустая строка. */
  body: string;
  /** Публичный URL после загрузки в Storage. */
  imageUrl: string | null;
  /** Локальный URI до завершения upload (optimistic UI). */
  localImageUri?: string;
  createdAt: string;
  /** Optimistic / in-flight. */
  pending?: boolean;
};

/** Превью диалога в списке чатов. */
export type ConversationPreview = {
  id: string;
  counterpartName: string;
  counterpartAvatarUrl?: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  dateLabel: string;
};

/** Параметры контрагента для заголовка комнаты. */
export type ChatCounterpart = {
  name: string;
  avatarUrl?: string;
};
