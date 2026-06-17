import { Image } from 'expo-image';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AI_TOOLS_CATALOG,
  isAiToolSelected,
  MAX_SELECTED_AI_TOOLS,
  toggleSelectedAiTool,
} from '../../data/aiToolsCatalog';
import type { AiToolCatalogItem } from '../../data/aiToolsCatalog';
import { colors, font, Text } from '../../theme';
import {
  outlineBorder,
  outlineBorderColorFocused,
  outlineFill,
  outlineRadius,
} from '../../theme/surface';

const COMPACT_COLS = 3;
const COMPACT_GAP = 4;
const COMPACT_H_PADDING = 48;

type AiToolsPickerProps = {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
};

function AiToolLogo({ tool, compact }: { tool: AiToolCatalogItem; compact?: boolean }) {
  return (
    <Image
      source={tool.logo}
      accessibilityLabel={tool.id}
      style={[styles.logo, compact && styles.logoCompact]}
      contentFit="contain"
    />
  );
}

/** Мультивыбор популярных AI-инструментов (до 2) с названием и лого. */
export function AiToolsPicker({ value, onChange, compact = false }: AiToolsPickerProps) {
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const selectedCount = value ? value.split(',').filter(Boolean).length : 0;
  const atLimit = selectedCount >= MAX_SELECTED_AI_TOOLS;

  const compactChipWidth = Math.floor(
    (windowWidth - COMPACT_H_PADDING - COMPACT_GAP * (COMPACT_COLS - 1)) / COMPACT_COLS,
  );

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>
        {t('register.finder.aiToolsPickerHint', { max: MAX_SELECTED_AI_TOOLS })}
      </Text>

      <View style={[styles.grid, compact && styles.gridCompact]}>
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
                compact && styles.chipCompact,
                compact && { width: compactChipWidth, maxWidth: compactChipWidth },
                { borderRadius: outlineRadius },
                outlineBorder,
                { backgroundColor: outlineFill },
                selected && styles.chipSelected,
                disabled && styles.chipDisabled,
                pressed && !disabled && styles.chipPressed,
              ]}
            >
              <AiToolLogo tool={tool} compact={compact} />
              <Text
                style={[
                  styles.chipLabel,
                  compact && styles.chipLabelCompact,
                  selected && styles.chipLabelSelected,
                ]}
                numberOfLines={1}
              >
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
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    ...font('400'),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridCompact: {
    gap: COMPACT_GAP,
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
  },
  chipCompact: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flexGrow: 0,
    flexShrink: 0,
    paddingHorizontal: 4,
    paddingVertical: 6,
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
  logoCompact: {
    width: 20,
    height: 20,
  },
  chipLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: colors.textMuted,
    ...font('400'),
  },
  chipLabelCompact: {
    flex: 0,
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
  },
  chipLabelSelected: {
    color: colors.textPrimary,
    fontWeight: '500',
    ...font('500'),
  },
});
