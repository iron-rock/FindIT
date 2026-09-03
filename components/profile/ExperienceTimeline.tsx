import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { WorkExperience } from '../../lib/profileTypes';
import { colors, Text } from '../../theme';
import { ProfileAvatar } from './ProfileAvatar';

type ExperienceTimelineProps = {
  yearsExperience: number;
  experience: WorkExperience[];
};

function formatPeriod(
  start: string,
  end: string | null | undefined,
  presentLabel: string,
): string {
  if (!end) {
    return `${start} — ${presentLabel}`;
  }
  return `${start} — ${end}`;
}

export function ExperienceTimeline({ yearsExperience, experience }: ExperienceTimelineProps) {
  const { t } = useTranslation();
  const yearsLabel =
    yearsExperience === 1
      ? t('profile.yearsExperience_one', { count: yearsExperience })
      : t('profile.yearsExperience', { count: yearsExperience });

  return (
    <View style={styles.root}>
      <Text style={styles.summary}>{yearsLabel}</Text>
      <View style={styles.list}>
        {experience.map((item, index) => (
          <View
            key={item.id}
            style={[styles.item, index < experience.length - 1 && styles.itemBorder]}
          >
            <ProfileAvatar name={item.company} size={48} />
            <View style={styles.itemBody}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.company}>
                {item.company}
                {item.employmentType ? ` · ${item.employmentType}` : ''}
              </Text>
              <Text style={styles.meta}>
                {formatPeriod(item.startDate, item.endDate, t('profile.present'))}
                {item.location ? ` · ${item.location}` : ''}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
  },
  summary: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  list: {
    gap: 0,
    marginHorizontal: -4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  itemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  itemBody: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  company: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 19,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
