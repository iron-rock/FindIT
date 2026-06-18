import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, Text } from '../../theme';
import { outlineBlock, outlineRadius } from '../../theme/surface';

type ProfileFieldRowProps = {
  label: string;
  value?: string;
};

export function ProfileFieldRow({ label, value }: ProfileFieldRowProps) {
  const { t } = useTranslation();
  const filled = Boolean(value?.trim());

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, !filled && styles.placeholder]}>
        {filled ? value : t('profile.addField')}
      </Text>
    </View>
  );
}

type ProfileSectionProps = {
  title: string;
  children: ReactNode;
};

export function ProfileSection({ title, children }: ProfileSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export function ProfileStackTags({ stack }: { stack: string[] }) {
  const { t } = useTranslation();

  if (stack.length === 0) {
    return <Text style={styles.placeholder}>{t('profile.addField')}</Text>;
  }

  return (
    <View style={styles.tags}>
      {stack.map((tag) => (
        <View key={tag} style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  sectionBody: {
    gap: 8,
    padding: 16,
    ...outlineBlock(outlineRadius),
  },
  row: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
  },
  value: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  placeholder: {
    fontSize: 16,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: outlineRadius,
    backgroundColor: colors.surfaceMuted,
    ...outlineBlock(outlineRadius),
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
});
