import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { AI_TOOLS_CATALOG, MAX_SELECTED_AI_TOOLS } from '../../data/aiToolsCatalog';
import { LogoChipGrid } from './LogoChipGrid';

type AiToolsPickerProps = {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
};

/** Мультивыбор популярных AI-инструментов (до 2) с названием и лого. */
export function AiToolsPicker({ value, onChange, compact = false }: AiToolsPickerProps) {
  const { t } = useTranslation();

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
    <LogoChipGrid
      hint={t('register.finder.aiToolsPickerHint', { max: MAX_SELECTED_AI_TOOLS })}
      items={items}
      value={value}
      max={MAX_SELECTED_AI_TOOLS}
      onChange={onChange}
      compact={compact}
    />
  );
}
