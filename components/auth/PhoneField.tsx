import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

import {
  formatPhoneInput,
  getDefaultPhoneCountry,
  getPhoneCountryOptions,
  type PhoneCountryCode,
  type PhoneCountryOption,
} from "../../lib/phoneFormat";
import { colors, font, Text, TextInput } from "../../theme";
import { GlassSurface, glassAuthRadius } from "../ui/GlassSurface";

type PhoneFieldProps = {
  value: string;
  country: PhoneCountryCode;
  focused: boolean;
  readOnly?: boolean;
  onChangeText: (text: string) => void;
  onChangeCountry: (country: PhoneCountryCode) => void;
  onFocus: () => void;
  onBlur: () => void;
};

/** Поле телефона с выбором кода страны и автоформатированием. */
export function PhoneField({
  value,
  country,
  focused,
  readOnly = false,
  onChangeText,
  onChangeCountry,
  onFocus,
  onBlur,
}: PhoneFieldProps) {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const options = useMemo(() => getPhoneCountryOptions(), []);
  const selected =
    options.find((o) => o.code === country) ??
    options.find((o) => o.code === getDefaultPhoneCountry());

  const handleChangeText = (raw: string) => {
    onChangeText(formatPhoneInput(raw, country));
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("auth.phoneCountryA11y")}
          disabled={readOnly}
          onPress={() => setPickerOpen(true)}
          style={[styles.countryButton, readOnly && styles.readOnlyPart]}
        >
          <Text style={styles.dialCode}>{selected?.dialCode ?? "+7"}</Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={colors.textMuted}
          />
        </Pressable>

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

      <CountryPickerModal
        visible={pickerOpen}
        options={options}
        selected={country}
        onClose={() => setPickerOpen(false)}
        onSelect={(code) => {
          onChangeCountry(code);
          setPickerOpen(false);
        }}
      />
    </View>
  );
}

type CountryPickerModalProps = {
  visible: boolean;
  options: PhoneCountryOption[];
  selected: PhoneCountryCode;
  onClose: () => void;
  onSelect: (code: PhoneCountryCode) => void;
};

function CountryPickerModal({
  visible,
  options,
  selected,
  onClose,
  onSelect,
}: CountryPickerModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalSheetWrap} onPress={() => {}}>
          <GlassSurface radius={glassAuthRadius} style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{t("auth.phoneCountryTitle")}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              style={styles.modalList}
              renderItem={({ item }) => {
                const active = item.code === selected;
                return (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => onSelect(item.code)}
                    style={[styles.modalRow, active && styles.modalRowActive]}
                  >
                    <Text
                      style={[
                        styles.modalRowText,
                        active && styles.modalRowTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </GlassSurface>
        </Pressable>
      </Pressable>
    </Modal>
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
  countryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
  },
  dialCode: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
    ...font("500"),
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(5, 22, 48, 0.28)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalSheetWrap: {
    maxHeight: "60%",
    alignSelf: "stretch",
  },
  modalSheet: {
    maxHeight: "100%",
    overflow: "hidden",
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.18)",
    ...font("500"),
  },
  modalList: {
    flexGrow: 0,
  },
  modalRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalRowActive: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  modalRowText: {
    fontSize: 15,
    color: colors.textMuted,
    ...font("400"),
  },
  modalRowTextActive: {
    color: colors.textPrimary,
    fontWeight: "500",
    ...font("500"),
  },
});
