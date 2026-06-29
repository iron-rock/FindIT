import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { AI_MODELS_CATALOG, MAX_SELECTED_AI_MODELS } from '../../data/aiModelsCatalog';
import { LogoChipGrid } from './LogoChipGrid';

type AiModelsPickerProps = {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
};

/** Мультивыбор актуальных AI-моделей (до 2) — та же сетка, что и у инструментов. */
export function AiModelsPicker({ value, onChange, compact = false }: AiModelsPickerProps) {
  const { t } = useTranslation();

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
    <LogoChipGrid
      hint={t('register.finder.aiModelsPickerHint', { max: MAX_SELECTED_AI_MODELS })}
      items={items}
      value={value}
      max={MAX_SELECTED_AI_MODELS}
      onChange={onChange}
      compact={compact}
    />
  );
}
