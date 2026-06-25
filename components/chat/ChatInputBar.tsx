import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import type { LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, TextInput } from "../../theme";
import { outlineRadius, outlineSurface } from "../../theme/surface";

type ChatInputBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onAttach: () => void;
  sending?: boolean;
  attachDisabled?: boolean;
  placeholder?: string;
  sendA11y?: string;
  attachA11y?: string;
  /** Если задано — нижний отступ берётся отсюда (sticky-клавиатура управляет safe-area). */
  bottomPadding?: number;
  nativeID?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
};

export function ChatInputBar({
  value,
  onChangeText,
  onSend,
  onAttach,
  sending = false,
  attachDisabled = false,
  placeholder = "Message",
  sendA11y = "Send",
  attachA11y = "Attach photo",
  bottomPadding,
  nativeID,
  onLayout,
}: ChatInputBarProps) {
  const insets = useSafeAreaInsets();
  const canSend = value.trim().length > 0 && !sending;
  const paddingBottom = bottomPadding ?? Math.max(insets.bottom, 10);

  return (
    <View style={[styles.root, { paddingBottom }]} onLayout={onLayout}>
      <View style={styles.bar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={attachA11y}
          disabled={attachDisabled || sending}
          hitSlop={8}
          onPress={onAttach}
          style={({ pressed }) => [
            styles.attachBtn,
            (pressed || attachDisabled) && styles.iconPressed,
            attachDisabled && styles.iconDisabled,
          ]}
        >
          <View style={styles.attachIconWrap}>
            <Ionicons name="attach" size={26} color={colors.textPrimary} />
          </View>
        </Pressable>

        <View style={styles.inputWrap}>
          <TextInput
            nativeID={nativeID}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={4000}
            style={styles.input}
            editable={!sending}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={sendA11y}
          disabled={!canSend}
          hitSlop={8}
          onPress={onSend}
          style={({ pressed }) => [
            styles.sendBtn,
            !canSend && styles.iconDisabled,
            pressed && canSend && styles.iconPressed,
          ]}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.textPrimary} />
          ) : (
            <Ionicons
              name="send"
              size={22}
              color={canSend ? colors.textPrimary : colors.textMuted}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surfaceDeep,
    paddingTop: 4,
    paddingHorizontal: 10,
  },
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  attachBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  attachIconWrap: {
    transform: [{ rotate: "45deg" }],
  },
  inputWrap: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    justifyContent: "center",
  },
  input: {
    ...outlineSurface(outlineRadius + 12),
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.textPrimary,
  },
  sendBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  iconPressed: {
    opacity: 0.72,
  },
  iconDisabled: {
    opacity: 0.4,
  },
});
