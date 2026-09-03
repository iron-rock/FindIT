import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LanguageToggle } from '../components/i18n/LanguageToggle';
import { BackLink } from '../components/navigation/BackLink';
import { OutlineButton } from '../components/ui/OutlineButton';
import { resetToWelcome } from '../navigation/rootNavigation';
import type { ProfileStackParamList } from '../navigation/types';
import { colors, Text } from '../theme';

export type ProfileSettingsScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  'ProfileSettings'
>;

export function ProfileSettingsScreen({ navigation }: ProfileSettingsScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, 10) + 8;

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
      <Text style={styles.title}>{t('profile.settings')}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
        <LanguageToggle />
      </View>

      <OutlineButton
        title={t('common.signOut')}
        onPress={resetToWelcome}
        style={styles.signOut}
      />
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
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  signOut: {
    marginTop: 8,
  },
});
