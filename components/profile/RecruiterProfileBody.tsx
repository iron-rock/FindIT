import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { RecruiterProfile } from '../../lib/profileTypes';
import { colors, Text } from '../../theme';
import { outlineBlock, outlineRadius } from '../../theme/surface';
import { ProfileFieldRow } from './ProfileFieldRow';

type RecruiterProfileBodyProps = {
  profile: RecruiterProfile;
};

export function RecruiterProfileBody({ profile }: RecruiterProfileBodyProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.root}>
      <Text style={styles.contactLabel}>{t('profile.contactPerson')}</Text>
      <Text style={styles.contactName}>{profile.contactName}</Text>

      <View style={styles.fieldsBlock}>
        <ProfileFieldRow label={t('profile.corpEmail')} value={profile.corpEmail} />
        <ProfileFieldRow label={t('profile.companyLink')} value={profile.companyLink} />
        <ProfileFieldRow label={t('profile.industry')} value={profile.industry} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 16,
  },
  contactLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: -4,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: -8,
  },
  fieldsBlock: {
    gap: 14,
    padding: 16,
    ...outlineBlock(outlineRadius),
  },
});
