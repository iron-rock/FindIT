import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackLink } from '../components/navigation/BackLink';
import type { ProfileStackParamList } from '../navigation/types';
import { colors, Text } from '../theme';

export type ProfileRatingsScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  'ProfileRatings'
>;

export function ProfileRatingsScreen({ navigation }: ProfileRatingsScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, 10) + 8;

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <BackLink onPress={() => navigation.goBack()} />
      <Text style={styles.title}>{t('profile.ratings')}</Text>
      <Text style={styles.subtitle}>{t('profile.ratingsEmpty')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 22,
  },
});
