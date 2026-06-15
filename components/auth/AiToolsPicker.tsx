import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AI_TOOLS_CATALOG,
  isAiToolSelected,
  MAX_SELECTED_AI_TOOLS,
  toggleSelectedAiTool,
} from '../../data/aiToolsCatalog';
import type { AiToolCatalogItem } from '../../data/aiToolsCatalog';
import { colors, font, Text } from '../../theme';
import { glassAuthRadius } from '../ui/GlassSurface';

type AiToolsPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

function AiToolLogo({ tool }: { tool: AiToolCatalogItem }) {
  return (
    <Image
      source={tool.logo}
      accessibilityLabel={tool.id}
      style={styles.logo}
      contentFit="contain"
    />
  );
}

/** Мультивыбор популярных AI-инструментов (до 5) с названием и лого. */
export function AiToolsPicker({ value, onChange }: AiToolsPickerProps) {
  const { t } = useTranslation();
  const selectedCount = value ? value.split(',').filter(Boolean).length : 0;
  const atLimit = selectedCount >= MAX_SELECTED_AI_TOOLS;

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{t('register.finder.aiToolsPicker')}</Text>
      <Text style={styles.hint}>
        {t('register.finder.aiToolsPickerHint', { max: MAX_SELECTED_AI_TOOLS })}
      </Text>

      <View style={styles.grid}>
        {AI_TOOLS_CATALOG.map((tool) => {
          const selected = isAiToolSelected(value, tool.id);
          const disabled = !selected && atLimit;
          const label = t(tool.nameKey);

          return (
            <Pressable
              key={tool.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected, disabled }}
              accessibilityLabel={label}
              disabled={disabled}
              onPress={() => onChange(toggleSelectedAiTool(value, tool.id))}
              style={({ pressed }) => [
                styles.chip,
                { borderRadius: glassAuthRadius },
                selected && styles.chipSelected,
                disabled && styles.chipDisabled,
                pressed && !disabled && styles.chipPressed,
              ]}
            >
              <AiToolLogo tool={tool} />
              <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]} numberOfLines={2}>
                {label}
              </Text>
            </Pressable>
          );
        })}
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
    fontWeight: '400',
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    ...font('400'),
  },
  hint: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textMuted,
    lineHeight: 18,
    ...font('400'),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '48%',
    flexGrow: 1,
    flexBasis: '46%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  chipSelected: {
    borderColor: colors.textPrimary,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  logo: {
    width: 22,
    height: 22,
  },
  chipLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: colors.textMuted,
    ...font('400'),
  },
  chipLabelSelected: {
    color: colors.textPrimary,
    fontWeight: '500',
    ...font('500'),
  },
});
