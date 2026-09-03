import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { GitContributionDay } from '../../lib/git';
import { colors, Text } from '../../theme';

const GAP = 2;
const LEVELS = [
  'rgba(255, 255, 255, 0.07)',
  'rgba(94, 184, 232, 0.28)',
  'rgba(94, 184, 232, 0.48)',
  'rgba(94, 184, 232, 0.72)',
  colors.accent,
] as const;

function levelForCount(count: number): number {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

function weeksFromDays(days: GitContributionDay[]): GitContributionDay[][] {
  const weeks: GitContributionDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

type GitContributionGridProps = {
  days: GitContributionDay[];
};

/** Heatmap активности на всю ширину секции. Коммиты хранятся отдельно, в UI не показываем. */
export function GitContributionGrid({ days }: GitContributionGridProps) {
  const { t } = useTranslation();
  if (days.length === 0) {
    return null;
  }

  const weeks = weeksFromDays(days);
  const total = days.reduce((sum, day) => sum + day.count, 0);

  return (
    <View
      accessible
      accessibilityLabel={t('profile.gitActivityA11y', { count: total })}
      style={styles.wrap}
    >
      <Text style={styles.caption}>{t('profile.gitActivity')}</Text>
      <View style={styles.grid}>
        {weeks.map((week) => (
          <View key={week[0]?.date ?? String(week.length)} style={styles.week}>
            {week.map((day) => (
              <View
                key={day.date}
                style={[
                  styles.cell,
                  { backgroundColor: LEVELS[levelForCount(day.count)] },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    alignSelf: 'stretch',
  },
  caption: {
    fontSize: 13,
    color: colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    width: '100%',
    gap: GAP,
  },
  week: {
    flex: 1,
    gap: GAP,
    minWidth: 0,
  },
  cell: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 2,
  },
});
