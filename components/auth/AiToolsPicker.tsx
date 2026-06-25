import { useEffect, useRef } from 'react';
import { Image } from 'expo-image';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
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
  outlineBorderWidth,
  outlineFill,
  outlineRadius,
} from '../../theme/surface';
import { useAuthOutline } from './AuthOutlineContext';

const COMPACT_COLS = 3;
const COMPACT_GAP = 4;
const COMPACT_H_PADDING = 48;
const SELECT_ANIM_MS = 240;
const DISABLED_OPACITY = 0.4;

const AnimatedText = Animated.createAnimatedComponent(Text);

type AiToolsPickerProps = {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
};

type AiToolChipProps = {
  tool: AiToolCatalogItem;
  label: string;
  selected: boolean;
  disabled: boolean;
  compact: boolean;
  width?: number;
  onPress: () => void;
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

function AiToolChip({
  tool,
  label,
  selected,
  disabled,
  compact,
  width,
  onPress,
}: AiToolChipProps) {
  const { selectedBorder } = useAuthOutline();
  const selection = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const gridOpacity = useRef(new Animated.Value(disabled ? DISABLED_OPACITY : 1)).current;
  const activeBorderColor =
    (selectedBorder?.borderColor as string | undefined) ?? colors.textPrimary;

  useEffect(() => {
    Animated.timing(selection, {
      toValue: selected ? 1 : 0,
      duration: SELECT_ANIM_MS,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [selected, selection]);

  useEffect(() => {
    Animated.timing(gridOpacity, {
      toValue: disabled ? DISABLED_OPACITY : 1,
      duration: SELECT_ANIM_MS,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [disabled, gridOpacity]);

  const borderColor = selection.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0)', activeBorderColor],
  });

  const fillColor = selection.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.04)'],
  });

  const labelColor = selection.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textMuted, colors.textPrimary],
  });

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
    >
      <Animated.View style={{ opacity: gridOpacity }}>
        <Animated.View
          style={[
            styles.chip,
            compact && styles.chipCompact,
            compact && width != null && { width, maxWidth: width },
            styles.chipBorder,
            {
              borderRadius: outlineRadius,
              borderColor,
              backgroundColor: fillColor,
            },
          ]}
        >
          <AiToolLogo tool={tool} compact={compact} />
          <AnimatedText
            style={[
              styles.chipLabel,
              compact && styles.chipLabelCompact,
              selected && styles.chipLabelSelected,
              { color: labelColor },
            ]}
            numberOfLines={1}
          >
            {label}
          </AnimatedText>
        </Animated.View>
      </Animated.View>
    </Pressable>
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
            <AiToolChip
              key={tool.id}
              tool={tool}
              label={label}
              selected={selected}
              disabled={disabled}
              compact={compact}
              width={compact ? compactChipWidth : undefined}
              onPress={() => onChange(toggleSelectedAiTool(value, tool.id))}
            />
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
    backgroundColor: outlineFill,
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
  chipBorder: {
    borderWidth: outlineBorderWidth,
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
    ...font('400'),
  },
  chipLabelCompact: {
    flex: 0,
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
  },
  chipLabelSelected: {
    fontWeight: '500',
    ...font('500'),
  },
});
