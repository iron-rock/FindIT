import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AI_MODELS_CATALOG, MAX_SELECTED_AI_MODELS } from '../../data/aiModelsCatalog';
import { colors, font, Text } from '../../theme';
import { LogoChipGrid } from './LogoChipGrid';

type AiModelsPickerProps = {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
  /** Плотнее (профиль): 3 в ряд по ширине контейнера. */
  dense?: boolean;
  /** Скрыть заголовок (если уже есть title кирпича). */
  hideTitle?: boolean;
};

/** Сетка избранных моделей (3 в ряд); заголовок — как title секции, без divider. */
export function AiModelsPicker({
  value,
  onChange,
  compact = false,
  dense = false,
  hideTitle = false,
}: AiModelsPickerProps) {
  const { t } = useTranslation();
  const label = t('register.finder.aiModelsPickerHint');

  const items = useMemo(
    () =>
      AI_MODELS_CATALOG.map((model) => ({
        id: model.id,
        label: t(model.nameKey),
        logo: model.logo,
      })),
    [t],
  );

  return (
    <View style={[styles.wrap, dense && styles.wrapDense]}>
      {!hideTitle ? (
        <Text style={[styles.title, dense && styles.titleDense]}>{label}</Text>
      ) : null}
      <LogoChipGrid
        items={items}
        value={value}
        max={MAX_SELECTED_AI_MODELS}
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
  title: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
    ...font('500'),
  },
  titleDense: {
    fontSize: 12,
    letterSpacing: 0.4,
  },
});
