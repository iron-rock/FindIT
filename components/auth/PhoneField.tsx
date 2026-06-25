import { Platform, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import {
  formatInternationalPhoneInput,
  PHONE_INPUT_DISPLAY_MAX_LENGTH,
} from "../../lib/phoneFormat";
import { colors, font, Text, TextInput } from "../../theme";
import { outlineRadius, outlineSurface } from "../../theme/surface";
import { useAuthOutline } from "./AuthOutlineContext";

type PhoneFieldProps = {
  value: string;
  focused: boolean;
  readOnly?: boolean;
  onChangeText: (text: string) => void;
  onFocus: () => void;
  onBlur: () => void;
};

/** Поле телефона с международным форматированием по мере набора. */
export function PhoneField({
  value,
  focused,
  readOnly = false,
  onChangeText,
  onFocus,
  onBlur,
}: PhoneFieldProps) {
  const { t } = useTranslation();
  const { fieldBorder } = useAuthOutline();
  const filled = value.trim().length > 0;

  const handleChangeText = (raw: string) => {
    onChangeText(formatInternationalPhoneInput(raw));
  };

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{t("auth.phone")}</Text>
      <View
        style={[
          outlineSurface(outlineRadius),
          fieldBorder(focused, filled),
        ]}
      >
        <TextInput
          value={value}
          onChangeText={handleChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          editable={!readOnly}
          keyboardType="phone-pad"
          autoCorrect={false}
          maxLength={PHONE_INPUT_DISPLAY_MAX_LENGTH}
          placeholder={t("auth.phonePlaceholder")}
          placeholderTextColor="rgba(255, 255, 255, 0.45)"
          style={[styles.input, readOnly && styles.readOnlyInput]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "400",
    color: colors.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    ...font("400"),
  },
  input: {
    backgroundColor: "transparent",
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    fontSize: 15,
    fontWeight: "400",
    color: colors.textPrimary,
    ...font("400"),
  },
  readOnlyInput: {
    color: colors.textMuted,
  },
});
