import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AI_TOOLS_CATALOG } from '../../data/aiToolsCatalog';
import type { FinderProfile } from '../../lib/profileTypes';
import { colors, Text } from '../../theme';
import { outlineBorder, outlineBorderPressed, outlineRadius } from '../../theme/surface';
import { ExperienceTimeline } from './ExperienceTimeline';
import {
  ProfileFieldRow,
  ProfileSection,
  ProfileStackTags,
} from './ProfileFieldRow';

const catalogById = new Map(AI_TOOLS_CATALOG.map((tool) => [tool.id, tool]));

type FinderProfileBodyProps = {
  profile: FinderProfile;
};

export function FinderProfileBody({ profile }: FinderProfileBodyProps) {
  const { t } = useTranslation();
  const tools = profile.selectedAiTools
    .map((id) => catalogById.get(id))
    .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));

  return (
    <View style={styles.root}>
      <ProfileSection title={t('profile.aiTools')}>
        {tools.length > 0 ? (
          <View style={styles.tools}>
            {tools.map((tool) => (
              <View key={tool.id} style={styles.toolChip}>
                <Image
                  source={tool.logo}
                  accessibilityLabel={tool.id}
                  style={styles.toolLogo}
                  contentFit="contain"
                />
                <Text style={styles.toolLabel}>{t(tool.nameKey)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.placeholder}>{t('profile.addField')}</Text>
        )}
      </ProfileSection>

      <ProfileSection title={t('profile.gitlab')}>
        <Pressable
          accessibilityRole="link"
          style={({ pressed }) => [
            styles.linkRow,
            pressed && outlineBorderPressed,
          ]}
          onPress={() => {}}
        >
          <Ionicons name="logo-gitlab" size={20} color={colors.textPrimary} />
          <Text style={styles.linkText} numberOfLines={1}>
            {profile.gitlabUrl?.trim() || t('profile.addField')}
          </Text>
        </Pressable>
      </ProfileSection>

      <ProfileSection title={t('profile.stack')}>
        <ProfileStackTags stack={profile.stack} />
      </ProfileSection>

      <View style={styles.fieldsBlock}>
        <ProfileFieldRow label={t('profile.position')} value={profile.position} />
        <ProfileFieldRow label={t('profile.salary')} value={profile.salary} />
        <ProfileFieldRow label={t('profile.workFormat')} value={profile.workFormat} />
      </View>

      <ProfileSection title={t('profile.experience')}>
        <ExperienceTimeline
          yearsExperience={profile.yearsExperience}
          experience={profile.experience}
        />
      </ProfileSection>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 20,
  },
  tools: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toolChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: outlineRadius,
    backgroundColor: colors.surfaceMuted,
    ...outlineBorder,
  },
  toolLogo: {
    width: 22,
    height: 22,
  },
  toolLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  placeholder: {
    fontSize: 16,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  fieldsBlock: {
    gap: 14,
  },
});
