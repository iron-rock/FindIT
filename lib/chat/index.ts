export type { ChatCounterpart, ChatMessage, ConversationPreview, MessageKind } from './types';
export {
  fetchConversations,
  fetchMessages,
  getCurrentChatUserId,
  sendImageMessage,
  sendTextMessage,
  uploadChatImage,
} from './chatService';
export { MOCK_CONVERSATIONS, MOCK_CURRENT_USER_ID } from './mockData';
