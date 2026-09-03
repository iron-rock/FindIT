import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  WORK_FORMATS,
  WORK_FORMAT_LABEL_KEY,
  toggleWorkFormat,
  type WorkFormat,
} from '../../lib/workFormat';
import { colors, font, Text } from '../../theme';

type WorkFormatAccordionProps = {
  value: WorkFormat[];
  onChange: (next: WorkFormat[]) => void;
};

/**
 * Формат работы: всегда видимый ряд чекбоксов (Онлайн / Гибрид / Оффлайн).
 * Без отдельной подложки — фон как у кирпича.
 */
export function WorkFormatAccordion({
  value,
  onChange,
}: WorkFormatAccordionProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{t('profile.workFormat')}</Text>
      <View style={styles.row}>
        {WORK_FORMATS.map((id) => {
          const selected = value.includes(id);
          const label = t(WORK_FORMAT_LABEL_KEY[id]);
          return (
            <Pressable
              key={id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={label}
              onPress={() => onChange(toggleWorkFormat(value, id))}
              style={({ pressed }) => [
                styles.option,
                pressed && styles.optionPressed,
              ]}
            >
              <View style={[styles.box, selected && styles.boxSelected]}>
                {selected ? (
                  <Ionicons
                    name="checkmark"
                    size={11}
                    color={colors.background}
                  />
                ) : null}
              </View>
              <Text
                style={[styles.optionLabel, selected && styles.optionSelected]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    letterSpacing: 0.3,
    ...font('500'),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
    minWidth: 0,
  },
  optionPressed: {
    opacity: 0.7,
  },
  box: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxSelected: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  optionLabel: {
    fontSize: 12,
    color: colors.textMuted,
    ...font('400'),
  },
  optionSelected: {
    color: colors.textPrimary,
    ...font('500'),
  },
});
