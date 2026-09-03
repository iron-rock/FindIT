import { useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInput as TextInputType,
  type TextInputKeyPressEventData,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  filterTechSuggestions,
  matchCatalogTech,
  normalizeTechLabel,
} from '../../data/techStackCatalog';
import { colors, font, Text } from '../../theme';
import {
  outlineBorder,
  outlineRadius,
  outlineSurface,
  softFill,
  softFillPressed,
  welcomeOutlineBorderFocused,
} from '../../theme/surface';

type StackTechInputProps = {
  value: string[];
  onChange: (next: string[]) => void;
};

function isAlreadySelected(stack: string[], label: string): boolean {
  const key = label.toLowerCase();
  return stack.some((item) => item.toLowerCase() === key);
}

/**
 * T9-набор стека: чипы-entity + query с подсказками из каталога.
 * Тап по пустому месту поля — фокус ввода; тап по чипу / крестику — убрать.
 * При открытии из PreEdit — сразу в фокусе.
 */
export function StackTechInput({ value, onChange }: StackTechInputProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInputType>(null);

  const suggestions = useMemo(
    () => filterTechSuggestions(query, value),
    [query, value],
  );

  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 40);
    return () => clearTimeout(id);
  }, []);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const addTech = (raw: string) => {
    const catalog = matchCatalogTech(raw);
    const label = catalog ?? normalizeTechLabel(raw);
    if (!label || isAlreadySelected(value, label)) {
      setQuery('');
      return;
    }
    onChange([...value, label]);
    setQuery('');
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const commitQuery = () => {
    const trimmed = normalizeTechLabel(query);
    if (!trimmed) {
      return;
    }
    const exact = matchCatalogTech(trimmed);
    if (exact) {
      addTech(exact);
      return;
    }
    if (suggestions.length === 1) {
      addTech(suggestions[0]);
      return;
    }
    addTech(trimmed);
  };

  const onChangeText = (text: string) => {
    if (text.includes(',')) {
      const parts = text.split(',');
      const head = parts[0] ?? '';
      const rest = parts.slice(1).join(',');
      if (normalizeTechLabel(head)) {
        addTech(head);
        setQuery(rest.replace(/^\s+/, ''));
      } else {
        setQuery(rest.replace(/^\s+/, ''));
      }
      return;
    }
    setQuery(text);
  };

  const onKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Backspace' && query.length === 0 && value.length > 0) {
      removeAt(value.length - 1);
    }
  };

  return (
    <View style={styles.root}>
      <Pressable
        accessibilityRole="none"
        onPress={focusInput}
        style={[
          outlineSurface(outlineRadius),
          focused && welcomeOutlineBorderFocused,
          styles.field,
        ]}
      >
        <View style={styles.chips} pointerEvents="box-none">
          {value.map((tech, index) => (
            <Pressable
              key={`${tech}-${index}`}
              accessibilityRole="button"
              accessibilityLabel={t('profile.stackRemove', { tech })}
              onPress={() => removeAt(index)}
              style={({ pressed }) => [
                styles.chip,
                pressed && styles.chipPressed,
              ]}
            >
              <Text style={styles.chipText}>{tech}</Text>
              <View style={styles.chipRemove} pointerEvents="none">
                <Ionicons name="close" size={14} color={colors.textMuted} />
              </View>
            </Pressable>
          ))}
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={onChangeText}
            onSubmitEditing={commitQuery}
            onKeyPress={onKeyPress}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            blurOnSubmit={false}
            style={styles.input}
          />
        </View>
      </Pressable>

      {suggestions.length > 0 ? (
        <View
          accessibilityRole="list"
          pointerEvents="box-none"
          style={styles.suggestionsAnchor}
        >
          <View style={styles.suggestions}>
            {suggestions.map((tech) => (
              <Pressable
                key={tech}
                accessibilityRole="button"
                accessibilityLabel={tech}
                onPress={() => addTech(tech)}
                style={({ pressed }) => [
                  styles.suggestionRow,
                  pressed && styles.suggestionPressed,
                ]}
              >
                <Text style={styles.suggestionText}>{tech}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    zIndex: 20,
  },
  field: {
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    minHeight: 44,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 6,
    borderRadius: outlineRadius,
    backgroundColor: softFill,
  },
  chipPressed: {
    backgroundColor: softFillPressed,
    opacity: 0.85,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    ...font('500'),
  },
  chipRemove: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flexGrow: 1,
    flexBasis: 120,
    minWidth: 100,
    paddingVertical: Platform.OS === 'ios' ? 6 : 4,
    paddingHorizontal: 4,
    fontSize: 15,
    color: colors.textPrimary,
    ...font('400'),
  },
  suggestionsAnchor: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%',
    marginTop: 6,
    zIndex: 40,
    elevation: 40,
  },
  suggestions: {
    ...outlineBorder,
    borderRadius: outlineRadius,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  suggestionRow: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  suggestionPressed: {
    backgroundColor: softFill,
  },
  suggestionText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    ...font('500'),
  },
});
