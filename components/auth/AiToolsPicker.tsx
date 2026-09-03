import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AI_TOOLS_CATALOG, MAX_SELECTED_AI_TOOLS } from '../../data/aiToolsCatalog';
import { colors, font, Text } from '../../theme';
import { outlineBorderColor } from '../../theme/surface';
import { LogoChipGrid } from './LogoChipGrid';

type AiToolsPickerProps = {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
  /** Плотнее (профиль): 3 в ряд по ширине контейнера. */
  dense?: boolean;
};

/** Мультивыбор IDE — заголовок в том же divider-стиле, что у моделей. */
export function AiToolsPicker({
  value,
  onChange,
  compact = false,
  dense = false,
}: AiToolsPickerProps) {
  const { t } = useTranslation();
  const label = t('register.finder.aiToolsPickerHint');

  const items = useMemo(
    () =>
      AI_TOOLS_CATALOG.map((tool) => ({
        id: tool.id,
        label: t(tool.nameKey),
        logo: tool.logo,
      })),
    [t],
  );

  return (
    <View style={[styles.wrap, dense && styles.wrapDense]}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={[styles.dividerLabel, dense && styles.dividerLabelDense]}>
          {label}
        </Text>
        <View style={styles.dividerLine} />
      </View>
      <LogoChipGrid
        items={items}
        value={value}
        max={MAX_SELECTED_AI_TOOLS}
        onChange={onChange}
        compact={compact || dense}
        dense={dense}
        compactRowGap={dense ? 6 : 10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  wrapDense: {
    gap: 8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: outlineBorderColor,
  },
  dividerLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    ...font('400'),
  },
  dividerLabelDense: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
