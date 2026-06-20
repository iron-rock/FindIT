import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FinderProfileBody } from '../components/profile/FinderProfileBody';
import { ProfileAvatar } from '../components/profile/ProfileAvatar';
import { RecruiterProfileBody } from '../components/profile/RecruiterProfileBody';
import { OutlineButton } from '../components/ui/OutlineButton';
import { isFinderProfile, isRecruiterProfile, profileDisplayName } from '../lib/profileTypes';
import { useMainSession } from '../navigation/MainSessionContext';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors, Text } from '../theme';

export type ProfileScreenProps = BottomTabScreenProps<MainTabParamList, 'Profile'>;

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { profile } = useMainSession();
  const displayName = profileDisplayName(profile);
  const subtitle = isFinderProfile(profile)
    ? profile.headline
    : isRecruiterProfile(profile)
      ? profile.industry
      : undefined;
  const topPad = Math.max(insets.top, 10) + 16;

  const signOut = () => {
    const parent = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
    parent?.reset({ index: 0, routes: [{ name: 'Welcome' }] });
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
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={2}>
            {displayName}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <ProfileAvatar name={displayName} size={84} />
      </View>

      {isFinderProfile(profile) ? (
        <FinderProfileBody profile={profile} />
      ) : (
        <RecruiterProfileBody profile={profile} />
      )}

      <OutlineButton
        title={t('common.signOut')}
        onPress={signOut}
        style={styles.signOut}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceDeep,
  },
  content: {
    paddingHorizontal: 20,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 22,
  },
  signOut: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
});
