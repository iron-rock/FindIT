import type { ImageSourcePropType } from 'react-native';

import type { I18nKey } from '../lib/i18n/types';

export type AiToolCatalogItem = {
  id: string;
  nameKey: I18nKey;
  logo: ImageSourcePropType;
};

export const MAX_SELECTED_AI_TOOLS = 2;

/**
 * Самые популярные AI IDE / coding assistants.
 * 6 шт. = 2×3: ряд 1 — Cursor, Claude Code, Codex; ряд 2 — остальное.
 */
export const AI_TOOLS_CATALOG: AiToolCatalogItem[] = [
  {
    id: 'cursor',
    nameKey: 'register.finder.aiToolsCatalog.cursor',
    logo: require('../assets/ai-tools/cursor.webp'),
  },
  {
    id: 'claude',
    nameKey: 'register.finder.aiToolsCatalog.claude',
    logo: require('../assets/ai-tools/claude.webp'),
  },
  {
    id: 'codex',
    nameKey: 'register.finder.aiToolsCatalog.codex',
    logo: require('../assets/ai-tools/codex.webp'),
  },
  {
    id: 'antigravity',
    nameKey: 'register.finder.aiToolsCatalog.antigravity',
    logo: require('../assets/ai-tools/antigravity.webp'),
  },
  {
    id: 'githubCopilot',
    nameKey: 'register.finder.aiToolsCatalog.githubCopilot',
    logo: require('../assets/ai-tools/githubCopilot.webp'),
  },
  {
    id: 'jetbrainsAi',
    nameKey: 'register.finder.aiToolsCatalog.jetbrainsAi',
    logo: require('../assets/ai-tools/jetbrainsAi.webp'),
  },
];

const catalogById = new Map(AI_TOOLS_CATALOG.map((tool) => [tool.id, tool]));

export function parseSelectedAiTools(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function formatSelectedAiTools(
  value: string,
  translate?: (key: I18nKey) => string,
): string {
  return parseSelectedAiTools(value)
    .map((id) => {
      const tool = catalogById.get(id);
      if (!tool) {
        return id;
      }
      return translate ? translate(tool.nameKey) : id;
    })
    .join(', ');
}

export function toggleSelectedAiTool(selectedCsv: string, toolId: string): string {
  const selected = parseSelectedAiTools(selectedCsv);
  const index = selected.indexOf(toolId);

  if (index >= 0) {
    return selected.filter((id) => id !== toolId).join(',');
  }

  if (selected.length >= MAX_SELECTED_AI_TOOLS) {
    return selectedCsv;
  }

  return [...selected, toolId].join(',');
}

export function isAiToolSelected(selectedCsv: string, toolId: string): boolean {
  return parseSelectedAiTools(selectedCsv).includes(toolId);
}
