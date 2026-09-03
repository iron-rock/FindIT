import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
  type GestureResponderEvent,
  type TextInput as TextInputType,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import type { ProfileLocation } from '../../lib/location';
import { colors, font, Text } from '../../theme';
import {
  chromeRadius,
  outlineRadius,
  outlineRadiusAvatar,
  softSurface,
  softSurfacePressed,
} from '../../theme/surface';
import { ProfileAvatar } from './ProfileAvatar';

const AVATAR_SIZE = 104;
const LOCATION_WARN = '#f0c674';
const MENU_WIDTH = 220;
const MENU_EDGE = 12;
const ACTION_SIZE = 36;
/** Задержка после закрытия Modal — иначе ImagePicker на iOS/Android часто не открывается. */
const PICKER_AFTER_MODAL_MS = 350;

type MenuPos = { x: number; y: number };

type ProfileHeaderBlockProps = {
  displayName: string;
  phone?: string;
  /** Подпись локации или плейсхолдер. */
  locationLabel: string;
  locationIncomplete: boolean;
  avatarUri?: string;
  preEdit: boolean;
  editingName: boolean;
  editingLocation: boolean;
  dirty: boolean;
  /** Можно сохранить (страна и город не пустые). */
  locationCanSave: boolean;
  nameDraft: string;
  locationDraft: ProfileLocation;
  glowBorder: Animated.AnimatedInterpolation<string | number>;
  nameGlow: Animated.AnimatedInterpolation<string | number>;
  textGlow: Animated.AnimatedInterpolation<string | number>;
  onRequestNameEdit: () => void;
  onRequestPhotoEdit: () => void;
  onRequestLocationEdit: () => void;
  onCancelName: () => void;
  onSaveName: () => void;
  onChangeNameDraft: (text: string) => void;
  onCancelLocation: () => void;
  onSaveLocation: () => void;
  onChangeLocationDraft: (next: ProfileLocation) => void;
};

const AnimatedText = Animated.Text;

/**
 * Шапка в PreEdit: тап → дропдаун «имя / фото / локация».
 * Локация — два текстовых поля (страна + город).
 */
export function ProfileHeaderBlock({
  displayName,
  phone,
  locationLabel,
  locationIncomplete,
  avatarUri,
  preEdit,
  editingName,
  editingLocation,
  dirty,
  locationCanSave,
  nameDraft,
  locationDraft,
  glowBorder,
  nameGlow,
  textGlow,
  onRequestNameEdit,
  onRequestPhotoEdit,
  onRequestLocationEdit,
  onCancelName,
  onSaveName,
  onChangeNameDraft,
  onCancelLocation,
  onSaveLocation,
  onChangeLocationDraft,
}: ProfileHeaderBlockProps) {
  const { t } = useTranslation();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const nameInputRef = useRef<TextInputType>(null);
  const countryInputRef = useRef<TextInputType>(null);
  const photoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const headerBusy = editingName || editingLocation;
  const selectable = preEdit && !headerBusy;
  const menuOpen = menuPos != null;

  useEffect(() => {
    if (editingName) {
      const id = setTimeout(() => nameInputRef.current?.focus(), 40);
      return () => clearTimeout(id);
    }
  }, [editingName]);

  useEffect(() => {
    if (editingLocation) {
      const id = setTimeout(() => countryInputRef.current?.focus(), 40);
      return () => clearTimeout(id);
    }
  }, [editingLocation]);

  useEffect(() => {
    return () => {
      if (photoTimer.current) {
        clearTimeout(photoTimer.current);
      }
    };
  }, []);

  const closeMenu = () => setMenuPos(null);

  const onHeaderPress = (e: GestureResponderEvent) => {
    if (!selectable) {
      return;
    }
    const { pageX, pageY } = e.nativeEvent;
    let x = pageX;
    let y = pageY;
    if (x + MENU_WIDTH > screenW - MENU_EDGE) {
      x = screenW - MENU_EDGE - MENU_WIDTH;
    }
    if (x < MENU_EDGE) {
      x = MENU_EDGE;
    }
    if (y + 140 > screenH - MENU_EDGE) {
      y = Math.max(MENU_EDGE, pageY - 140);
    }
    setMenuPos({ x, y });
  };

  const chooseName = () => {
    closeMenu();
    onRequestNameEdit();
  };

  const choosePhoto = () => {
    closeMenu();
    if (photoTimer.current) {
      clearTimeout(photoTimer.current);
    }
    photoTimer.current = setTimeout(() => {
      onRequestPhotoEdit();
    }, PICKER_AFTER_MODAL_MS);
  };

  const chooseLocation = () => {
    closeMenu();
    onRequestLocationEdit();
  };

  const onLocationAction = () => {
    if (locationCanSave && dirty) {
      onSaveLocation();
      return;
    }
    onCancelLocation();
  };

  return (
    <View style={styles.root}>
      <Pressable
        disabled={!selectable}
        onPress={onHeaderPress}
        style={({ pressed }) => [
          styles.viewPress,
          pressed && selectable && styles.pressed,
        ]}
      >
        <ProfileAvatar
          name={displayName}
          uri={avatarUri}
          size={AVATAR_SIZE}
          radius={outlineRadiusAvatar}
          borderColor={selectable ? glowBorder : undefined}
        />

        {editingName ? (
          <View style={styles.nameEditWrap}>
            <TextInput
              ref={nameInputRef}
              value={nameDraft}
              onChangeText={onChangeNameDraft}
              style={styles.nameInput}
              placeholderTextColor="rgba(255, 255, 255, 0.45)"
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={() => {
                if (dirty) {
                  onSaveName();
                }
              }}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={dirty ? t('common.save') : t('common.cancel')}
              onPress={dirty ? onSaveName : onCancelName}
              style={({ pressed }) => [
                softSurface(outlineRadius),
                styles.actionBtn,
                pressed && softSurfacePressed,
              ]}
            >
              <Ionicons
                name={dirty ? 'checkmark' : 'close'}
                size={20}
                color={colors.textPrimary}
              />
            </Pressable>
          </View>
        ) : (
          <AnimatedText
            style={[styles.name, selectable ? { color: nameGlow } : null]}
            numberOfLines={2}
          >
            {displayName}
          </AnimatedText>
        )}

        {phone ? (
          <AnimatedText
            style={[styles.phone, selectable ? { color: textGlow } : null]}
            numberOfLines={1}
          >
            {phone}
          </AnimatedText>
        ) : null}

        {editingLocation ? (
          <View style={styles.locationEditWrap}>
            <TextInput
              ref={countryInputRef}
              value={locationDraft.country}
              onChangeText={(country) =>
                onChangeLocationDraft({ ...locationDraft, country })
              }
              style={styles.locationInput}
              placeholder={t('profile.locationCountry')}
              placeholderTextColor="rgba(255, 255, 255, 0.45)"
              autoCapitalize="words"
              returnKeyType="next"
            />
            <TextInput
              value={locationDraft.city}
              onChangeText={(city) =>
                onChangeLocationDraft({ ...locationDraft, city })
              }
              style={styles.locationInput}
              placeholder={t('profile.locationCity')}
              placeholderTextColor="rgba(255, 255, 255, 0.45)"
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={() => {
                if (locationCanSave && dirty) {
                  onSaveLocation();
                }
              }}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                locationCanSave && dirty
                  ? t('common.save')
                  : t('common.cancel')
              }
              onPress={onLocationAction}
              style={({ pressed }) => [
                softSurface(outlineRadius),
                styles.locationActionBtn,
                pressed && softSurfacePressed,
              ]}
            >
              <Ionicons
                name={locationCanSave && dirty ? 'checkmark' : 'close'}
                size={20}
                color={colors.textPrimary}
              />
            </Pressable>
          </View>
        ) : locationIncomplete ? (
          <View style={styles.locationMissing}>
            <Ionicons name="warning-outline" size={14} color={LOCATION_WARN} />
            <Text style={styles.locationMissingText}>{locationLabel}</Text>
          </View>
        ) : (
          <AnimatedText
            style={[styles.subtitle, selectable ? { color: textGlow } : null]}
            numberOfLines={2}
          >
            {locationLabel}
          </AnimatedText>
        )}
      </Pressable>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <View style={styles.menuRoot} pointerEvents="box-none">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.cancel')}
            style={styles.menuBackdrop}
            onPress={closeMenu}
          />
          {menuPos ? (
            <View
              style={[
                styles.menu,
                { left: menuPos.x, top: menuPos.y },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('profile.changeName')}
                onPress={chooseName}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
              >
                <Ionicons
                  name="text-outline"
                  size={18}
                  color={colors.textPrimary}
                />
                <Text style={styles.menuItemLabel}>{t('profile.changeName')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('profile.changePhoto')}
                onPress={choosePhoto}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
              >
                <Ionicons
                  name="camera-outline"
                  size={18}
                  color={colors.textPrimary}
                />
                <Text style={styles.menuItemLabel}>{t('profile.changePhoto')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('profile.changeLocation')}
                onPress={chooseLocation}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={colors.textPrimary}
                />
                <Text style={styles.menuItemLabel}>
                  {t('profile.changeLocation')}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
  },
  viewPress: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  name: {
    marginTop: 4,
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
    textAlign: 'center',
    lineHeight: 32,
  },
  nameEditWrap: {
    position: 'relative',
    marginTop: 4,
    width: '100%',
    minHeight: 36,
    justifyContent: 'center',
  },
  nameInput: {
    width: '100%',
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
    textAlign: 'center',
    lineHeight: 32,
    paddingVertical: 0,
    paddingHorizontal: ACTION_SIZE + 8,
    minHeight: 36,
    ...font('700'),
  },
  actionBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  phone: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  locationMissing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: outlineRadius,
    backgroundColor: 'rgba(240, 198, 116, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(240, 198, 116, 0.45)',
  },
  locationMissingText: {
    fontSize: 14,
    fontWeight: '600',
    color: LOCATION_WARN,
    ...font('600'),
  },
  locationEditWrap: {
    position: 'relative',
    width: '100%',
    justifyContent: 'center',
    gap: 4,
  },
  locationInput: {
    width: '100%',
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 20,
    paddingVertical: 2,
    paddingHorizontal: ACTION_SIZE + 8,
    ...font('400'),
  },
  locationActionBtn: {
    position: 'absolute',
    right: 0,
    top: '50%',
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    marginTop: -ACTION_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  pressed: {
    opacity: 0.75,
  },
  menuRoot: {
    flex: 1,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  menu: {
    position: 'absolute',
    width: MENU_WIDTH,
    paddingVertical: 4,
    borderRadius: chromeRadius,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    zIndex: 50,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  menuItemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    ...font('500'),
  },
});
