import { useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import type { ImageSourcePropType, LayoutChangeEvent } from 'react-native';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { colors, font, Text } from '../../theme';
import { outlineFill, outlineRadius, softFill } from '../../theme/surface';

const COMPACT_COLS = 3;
const COMPACT_GAP = 4;
const DENSE_GAP = 3;
const SELECT_ANIM_MS = 240;
const DISABLED_OPACITY = 0.4;

const AnimatedText = Animated.createAnimatedComponent(Text);

export type LogoChipItem = {
  id: string;
  label: string;
  logo: ImageSourcePropType;
};

type LogoChipGridProps = {
  /** Если не передан — заголовок над сеткой не рисуется (например, текст уже в divider). */
  hint?: string;
  items: LogoChipItem[];
  value: string;
  max: number;
  onChange: (value: string) => void;
  compact?: boolean;
  /** Ещё плотнее: для edit в профиле. */
  dense?: boolean;
  /** Вертикальный gap в compact-сетке (по умолчанию = column gap). */
  compactRowGap?: number;
};

type LogoChipProps = {
  item: LogoChipItem;
  selected: boolean;
  disabled: boolean;
  compact: boolean;
  dense: boolean;
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

function LogoChip({
  item,
  selected,
  disabled,
  compact,
  dense,
  width,
  onPress,
}: LogoChipProps) {
  const selection = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const gridOpacity = useRef(new Animated.Value(disabled ? DISABLED_OPACITY : 1)).current;

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

  const fillColor = selection.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0)', softFill],
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
            dense && styles.chipDense,
            compact && width != null && { width, maxWidth: width },
            {
              borderRadius: outlineRadius,
              backgroundColor: fillColor,
            },
          ]}
        >
          <Image
            source={item.logo}
            accessibilityLabel={item.id}
            style={[
              styles.logo,
              compact && styles.logoCompact,
              dense && styles.logoDense,
            ]}
            contentFit="contain"
          />
          <AnimatedText
            style={[
              styles.chipLabel,
              compact && styles.chipLabelCompact,
              dense && styles.chipLabelDense,
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
  dense = false,
  compactRowGap,
}: LogoChipGridProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const selectedCount = value ? value.split(',').filter(Boolean).length : 0;
  const atLimit = selectedCount >= max;
  const colGap = dense ? DENSE_GAP : COMPACT_GAP;
  const rowGap = compactRowGap ?? colGap;

  const onTrackLayout = (event: LayoutChangeEvent) => {
    const next = Math.floor(event.nativeEvent.layout.width);
    if (next > 0 && next !== trackWidth) {
      setTrackWidth(next);
    }
  };

  const compactChipWidth =
    compact && trackWidth > 0
      ? Math.floor((trackWidth - colGap * (COMPACT_COLS - 1)) / COMPACT_COLS)
      : undefined;

  return (
    <View style={[styles.fieldGroup, dense && styles.fieldGroupDense]}>
      {hint ? <Text style={styles.label}>{hint}</Text> : null}

      <View
        onLayout={onTrackLayout}
        style={[
          styles.grid,
          compact
            ? {
                columnGap: colGap,
                rowGap,
              }
            : styles.gridDefault,
        ]}
      >
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
              dense={dense}
              width={compactChipWidth}
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
    gap: 12,
  },
  fieldGroupDense: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    textAlign: 'center',
    alignSelf: 'center',
    ...font('400'),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridDefault: {
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
  chipDense: {
    gap: 2,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  logo: {
    width: 22,
    height: 22,
  },
  logoCompact: {
    width: 20,
    height: 20,
  },
  logoDense: {
    width: 18,
    height: 18,
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
  chipLabelDense: {
    fontSize: 9,
    lineHeight: 11,
  },
  chipLabelSelected: {
    fontWeight: '500',
    ...font('500'),
  },
});
