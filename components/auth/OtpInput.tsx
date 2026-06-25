import { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from "react-native";

import { colors, font, Text } from "../../theme";
import { outlineRadius, outlineSurface } from "../../theme/surface";
import { useAuthOutline } from "./AuthOutlineContext";

const DEFAULT_LENGTH = 6;
const BOX_GAP = 10;
const DIGIT_ANIM_MS = 280;

const AnimatedDigitText = Animated.createAnimatedComponent(Text);

type OtpInputProps = {
  value: string;
  length?: number;
  focused?: boolean;
  autoFocus?: boolean;
  onChangeText: (text: string) => void;
  onFocus: () => void;
  onBlur: () => void;
};

type OtpDigitCellProps = {
  digit: string;
  isActive: boolean;
};

/** Одна ячейка OTP с ease-out появлением цифры. */
function OtpDigitCell({ digit, isActive }: OtpDigitCellProps) {
  const { fieldBorder } = useAuthOutline();
  const filled = digit.length > 0;
  const opacity = useRef(new Animated.Value(digit ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(digit ? 1 : 0.88)).current;
  const prevDigit = useRef(digit);

  useEffect(() => {
    if (digit && digit !== prevDigit.current) {
      opacity.setValue(0);
      scale.setValue(0.88);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: DIGIT_ANIM_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: DIGIT_ANIM_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!digit) {
      opacity.setValue(0);
      scale.setValue(0.88);
    }

    prevDigit.current = digit;
  }, [digit, opacity, scale]);

  return (
    <View
      style={[
        outlineSurface(outlineRadius),
        styles.box,
        fieldBorder(isActive, filled),
      ]}
    >
      {digit ? (
        <AnimatedDigitText
          style={[
            styles.digit,
            {
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          {digit}
        </AnimatedDigitText>
      ) : null}
      {isActive && !digit ? <View style={styles.cursor} /> : null}
    </View>
  );
}

/** OTP: отдельный квадрат на каждую цифру в стиле auth-инпутов. */
export function OtpInput({
  value,
  length = DEFAULT_LENGTH,
  focused = false,
  autoFocus = true,
  onChangeText,
  onFocus,
  onBlur,
}: OtpInputProps) {
  const inputRef = useRef<RNTextInput>(null);

  const digits = Array.from({ length }, (_, index) => value[index] ?? "");
  const activeIndex = Math.min(value.length, length - 1);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(focusInput, 320);
      return () => clearTimeout(timer);
    }
  }, [autoFocus, focusInput]);

  const handleChange = (raw: string) => {
    onChangeText(raw.replace(/\D/g, "").slice(0, length));
  };

  return (
    <Pressable
      accessibilityRole="none"
      onPress={focusInput}
      style={styles.row}
    >
      {digits.map((digit, index) => (
        <OtpDigitCell
          key={index}
          digit={digit}
          isActive={focused && activeIndex === index}
        />
      ))}

      <RNTextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete={Platform.OS === "android" ? "sms-otp" : "one-time-code"}
        maxLength={length}
        caretHidden
        autoCorrect={false}
        autoCapitalize="none"
        importantForAutofill="yes"
        style={styles.hiddenInput}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: BOX_GAP,
    alignSelf: "stretch",
  },
  box: {
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  digit: {
    fontSize: 17,
    fontWeight: "400",
    color: colors.textPrimary,
    textAlign: "center",
    ...font("400"),
  },
  cursor: {
    position: "absolute",
    width: 1.5,
    height: 22,
    borderRadius: 1,
    backgroundColor: colors.textPrimary,
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
    color: "transparent",
  },
});
