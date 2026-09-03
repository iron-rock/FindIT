import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { RecruiterProfile } from '../../lib/profileTypes';
import { colors, Text } from '../../theme';
import { ProfileBrick } from './ProfileBrick';
import { ProfileFieldRow } from './ProfileFieldRow';
import { ProfileTextField } from './ProfileTextField';

export type RecruiterBrickId = 'company' | 'contact';

type RecruiterProfileBodyProps = {
  profile: RecruiterProfile;
  preEdit: boolean;
  editingBrick: RecruiterBrickId | null;
  dirty: boolean;
  glowProgress?: Animated.Value | Animated.AnimatedInterpolation<number>;
  onSelectBrick: (id: RecruiterBrickId) => void;
  onCancelBrick: () => void;
  onSaveBrick: (next: RecruiterProfile) => void;
  onDirtyChange: (dirty: boolean) => void;
};

export function RecruiterProfileBody({
  profile,
  preEdit,
  editingBrick,
  dirty,
  glowProgress,
  onSelectBrick,
  onCancelBrick,
  onSaveBrick,
  onDirtyChange,
}: RecruiterProfileBodyProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    if (editingBrick) {
      setDraft(profile);
      onDirtyChange(false);
    }
  }, [editingBrick, profile, onDirtyChange]);

  useEffect(() => {
    if (!editingBrick) {
      return;
    }
    onDirtyChange(JSON.stringify(draft) !== JSON.stringify(profile));
  }, [draft, editingBrick, onDirtyChange, profile]);

  const brickProps = (id: RecruiterBrickId) => ({
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
      <ProfileBrick
        title={t('profile.companySection')}
        {...brickProps('company')}
      >
        {editingBrick === 'company' ? (
          <View style={styles.fieldsEdit}>
            <ProfileTextField
              label={t('register.recruiter.company')}
              value={draft.companyName}
              onChangeText={(text) =>
                setDraft((prev) => ({ ...prev, companyName: text }))
              }
            />
            <ProfileTextField
              label={t('profile.industry')}
              value={draft.industry ?? ''}
              onChangeText={(text) =>
                setDraft((prev) => ({ ...prev, industry: text }))
              }
            />
            <ProfileTextField
              label={t('profile.companyLink')}
              value={draft.companyLink ?? ''}
              onChangeText={(text) =>
                setDraft((prev) => ({ ...prev, companyLink: text }))
              }
              autoCapitalize="none"
            />
          </View>
        ) : (
          <View style={styles.fieldsBlock}>
            <Text style={styles.companyName}>{profile.companyName}</Text>
            <ProfileFieldRow label={t('profile.industry')} value={profile.industry} />
            <ProfileFieldRow
              label={t('profile.companyLink')}
              value={profile.companyLink}
            />
          </View>
        )}
      </ProfileBrick>

      <ProfileBrick
        title={t('profile.contactPerson')}
        {...brickProps('contact')}
      >
        {editingBrick === 'contact' ? (
          <View style={styles.fieldsEdit}>
            <ProfileTextField
              label={t('profile.contactPerson')}
              value={draft.contactName}
              onChangeText={(text) =>
                setDraft((prev) => ({ ...prev, contactName: text }))
              }
            />
            <ProfileTextField
              label={t('profile.corpEmail')}
              value={draft.corpEmail ?? ''}
              onChangeText={(text) =>
                setDraft((prev) => ({ ...prev, corpEmail: text }))
              }
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        ) : (
          <View style={styles.fieldsBlock}>
            <Text style={styles.contactName}>{profile.contactName}</Text>
            <ProfileFieldRow label={t('profile.corpEmail')} value={profile.corpEmail} />
          </View>
        )}
      </ProfileBrick>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
  },
  fieldsBlock: {
    gap: 14,
  },
  fieldsEdit: {
    gap: 12,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
