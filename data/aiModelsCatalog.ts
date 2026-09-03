import type { ImageSourcePropType } from 'react-native';

import type { I18nKey } from '../lib/i18n/types';

export type AiModelFamily = 'grok' | 'claude' | 'gpt' | 'gemini' | 'qwen' | 'deepseek';

export type AiModelCatalogItem = {
  id: string;
  nameKey: I18nKey;
  logo: ImageSourcePropType;
  /** Семейство — один логотип на ветку. */
  family: AiModelFamily;
};

export const MAX_SELECTED_AI_MODELS = 3;

/**
 * Ровно 9 моделей (3×3), логотипы из `assets/ai-tools`:
 * Grok · Claude Opus/Sonnet · GPT Sol/Terra/Luna · Gemini · Qwen · DeepSeek
 */
export const AI_MODELS_CATALOG: AiModelCatalogItem[] = [
  {
    id: 'cursorGrok',
    nameKey: 'register.finder.aiModelsCatalog.cursorGrok',
    logo: require('../assets/ai-tools/grok.png'),
    family: 'grok',
  },
  {
    id: 'claudeOpus',
    nameKey: 'register.finder.aiModelsCatalog.claudeOpus',
    logo: require('../assets/ai-tools/claude.webp'),
    family: 'claude',
  },
  {
    id: 'claudeSonnet',
    nameKey: 'register.finder.aiModelsCatalog.claudeSonnet',
    logo: require('../assets/ai-tools/claude.webp'),
    family: 'claude',
  },
  {
    id: 'gptSol',
    nameKey: 'register.finder.aiModelsCatalog.gptSol',
    logo: require('../assets/ai-tools/chatgpt.webp'),
    family: 'gpt',
  },
  {
    id: 'gptTerra',
    nameKey: 'register.finder.aiModelsCatalog.gptTerra',
    logo: require('../assets/ai-tools/chatgpt.webp'),
    family: 'gpt',
  },
  {
    id: 'gptLuna',
    nameKey: 'register.finder.aiModelsCatalog.gptLuna',
    logo: require('../assets/ai-tools/chatgpt.webp'),
    family: 'gpt',
  },
  {
    id: 'gemini',
    nameKey: 'register.finder.aiModelsCatalog.gemini',
    logo: require('../assets/ai-tools/gemini.webp'),
    family: 'gemini',
  },
  {
    id: 'qwenCoder',
    nameKey: 'register.finder.aiModelsCatalog.qwenCoder',
    logo: require('../assets/ai-tools/qwen.png'),
    family: 'qwen',
  },
  {
    id: 'deepseek',
    nameKey: 'register.finder.aiModelsCatalog.deepseek',
    logo: require('../assets/ai-tools/deepseek.png'),
    family: 'deepseek',
  },
];

const catalogById = new Map(AI_MODELS_CATALOG.map((model) => [model.id, model]));

/** Старые id → актуальные (после разбиения деревьев). */
const LEGACY_MODEL_IDS: Record<string, string> = {
  claude: 'claudeSonnet',
  gpt5: 'gptSol',
  gptO3: 'gptTerra',
  gpt5Mini: 'gptLuna',
  mistral: 'deepseek',
  kimi: 'qwenCoder',
  llama: 'deepseek',
};

export function parseSelectedAiModels(value: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of value.split(',')) {
    const raw = part.trim();
    if (!raw) {
      continue;
    }
    const id = LEGACY_MODEL_IDS[raw] ?? raw;
    if (!catalogById.has(id) || seen.has(id)) {
      continue;
    }
    seen.add(id);
    result.push(id);
    if (result.length >= MAX_SELECTED_AI_MODELS) {
      break;
    }
  }
  return result;
}

export function getAiModelById(id: string): AiModelCatalogItem | undefined {
  return catalogById.get(id);
}
