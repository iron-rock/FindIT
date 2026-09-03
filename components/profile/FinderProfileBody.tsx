import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import { AiModelsPicker } from '../auth/AiModelsPicker';
import {
  AI_MODELS_CATALOG,
  parseSelectedAiModels,
} from '../../data/aiModelsCatalog';
import type { FinderProfile } from '../../lib/profileTypes';
import { gitFromFinder } from '../../lib/git';
import { formatSalaryDisplay, sanitizeSalaryDigits } from '../../lib/salary';
import {
  WORK_FORMAT_LABEL_KEY,
  type WorkFormat,
} from '../../lib/workFormat';
import { colors, Text } from '../../theme';
import { outlineRadius, softFill } from '../../theme/surface';
import { ExperienceTimeline } from './ExperienceTimeline';
import { GitProfileBlock } from './GitProfileBlock';
import { ProfileBrick } from './ProfileBrick';
import { ProfileFieldRow, ProfileStackTags } from './ProfileFieldRow';
import { ProfileTextField } from './ProfileTextField';
import { StackTechInput } from './StackTechInput';
import { WorkFormatAccordion } from './WorkFormatAccordion';

const modelsById = new Map(AI_MODELS_CATALOG.map((model) => [model.id, model]));

export type FinderBrickId =
  | 'about'
  | 'aiModels'
  | 'git'
  | 'stack'
  | 'expectations'
  | 'experience';

type FinderProfileBodyProps = {
  profile: FinderProfile;
  preEdit: boolean;
  editingBrick: FinderBrickId | null;
  dirty: boolean;
  glowProgress?: Animated.Value | Animated.AnimatedInterpolation<number>;
  onSelectBrick: (id: FinderBrickId) => void;
  onCancelBrick: () => void;
  onSaveBrick: (next: FinderProfile) => void;
  onDirtyChange: (dirty: boolean) => void;
};

export function FinderProfileBody({
  profile,
  preEdit,
  editingBrick,
  dirty,
  glowProgress,
  onSelectBrick,
  onCancelBrick,
  onSaveBrick,
  onDirtyChange,
}: FinderProfileBodyProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    if (editingBrick) {
      setDraft(
        editingBrick === 'git'
          ? { ...profile, git: gitFromFinder(profile) }
          : profile,
      );
      onDirtyChange(false);
    }
  }, [editingBrick, profile, onDirtyChange]);

  useEffect(() => {
    if (!editingBrick) {
      return;
    }
    onDirtyChange(JSON.stringify(draft) !== JSON.stringify(profile));
  }, [draft, editingBrick, onDirtyChange, profile]);

  const models = (profile.selectedAiModels ?? [])
    .map((id) => modelsById.get(id))
    .filter((model): model is NonNullable<typeof model> => Boolean(model));

  const brickProps = (id: FinderBrickId) => ({
    preEdit: preEdit && editingBrick !== id,
    editing: editingBrick === id,
    dirty: editingBrick === id ? dirty : false,
    glowProgress,
    onSelect: () => onSelectBrick(id),
    onCancel: onCancelBrick,
    onSave: () => onSaveBrick(draft),
  });

  return (
    <View style={styles.root}>
      <ProfileBrick title={t('profile.about')} {...brickProps('about')}>
        {editingBrick === 'about' ? (
          <ProfileTextField
            value={draft.about ?? ''}
            onChangeText={(text) =>
              setDraft((prev) => ({ ...prev, about: text }))
            }
            multiline
            placeholder="…"
          />
        ) : profile.about?.trim() ? (
          <Text style={styles.aboutBody}>{profile.about.trim()}</Text>
        ) : (
          <Text style={styles.placeholder}>{t('profile.addField')}</Text>
        )}
      </ProfileBrick>

      <ProfileBrick title={t('profile.aiModels')} {...brickProps('aiModels')}>
        {editingBrick === 'aiModels' ? (
          <AiModelsPicker
            dense
            hideTitle
            value={(draft.selectedAiModels ?? []).join(',')}
            onChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                selectedAiModels: parseSelectedAiModels(value),
              }))
            }
          />
        ) : models.length > 0 ? (
          <View style={styles.aiView}>
            {models.map((model) => (
              <View key={model.id} style={styles.toolChip}>
                <Image
                  source={model.logo}
                  accessibilityLabel={model.id}
                  style={styles.toolLogo}
                  contentFit="contain"
                />
                <Text style={styles.toolLabel}>{t(model.nameKey)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.placeholder}>{t('profile.addField')}</Text>
        )}
      </ProfileBrick>

      <ProfileBrick title={t('profile.stack')} {...brickProps('stack')}>
        {editingBrick === 'stack' ? (
          <StackTechInput
            value={draft.stack}
            onChange={(stack) => setDraft((prev) => ({ ...prev, stack }))}
          />
        ) : (
          <ProfileStackTags stack={profile.stack} />
        )}
      </ProfileBrick>

      <ProfileBrick
        title={t('profile.expectations')}
        {...brickProps('expectations')}
      >
        {editingBrick === 'expectations' ? (
          <View style={styles.fieldsEdit}>
            <ProfileTextField
              label={t('profile.position')}
              value={draft.position ?? ''}
              onChangeText={(text) =>
                setDraft((prev) => ({ ...prev, position: text }))
              }
            />
            <ProfileTextField
              label={t('profile.salary')}
              value={draft.salary ?? ''}
              onChangeText={(text) =>
                setDraft((prev) => ({
                  ...prev,
                  salary: sanitizeSalaryDigits(text),
                }))
              }
              keyboardType="numeric"
              prefix="$"
              placeholder=""
            />
            <WorkFormatAccordion
              value={draft.workFormats}
              onChange={(workFormats: WorkFormat[]) =>
                setDraft((prev) => ({ ...prev, workFormats }))
              }
            />
          </View>
        ) : (
          <View style={styles.fieldsBlock}>
            <ProfileFieldRow label={t('profile.position')} value={profile.position} />
            <ProfileFieldRow
              label={t('profile.salary')}
              value={formatSalaryDisplay(profile.salary)}
            />
            <ProfileFieldRow
              label={t('profile.workFormat')}
              value={
                profile.workFormats.length > 0
                  ? profile.workFormats
                      .map((id) => t(WORK_FORMAT_LABEL_KEY[id]))
                      .join(', ')
                  : undefined
              }
            />
          </View>
        )}
      </ProfileBrick>

      <ProfileBrick title={t('profile.experience')} {...brickProps('experience')}>
        {editingBrick === 'experience' ? (
          <ProfileTextField
            label={t('register.finder.years')}
            value={String(draft.yearsExperience)}
            onChangeText={(text) =>
              setDraft((prev) => ({
                ...prev,
                yearsExperience: Number.parseInt(text, 10) || 0,
              }))
            }
            keyboardType="numeric"
          />
        ) : (
          <ExperienceTimeline
            yearsExperience={profile.yearsExperience}
            experience={profile.experience}
          />
        )}
      </ProfileBrick>

      <ProfileBrick title={t('profile.git')} {...brickProps('git')}>
        <GitProfileBlock
          git={gitFromFinder(editingBrick === 'git' ? draft : profile)}
          editing={editingBrick === 'git'}
          onChange={(next) => setDraft((prev) => ({ ...prev, git: next }))}
        />
      </ProfileBrick>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
    overflow: 'visible',
  },
  aiView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  toolChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: outlineRadius,
    backgroundColor: softFill,
  },
  toolLogo: {
    width: 16,
    height: 16,
  },
  toolLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  placeholder: {
    fontSize: 15,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  aboutBody: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  fieldsBlock: {
    gap: 12,
  },
  fieldsEdit: {
    gap: 12,
  },
});
