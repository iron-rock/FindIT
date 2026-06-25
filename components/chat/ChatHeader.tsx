import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileAvatar } from '../profile/ProfileAvatar';
import { BackLink } from '../navigation/BackLink';
import { colors, Text } from '../../theme';

const BACK_ICON_COLOR = colors.textPrimary;

type ChatHeaderProps = {
  counterpartName: string;
  onBack: () => void;
};

const AVATAR_SIZE = 48;
const SIDE_SLOT = 50;

/** Telegram-style: назад слева, имя по центру, аватар справа. */
export function ChatHeader({ counterpartName, onBack }: ChatHeaderProps) {
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, 10);

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.bar}>
        <View style={styles.backSlot}>
          <BackLink
            onPress={onBack}
            iconOnly
            iconColor={BACK_ICON_COLOR}
            iconSize={24}
            style={styles.backLink}
          />
        </View>

        <View style={styles.titleSlot}>
          <Text style={styles.title} numberOfLines={1}>
            {counterpartName}
          </Text>
        </View>

        <View style={[styles.sideSlot, styles.sideSlotRight]}>
          <ProfileAvatar name={counterpartName} size={AVATAR_SIZE} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surfaceDeep,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  sideSlot: {
    width: SIDE_SLOT,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backSlot: {
    width: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: -2,
  },
  backLink: {
    marginLeft: 0,
  },
  sideSlotRight: {
    alignItems: 'flex-end',
  },
  titleSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
