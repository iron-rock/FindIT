import { Platform, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import {
  countryCodeToFlag,
  detectPhoneCountry,
  formatInternationalPhoneInput,
  type PhoneCountryCode,
} from "../../lib/phoneFormat";
import { colors, font, Text, TextInput } from "../../theme";
import { glassAuthRadius } from "../ui/GlassSurface";

type PhoneFieldProps = {
  value: string;
  focused: boolean;
  readOnly?: boolean;
  onChangeText: (text: string) => void;
  onCountryDetected?: (country: PhoneCountryCode | null) => void;
  onFocus: () => void;
  onBlur: () => void;
};

/** Поле телефона со свободным международным вводом и автоопределением страны. */
export function PhoneField({
  value,
  focused,
  readOnly = false,
  onChangeText,
  onCountryDetected,
  onFocus,
  onBlur,
}: PhoneFieldProps) {
  const { t } = useTranslation();
  const detectedCountry = detectPhoneCountry(value);

  const handleChangeText = (raw: string) => {
    const formatted = formatInternationalPhoneInput(raw);
    onChangeText(formatted);
    onCountryDetected?.(detectPhoneCountry(formatted));
  };

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{t("auth.phone")}</Text>
      <View
        style={[
          styles.inputRow,
          { borderRadius: glassAuthRadius },
          focused && styles.inputRowFocused,
        ]}
      >
        <View
          accessibilityLabel={
            detectedCountry
              ? t("auth.phoneFlagA11y", { country: detectedCountry })
              : t("auth.phone")
          }
          style={[styles.flagSlot, readOnly && styles.readOnlyPart]}
        >
          <Text style={styles.flag}>
            {detectedCountry ? countryCodeToFlag(detectedCountry) : "🌍"}
          </Text>
        </View>

        <View style={styles.divider} />

        <TextInput
          value={value}
          onChangeText={handleChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          editable={!readOnly}
          keyboardType="phone-pad"
          autoCorrect={false}
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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
    overflow: "hidden",
  },
  inputRowFocused: {
    borderColor: colors.accentBright,
    borderWidth: 1.5,
  },
  flagSlot: {
    width: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
  },
  flag: {
    fontSize: 22,
    lineHeight: 26,
  },
  divider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  input: {
    flex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    fontSize: 15,
    fontWeight: "400",
    color: colors.textPrimary,
    ...font("400"),
  },
  readOnlyPart: {
    opacity: 0.85,
  },
  readOnlyInput: {
    color: colors.textMuted,
  },
});
