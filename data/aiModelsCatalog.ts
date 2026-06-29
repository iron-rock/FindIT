import type { ImageSourcePropType } from 'react-native';

import type { I18nKey } from '../lib/i18n/types';

export type AiModelCatalogItem = {
  id: string;
  nameKey: I18nKey;
  logo: ImageSourcePropType;
};

export const MAX_SELECTED_AI_MODELS = 2;

/**
 * Актуальные модели, популярные в Cursor. Лого: переиспользуем бренды из
 * `assets/ai-tools/` (Claude/OpenAI/Gemini/Cursor) + белые PNG в `assets/ai-models/`.
 * Порядок = по алфавиту.
 */
export const AI_MODELS_CATALOG: AiModelCatalogItem[] = [
  {
    id: 'claude',
    nameKey: 'register.finder.aiModelsCatalog.claude',
    logo: require('../assets/ai-tools/claude.webp'),
  },
  {
    id: 'composer',
    nameKey: 'register.finder.aiModelsCatalog.composer',
    logo: require('../assets/ai-tools/cursor.webp'),
  },
  {
    id: 'deepseek',
    nameKey: 'register.finder.aiModelsCatalog.deepseek',
    logo: require('../assets/ai-models/deepseek.png'),
  },
  {
    id: 'gemini',
    nameKey: 'register.finder.aiModelsCatalog.gemini',
    logo: require('../assets/ai-tools/gemini.webp'),
  },
  {
    id: 'gpt5',
    nameKey: 'register.finder.aiModelsCatalog.gpt5',
    logo: require('../assets/ai-tools/chatgpt.webp'),
  },
  {
    id: 'grok',
    nameKey: 'register.finder.aiModelsCatalog.grok',
    logo: require('../assets/ai-models/grok.png'),
  },
];
