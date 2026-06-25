import { StyleSheet, View } from "react-native";
import { Platform } from "react-native";
import { useTranslation } from "react-i18next";

import type { RegisterFieldDef } from "../../data/registerStepDefs";
import { colors, font, Text, TextInput } from "../../theme";
import { outlineRadius, outlineSurface } from "../../theme/surface";
import { useAuthOutline } from "./AuthOutlineContext";

type FormFieldProps = {
  field: RegisterFieldDef;
  value: string;
  focused: boolean;
  onChangeText: (text: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  hidePlaceholder?: boolean;
};

/** Поле формы авторизации/регистрации на «стеклянной» поверхности. */
export function FormField({
  field,
  value,
  focused,
  onChangeText,
  onFocus,
  onBlur,
  hidePlaceholder = false,
}: FormFieldProps) {
  const { t } = useTranslation();
  const { fieldBorder } = useAuthOutline();
  const label = t(field.labelKey);
  const filled = value.trim().length > 0;

  return (
    <View style={styles.fieldGroup}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          outlineSurface(outlineRadius),
          fieldBorder(focused, filled),
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          secureTextEntry={field.secure}
          multiline={field.multiline}
          keyboardType={field.keyboardType ?? "default"}
          autoCapitalize={field.autoCapitalize ?? "sentences"}
          autoCorrect={!field.secure}
          placeholder={hidePlaceholder ? "" : t(field.placeholderKey)}
          placeholderTextColor="rgba(255, 255, 255, 0.45)"
          style={[styles.input, field.multiline && styles.inputMultiline]}
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
  inputMultiline: {
    minHeight: 88,
    textAlignVertical: "top",
    paddingTop: 12,
  },
});
