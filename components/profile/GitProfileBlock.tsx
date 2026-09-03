import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ensureMockActivity } from '../../data/mockGitActivity';
import {
  gitDisplayUrl,
  gitProvider,
  type FinderGit,
  type VcsProvider,
} from '../../lib/git';
import { colors, font, Text } from '../../theme';
import { outlineBorderColor, outlineRadius } from '../../theme/surface';
import { GitContributionGrid } from './GitContributionGrid';
import { ProfileTextField } from './ProfileTextField';

type GitProfileBlockProps = {
  git: FinderGit;
  editing: boolean;
  onChange?: (git: FinderGit) => void;
};

function providerIcon(provider: VcsProvider | null): keyof typeof Ionicons.glyphMap {
  if (provider === 'gitlab') {
    return 'logo-gitlab';
  }
  if (provider === 'github') {
    return 'logo-github';
  }
  return 'git-branch-outline';
}

function patchGit(git: FinderGit, patch: Partial<FinderGit>): FinderGit {
  const next = { ...git, ...patch };
  if (!next.showGrid) {
    return next;
  }
  return ensureMockActivity(next);
}

export function GitProfileBlock({ git, editing, onChange }: GitProfileBlockProps) {
  const { t } = useTranslation();
  const url = gitDisplayUrl(git);
  const provider = gitProvider(git);
  const showGrid = Boolean(git.showGrid);

  if (editing) {
    return (
      <View style={styles.edit}>
        <View style={styles.urlRow}>
          <Ionicons
            name={providerIcon(provider)}
            size={22}
            color={colors.textPrimary}
            style={styles.urlIcon}
          />
          <View style={styles.urlField}>
            <ProfileTextField
              label={t('profile.gitUrl')}
              value={git.profileUrl ?? ''}
              onChangeText={(text) => onChange?.(patchGit(git, { profileUrl: text }))}
              placeholder={t('profile.gitUrlPh')}
              autoCapitalize="none"
            />
          </View>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: showGrid }}
          accessibilityLabel={t('profile.gitShowGrid')}
          onPress={() => onChange?.(patchGit(git, { showGrid: !showGrid }))}
          style={({ pressed }) => [styles.checkRow, pressed && styles.pressed]}
        >
          <View style={[styles.checkBox, showGrid && styles.checkBoxOn]}>
            {showGrid ? (
              <Ionicons name="checkmark" size={16} color={colors.background} />
            ) : null}
          </View>
          <Text style={styles.checkLabel}>{t('profile.gitShowGrid')}</Text>
        </Pressable>
      </View>
    );
  }

  if (!url) {
    return <Text style={styles.placeholder}>{t('profile.addField')}</Text>;
  }

  return (
    <View style={styles.view}>
      <View style={styles.linkRow}>
        <Ionicons name={providerIcon(provider)} size={20} color={colors.textPrimary} />
        <Text style={styles.linkText} numberOfLines={1}>
          {url}
        </Text>
      </View>

      {showGrid ? <GitContributionGrid days={git.contributions} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    gap: 14,
  },
  edit: {
    gap: 14,
  },
  placeholder: {
    fontSize: 15,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  urlIcon: {
    marginTop: 28,
  },
  urlField: {
    flex: 1,
    minWidth: 0,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    ...font('500'),
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 44,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: outlineRadius,
    borderWidth: 1,
    borderColor: outlineBorderColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxOn: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  checkLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    ...font('500'),
  },
  pressed: {
    opacity: 0.72,
  },
});
