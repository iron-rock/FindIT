import { useEffect, useRef } from 'react';
import { Image } from 'expo-image';
import type { ImageSourcePropType } from 'react-native';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { colors, font, Text } from '../../theme';
import { outlineBorderWidth, outlineFill, outlineRadius } from '../../theme/surface';
import { useAuthOutline } from './AuthOutlineContext';

const COMPACT_COLS = 3;
const COMPACT_GAP = 4;
const COMPACT_H_PADDING = 48;
const SELECT_ANIM_MS = 240;
const DISABLED_OPACITY = 0.4;

const AnimatedText = Animated.createAnimatedComponent(Text);

export type LogoChipItem = {
  id: string;
  label: string;
  logo: ImageSourcePropType;
};

type LogoChipGridProps = {
  hint: string;
  items: LogoChipItem[];
  value: string;
  max: number;
  onChange: (value: string) => void;
  compact?: boolean;
};

type LogoChipProps = {
  item: LogoChipItem;
  selected: boolean;
  disabled: boolean;
  compact: boolean;
  width?: number;
  onPress: () => void;
};

function parseSelected(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function toggleSelected(value: string, id: string, max: number): string {
  const selected = parseSelected(value);
  if (selected.includes(id)) {
    return selected.filter((item) => item !== id).join(',');
  }
  if (selected.length >= max) {
    return value;
  }
  return [...selected, id].join(',');
}

function LogoChip({ item, selected, disabled, compact, width, onPress }: LogoChipProps) {
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
      accessibilityLabel={item.label}
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
          <Image
            source={item.logo}
            accessibilityLabel={item.id}
            style={[styles.logo, compact && styles.logoCompact]}
            contentFit="contain"
          />
          <AnimatedText
            style={[
              styles.chipLabel,
              compact && styles.chipLabelCompact,
              selected && styles.chipLabelSelected,
              { color: labelColor },
            ]}
            numberOfLines={1}
          >
            {item.label}
          </AnimatedText>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

/** Мультивыбор по сетке логотип + название (общая основа для tools и models). */
export function LogoChipGrid({
  hint,
  items,
  value,
  max,
  onChange,
  compact = false,
}: LogoChipGridProps) {
  const { width: windowWidth } = useWindowDimensions();
  const selectedCount = value ? value.split(',').filter(Boolean).length : 0;
  const atLimit = selectedCount >= max;

  const compactChipWidth = Math.floor(
    (windowWidth - COMPACT_H_PADDING - COMPACT_GAP * (COMPACT_COLS - 1)) / COMPACT_COLS,
  );

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{hint}</Text>

      <View style={[styles.grid, compact && styles.gridCompact]}>
        {items.map((item) => {
          const selected = parseSelected(value).includes(item.id);
          const disabled = !selected && atLimit;

          return (
            <LogoChip
              key={item.id}
              item={item}
              selected={selected}
              disabled={disabled}
              compact={compact}
              width={compact ? compactChipWidth : undefined}
              onPress={() => onChange(toggleSelected(value, item.id, max))}
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
