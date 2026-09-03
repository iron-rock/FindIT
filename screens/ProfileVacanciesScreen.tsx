import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackLink } from '../components/navigation/BackLink';
import { vacancies } from '../data/vacancies';
import { useMainSession } from '../navigation/MainSessionContext';
import type { ProfileStackParamList } from '../navigation/types';
import { colors, Text } from '../theme';
import { outlineRadius, softOutlineSurface } from '../theme/surface';
import { isRecruiterProfile } from '../lib/profileTypes';

export type ProfileVacanciesScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  'ProfileVacancies'
>;

export function ProfileVacanciesScreen({ navigation }: ProfileVacanciesScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { profile } = useMainSession();
  const topPad = Math.max(insets.top, 10) + 8;

  const companyName = isRecruiterProfile(profile) ? profile.companyName : '';
  const mine = vacancies.filter(
    (v) => !companyName || v.company === companyName,
  );
  const list = mine.length > 0 ? mine : vacancies.slice(0, 2);

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
      <Text style={styles.title}>{t('profile.myVacancies')}</Text>
      <Text style={styles.subtitle}>{t('profile.myVacanciesHint')}</Text>

      <View style={styles.list}>
        {list.map((vacancy) => (
          <View key={vacancy.id} style={styles.card}>
            <Text style={styles.cardTitle}>{vacancy.title}</Text>
            <Text style={styles.cardMeta}>
              {vacancy.grade} · {vacancy.salaryRange}
            </Text>
            <Text style={styles.cardLoc}>{vacancy.locationFormat}</Text>
          </View>
        ))}
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
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 21,
    marginTop: -4,
  },
  list: {
    gap: 10,
  },
  card: {
    padding: 16,
    gap: 4,
    ...softOutlineSurface(outlineRadius),
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cardMeta: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  cardLoc: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
