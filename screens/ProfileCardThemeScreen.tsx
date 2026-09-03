import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackLink } from '../components/navigation/BackLink';
import {
  isFinderProfile,
  type FinderProfile,
} from '../lib/profileTypes';
import { RESUME_CARD_THEMES } from '../lib/resumeCardTheme';
import { useMainSession } from '../navigation/MainSessionContext';
import type { ProfileStackParamList } from '../navigation/types';
import { colors, Text } from '../theme';
import {
  outlineBorderPressed,
  outlineRadius,
  softOutlineSurface,
  softSurfacePressed,
} from '../theme/surface';

export type ProfileCardThemeScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  'ProfileCardTheme'
>;

export function ProfileCardThemeScreen({ navigation }: ProfileCardThemeScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { profile, setProfile } = useMainSession();
  const topPad = Math.max(insets.top, 10) + 8;

  const themeId =
    isFinderProfile(profile) && profile.cardThemeId
      ? profile.cardThemeId
      : 'classic';

  const selectTheme = (id: string) => {
    if (!isFinderProfile(profile)) {
      return;
    }
    setProfile({ ...profile, cardThemeId: id } satisfies FinderProfile);
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad, paddingBottom: 140 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <BackLink onPress={() => navigation.goBack()} />
      <Text style={styles.title}>{t('profile.cardThemeTitle')}</Text>
      <Text style={styles.hint}>{t('profile.cardThemeHint')}</Text>

      <View style={styles.themeList}>
        {RESUME_CARD_THEMES.map((theme) => {
          const selected = theme.id === themeId;
          return (
            <Pressable
              key={theme.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => selectTheme(theme.id)}
              style={({ pressed }) => [
                softOutlineSurface(outlineRadius),
                styles.themeRow,
                selected && styles.themeRowSelected,
                pressed && softSurfacePressed,
                pressed && outlineBorderPressed,
              ]}
            >
              <Text style={styles.themeLabel}>{t(theme.nameKey)}</Text>
              {selected ? <Text style={styles.themeCheck}>✓</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  hint: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 21,
    marginTop: -4,
  },
  themeList: {
    gap: 10,
    marginTop: 4,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  themeRowSelected: {
    borderColor: colors.accentBright,
  },
  themeLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  themeCheck: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accentBright,
  },
});
