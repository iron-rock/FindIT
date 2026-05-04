import { Image } from 'react-native';

import type { MainTabParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

/** Растровый экспорт содержимого `assets/Find_icon.svg` (в SVG вложен PNG). */
const FIND_LOGO = require('../../assets/Find_icon.png');
const CHATS_ICON = require('../../assets/chats-v1.png');
const PROFILE_ICON = require('../../assets/profile-v1.png');

/** Чуть крупнее `size`: у PNG логотипа много паддинга. */
const LOGO_RELATIVE_SCALE = 1.58;
/** Выравниваем визуальный вес с outline-табами ~24–26 px. */
const TAB_RASTER_SCALE = 1.12;

type Props = {
  route: keyof MainTabParamList;
  size: number;
};

function tintedRaster(source: number, px: number) {
  return (
    <Image
      accessibilityIgnoresInvertColors
      source={source}
      resizeMode="contain"
      style={{
        width: px,
        height: px,
        tintColor: colors.textPrimary,
      }}
    />
  );
}

/** Иконка таба FAB: растр марки ленты, чаты и профиль — из PNG. */
export function FabRouteGlyph({ route, size }: Props) {
  if (route === 'CandidateSwipe') {
    const px = Math.round(size * LOGO_RELATIVE_SCALE);
    return tintedRaster(FIND_LOGO, px);
  }

  if (route === 'Chats') {
    const px = Math.round(size * TAB_RASTER_SCALE);
    return tintedRaster(CHATS_ICON, px);
  }

  const px = Math.round(size * TAB_RASTER_SCALE);
  return tintedRaster(PROFILE_ICON, px);
}
