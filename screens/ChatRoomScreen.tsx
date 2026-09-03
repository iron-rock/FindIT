import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";
import {
  KeyboardStickyView,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import Reanimated, { useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import { ChatHeader } from "../components/chat/ChatHeader";
import { ChatInputBar } from "../components/chat/ChatInputBar";
import { MessageBubble } from "../components/chat/MessageBubble";
import {
  fetchMessages,
  getCurrentChatUserId,
  sendImageMessage,
  sendTextMessage,
  type ChatMessage,
} from "../lib/chat";
import type { ChatsStackParamList } from "../navigation/types";
import { colors } from "../theme";

export type ChatRoomScreenProps = NativeStackScreenProps<
  ChatsStackParamList,
  "ChatRoom"
>;

const CHAT_INPUT_NATIVE_ID = "chat-room-input";
/** Подъём инпута (KeyboardStickyView) и уменьшение нижнего отступа. */
const INPUT_LIFT = 2;
const BOTTOM_PAD_TRIM = 6;

export function ChatRoomScreen({ route, navigation }: ChatRoomScreenProps) {
  const { conversationId, counterpartName } = route.params;
  const { t } = useTranslation();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const currentUserId = getCurrentChatUserId();

  const bottomPad = Math.max(bottomInset, 8) - BOTTOM_PAD_TRIM;

  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();

  const listWrapStyle = useAnimatedStyle(() => ({
    flex: 1,
    marginBottom: keyboardHeight.value,
  }));

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMessages(conversationId);
      setMessages(data);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (messages.length === 0) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages.length]);

  const handleSend = useCallback(async () => {
    const text = draft.trim();
    if (!text || sending) return;

    setDraft("");
    setSending(true);

    const optimistic: ChatMessage = {
      id: `opt-${Date.now()}`,
      conversationId,
      senderId: currentUserId,
      kind: "text",
      body: text,
      imageUrl: null,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const saved = await sendTextMessage({
        conversationId,
        senderId: currentUserId,
        body: text,
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? saved : m)),
      );
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(text);
    } finally {
      setSending(false);
    }
  }, [conversationId, currentUserId, draft, sending]);

  const handleAttach = useCallback(async () => {
    if (sending) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setSending(true);

    const optimistic: ChatMessage = {
      id: `opt-img-${Date.now()}`,
      conversationId,
      senderId: currentUserId,
      kind: "image",
      body: "",
      imageUrl: null,
      localImageUri: asset.uri,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const saved = await sendImageMessage({
        conversationId,
        senderId: currentUserId,
        localUri: asset.uri,
        mimeType: asset.mimeType ?? "image/jpeg",
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? saved : m)),
      );
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  }, [conversationId, currentUserId, sending]);

  return (
    <View style={styles.root}>
      <ChatHeader
        counterpartName={counterpartName}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.flex}>
        <Reanimated.View style={listWrapStyle}>
          <FlatList
            ref={listRef}
            style={styles.list}
            data={messages}
            keyExtractor={(item) => item.id}
            keyboardDismissMode="interactive"
            contentContainerStyle={[
              styles.listContent,
              messages.length === 0 && styles.listEmpty,
            ]}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                isOwn={item.senderId === currentUserId}
                onImagePress={setPreviewUri}
              />
            )}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
          />
        </Reanimated.View>

        <KeyboardStickyView
          offset={{
            closed: -INPUT_LIFT,
            opened: bottomInset - bottomPad,
          }}
        >
          <ChatInputBar
            value={draft}
            onChangeText={setDraft}
            onSend={() => void handleSend()}
            onAttach={() => void handleAttach()}
            sending={sending}
            attachDisabled={loading}
            placeholder={t("chats.inputPlaceholder")}
            sendA11y={t("chats.send")}
            attachA11y={t("chats.attachPhoto")}
            bottomPadding={bottomPad}
            nativeID={CHAT_INPUT_NATIVE_ID}
          />
        </KeyboardStickyView>
      </View>

      <Modal
        visible={previewUri != null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
      >
        <Pressable
          style={styles.previewBackdrop}
          onPress={() => setPreviewUri(null)}
        >
          {previewUri ? (
            <Image
              source={{ uri: previewUri }}
              style={styles.previewImage}
              contentFit="contain"
            />
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "transparent",
  },
  flex: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 2,
    paddingBottom: 8,
    flexGrow: 1,
  },
  listEmpty: {
    flex: 1,
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.92)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  previewImage: {
    width: "100%",
    height: "80%",
  },
});
