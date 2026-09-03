import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { GitCommit } from '../../lib/git';
import { colors, font, Text } from '../../theme';

type GitCommitsListProps = {
  commits: GitCommit[];
};

function formatCommitDate(iso: string, language: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString(language.startsWith('ru') ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'short',
  });
}

/** Таблица последних коммитов. Источник — кэш `vcs_commits` / мок. */
export function GitCommitsList({ commits }: GitCommitsListProps) {
  const { t, i18n } = useTranslation();
  if (commits.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.caption}>{t('profile.gitCommits')}</Text>
      <View style={styles.table}>
        {commits.map((commit) => (
          <View key={commit.id} style={styles.row}>
            <View style={styles.main}>
              <Text style={styles.message} numberOfLines={1}>
                {commit.message}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {commit.repo}
              </Text>
            </View>
            <Text style={styles.date}>
              {formatCommitDate(commit.committedAt, i18n.language)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  caption: {
    fontSize: 13,
    color: colors.textMuted,
  },
  table: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  main: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    ...font('500'),
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
    paddingTop: 2,
  },
});
