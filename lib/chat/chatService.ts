import type { MessageRow } from '../database.types';
import { getSupabase, isSupabaseConfigured } from '../supabase';
import {
  MOCK_CONVERSATIONS,
  MOCK_CURRENT_USER_ID,
  MOCK_MESSAGES_BY_CONVERSATION,
} from './mockData';
import type { ChatMessage, ConversationPreview, MessageKind } from './types';

const CHAT_IMAGES_BUCKET = 'chat-images';

/** Задержка для имитации сети в mock-режиме. */
const MOCK_LATENCY_MS = 280;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function rowToChatMessage(row: MessageRow): ChatMessage {
  const kind: MessageKind =
    row.message_type === 'image' ? 'image' : 'text';
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    kind,
    body: row.body,
    imageUrl: row.image_url,
    createdAt: row.created_at,
  };
}

let mockMessagesStore: Record<string, ChatMessage[]> = {
  ...MOCK_MESSAGES_BY_CONVERSATION,
};

function cloneMessages(list: ChatMessage[]): ChatMessage[] {
  return list.map((m) => ({ ...m }));
}

/** Список диалогов для экрана чатов. */
export async function fetchConversations(): Promise<ConversationPreview[]> {
  if (!isSupabaseConfigured) {
    await delay(MOCK_LATENCY_MS);
    return [...MOCK_CONVERSATIONS];
  }

  const supabase = getSupabase();
  if (!supabase) {
    return [...MOCK_CONVERSATIONS];
  }

  // TODO: join matches + profiles + last message via RPC or nested select.
  return [...MOCK_CONVERSATIONS];
}

/** Сообщения комнаты (хронологически, старые → новые). */
export async function fetchMessages(conversationId: string): Promise<ChatMessage[]> {
  if (!isSupabaseConfigured) {
    await delay(MOCK_LATENCY_MS);
    return cloneMessages(mockMessagesStore[conversationId] ?? []);
  }

  const supabase = getSupabase();
  if (!supabase) {
    return cloneMessages(mockMessagesStore[conversationId] ?? []);
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error || !data) {
    if (__DEV__) {
      console.warn('[chat] fetchMessages fallback to mock:', error?.message);
    }
    return cloneMessages(mockMessagesStore[conversationId] ?? []);
  }

  return data.map(rowToChatMessage);
}

export type SendTextMessageInput = {
  conversationId: string;
  senderId: string;
  body: string;
};

/** Отправка текстового сообщения. */
export async function sendTextMessage(input: SendTextMessageInput): Promise<ChatMessage> {
  const trimmed = input.body.trim();
  if (!trimmed) {
    throw new Error('Empty message body');
  }

  const optimistic: ChatMessage = {
    id: `local-${Date.now()}`,
    conversationId: input.conversationId,
    senderId: input.senderId,
    kind: 'text',
    body: trimmed,
    imageUrl: null,
    createdAt: new Date().toISOString(),
    pending: true,
  };

  if (!isSupabaseConfigured) {
    await delay(MOCK_LATENCY_MS);
    const saved = { ...optimistic, id: `msg-${Date.now()}`, pending: false };
    const list = mockMessagesStore[input.conversationId] ?? [];
    mockMessagesStore = {
      ...mockMessagesStore,
      [input.conversationId]: [...list, saved],
    };
    return saved;
  }

  const supabase = getSupabase();
  if (!supabase) {
    await delay(MOCK_LATENCY_MS);
    const saved = { ...optimistic, id: `msg-${Date.now()}`, pending: false };
    const list = mockMessagesStore[input.conversationId] ?? [];
    mockMessagesStore = {
      ...mockMessagesStore,
      [input.conversationId]: [...list, saved],
    };
    return saved;
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: input.conversationId,
      sender_id: input.senderId,
      body: trimmed,
      message_type: 'text',
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to send message');
  }

  return rowToChatMessage(data);
}

export type UploadChatImageResult = {
  publicUrl: string;
  storagePath: string;
};

/**
 * Загрузка изображения в Supabase Storage.
 *
 * TODO (Storage bucket `chat-images`, private):
 *   - INSERT: authenticated users, path `{conversation_id}/{uuid}.jpg`
 *   - SELECT: participants of the conversation (via policy on storage.objects)
 *   - После upload вернуть signed URL или public URL через getPublicUrl.
 *
 * В mock-режиме возвращает local URI как «URL».
 */
export async function uploadChatImage(
  conversationId: string,
  localUri: string,
  mimeType = 'image/jpeg',
): Promise<UploadChatImageResult> {
  if (!isSupabaseConfigured) {
    await delay(MOCK_LATENCY_MS * 2);
    return {
      publicUrl: localUri,
      storagePath: `${conversationId}/mock-${Date.now()}.jpg`,
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { publicUrl: localUri, storagePath: `${conversationId}/offline.jpg` };
  }

  const ext = mimeType.includes('png') ? 'png' : 'jpg';
  const storagePath = `${conversationId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const response = await fetch(localUri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from(CHAT_IMAGES_BUCKET)
    .upload(storagePath, blob, { contentType: mimeType, upsert: false });

  if (error) {
    if (__DEV__) {
      console.warn('[chat] uploadChatImage stub — using local URI:', error.message);
    }
    return { publicUrl: localUri, storagePath };
  }

  const { data } = supabase.storage.from(CHAT_IMAGES_BUCKET).getPublicUrl(storagePath);
  return { publicUrl: data.publicUrl, storagePath };
}

export type SendImageMessageInput = {
  conversationId: string;
  senderId: string;
  localUri: string;
  mimeType?: string;
  caption?: string;
};

/** Отправка сообщения с изображением. */
export async function sendImageMessage(input: SendImageMessageInput): Promise<ChatMessage> {
  const { publicUrl } = await uploadChatImage(
    input.conversationId,
    input.localUri,
    input.mimeType,
  );

  const body = input.caption?.trim() ?? '';

  if (!isSupabaseConfigured) {
    await delay(MOCK_LATENCY_MS);
    const saved: ChatMessage = {
      id: `msg-img-${Date.now()}`,
      conversationId: input.conversationId,
      senderId: input.senderId,
      kind: 'image',
      body,
      imageUrl: publicUrl,
      createdAt: new Date().toISOString(),
    };
    const list = mockMessagesStore[input.conversationId] ?? [];
    mockMessagesStore = {
      ...mockMessagesStore,
      [input.conversationId]: [...list, saved],
    };
    return saved;
  }

  const supabase = getSupabase();
  if (!supabase) {
    await delay(MOCK_LATENCY_MS);
    const saved: ChatMessage = {
      id: `msg-img-${Date.now()}`,
      conversationId: input.conversationId,
      senderId: input.senderId,
      kind: 'image',
      body,
      imageUrl: publicUrl,
      createdAt: new Date().toISOString(),
    };
    const list = mockMessagesStore[input.conversationId] ?? [];
    mockMessagesStore = {
      ...mockMessagesStore,
      [input.conversationId]: [...list, saved],
    };
    return saved;
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: input.conversationId,
      sender_id: input.senderId,
      body,
      message_type: 'image',
      image_url: publicUrl,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to send image message');
  }

  return rowToChatMessage(data);
}

/** ID текущего пользователя для чата (mock → auth.uid()). */
export function getCurrentChatUserId(): string {
  // TODO: return session.user.id from Supabase auth.
  return MOCK_CURRENT_USER_ID;
}
