import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  FinderProfileBody,
  type FinderBrickId,
} from '../components/profile/FinderProfileBody';
import { ProfileEditChrome } from '../components/profile/ProfileEditChrome';
import { ProfileHeaderBlock } from '../components/profile/ProfileHeaderBlock';
import {
  ProfileMenuSection,
  type ProfileMenuItem,
} from '../components/profile/ProfileMenuSection';
import {
  RecruiterProfileBody,
  type RecruiterBrickId,
} from '../components/profile/RecruiterProfileBody';
// import { SuccessToast } from '../components/ui/SuccessToast';
import {
  isFinderProfile,
  isRecruiterProfile,
  profileAvatarUri,
  profileDisplayName,
  profilePhone,
  type FinderProfile,
  type ProfileLocation,
  type RecruiterProfile,
  type RoleProfile,
} from '../lib/profileTypes';
import {
  formatLocationLabel,
  isLocationComplete,
  normalizeLocation,
} from '../lib/location';
import { useMainSession } from '../navigation/MainSessionContext';
import { registerProfileLeaveGuard } from '../navigation/profileLeaveGuard';
import type { ProfileStackParamList } from '../navigation/types';

const GLOW_CYCLE_MS = 3200;

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function profileLayoutAnim() {
  LayoutAnimation.configureNext({
    duration: 260,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: { type: LayoutAnimation.Types.easeInEaseOut },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  });
}

type EditMode = 'view' | 'preEdit' | 'edit';
type HeaderEditKind = 'headerName' | 'headerLocation';
type EditTarget = HeaderEditKind | FinderBrickId | RecruiterBrickId;

function isHeaderTarget(id: EditTarget | null): id is HeaderEditKind {
  return id === 'headerName' || id === 'headerLocation';
}

export type ProfileHubScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  'ProfileHub'
>;

export function ProfileHubScreen({ navigation }: ProfileHubScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { role, profile, setProfile } = useMainSession();

  const [mode, setMode] = useState<EditMode>('view');
  const [editingTarget, setEditingTarget] = useState<EditTarget | null>(null);
  const [dirty, setDirty] = useState(false);
  // Toast успеха временно отключён.
  // const [successToken, setSuccessToken] = useState(0);

  const [nameDraft, setNameDraft] = useState(profileDisplayName(profile));
  const [locationDraft, setLocationDraft] = useState<ProfileLocation>(
    profile.location,
  );

  const displayName = profileDisplayName(profile);
  const phone = profilePhone(profile);
  const avatarUri = profileAvatarUri(profile);
  const locationComplete = isLocationComplete(profile.location);
  const locationLabel =
    formatLocationLabel(profile.location) ?? t('profile.locationRequired');
  const topPad = Math.max(insets.top, 10) + 8;

  const preEdit = mode === 'preEdit';
  const editingHeaderName = mode === 'edit' && editingTarget === 'headerName';
  const editingHeaderLocation =
    mode === 'edit' && editingTarget === 'headerLocation';
  const editingBrickId =
    mode === 'edit' && editingTarget && !isHeaderTarget(editingTarget)
      ? editingTarget
      : null;

  const glowPhase = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!preEdit) {
      glowPhase.stopAnimation(() => {
        glowPhase.setValue(0);
      });
      return;
    }
    glowPhase.setValue(0);
    const loop = Animated.loop(
      Animated.timing(glowPhase, {
        toValue: 1,
        duration: GLOW_CYCLE_MS,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
      glowPhase.setValue(0);
    };
  }, [preEdit, glowPhase]);

  /** Плавный sin-пульс: на стыке цикла 0 и 1 оба дают 0 — без рывка. */
  const glowPulse = useMemo(
    () =>
      glowPhase.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: [0, 0.7, 1, 0.7, 0],
      }),
    [glowPhase],
  );

  const headerBorderColor = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.42)', 'rgba(143, 211, 255, 0.85)'],
  });

  const textGlowColor = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.72)', 'rgba(175, 220, 255, 0.95)'],
  });
  const nameGlowColor = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 1)', 'rgba(180, 225, 255, 1)'],
  });

  const flashSaved = useCallback(() => {
    // SuccessToast временно отключён — сохранение без визуального подтверждения.
    // setSuccessToken((n) => n + 1);
  }, []);

  const exitToView = useCallback(() => {
    setMode('view');
    setEditingTarget(null);
    setDirty(false);
  }, []);

  const modeRef = useRef(mode);
  const dirtyRef = useRef(dirty);
  modeRef.current = mode;
  dirtyRef.current = dirty;

  const confirmDiscardIfDirty = useCallback((): Promise<boolean> => {
    if (!(modeRef.current === 'edit' && dirtyRef.current)) {
      exitToView();
      return Promise.resolve(true);
    }
    return new Promise((resolve) => {
      Alert.alert(t('profile.unsavedTitle'), t('profile.unsavedMessage'), [
        {
          text: t('profile.keepEditing'),
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: t('profile.discard'),
          style: 'destructive',
          onPress: () => {
            exitToView();
            resolve(true);
          },
        },
      ]);
    });
  }, [exitToView, t]);

  useEffect(() => {
    registerProfileLeaveGuard(async () => {
      if (modeRef.current === 'view') {
        return true;
      }
      return confirmDiscardIfDirty();
    });
    return () => registerProfileLeaveGuard(null);
  }, [confirmDiscardIfDirty]);

  const requestExitEdit = useCallback(() => {
    if (mode === 'view') {
      setMode('preEdit');
      return;
    }
    void confirmDiscardIfDirty();
  }, [confirmDiscardIfDirty, mode]);

  const requestNavigateAway = useCallback(
    async (go: () => void) => {
      if (mode === 'view') {
        go();
        return;
      }
      const ok = await confirmDiscardIfDirty();
      if (ok) {
        go();
      }
    },
    [confirmDiscardIfDirty, mode],
  );

  const onDirtyChange = useCallback((next: boolean) => {
    setDirty(next);
  }, []);

  useEffect(() => {
    if (editingHeaderName) {
      setDirty(nameDraft.trim() !== displayName);
      return;
    }
    if (editingHeaderLocation) {
      const complete = isLocationComplete(locationDraft);
      const changed =
        locationDraft.country.trim() !== profile.location.country.trim() ||
        locationDraft.city.trim() !== profile.location.city.trim();
      setDirty(complete && changed);
      return;
    }
  }, [
    displayName,
    editingHeaderLocation,
    editingHeaderName,
    locationDraft,
    nameDraft,
    profile.location,
  ]);

  const startNameEdit = useCallback(() => {
    setNameDraft(displayName);
    setEditingTarget('headerName');
    setMode('edit');
    setDirty(false);
  }, [displayName]);

  const cancelNameEdit = useCallback(() => {
    setEditingTarget(null);
    setMode('preEdit');
    setDirty(false);
  }, []);

  const saveNameEdit = useCallback(() => {
    const name = nameDraft.trim() || displayName;
    if (isFinderProfile(profile)) {
      setProfile({ ...profile, displayName: name });
    } else if (isRecruiterProfile(profile)) {
      setProfile({ ...profile, companyName: name });
    }
    flashSaved();
    setEditingTarget(null);
    setMode('preEdit');
    setDirty(false);
  }, [displayName, flashSaved, nameDraft, profile, setProfile]);

  const startLocationEdit = useCallback(() => {
    setLocationDraft({ ...profile.location });
    setEditingTarget('headerLocation');
    setMode('edit');
    setDirty(false);
  }, [profile.location]);

  const cancelLocationEdit = useCallback(() => {
    setEditingTarget(null);
    setMode('preEdit');
    setDirty(false);
  }, []);

  const saveLocationEdit = useCallback(() => {
    const next = normalizeLocation(locationDraft);
    if (!isLocationComplete(next)) {
      Alert.alert(
        t('profile.changeLocation'),
        t('profile.locationSaveNeedBoth'),
      );
      return;
    }
    setProfile({ ...profile, location: next });
    flashSaved();
    setEditingTarget(null);
    setMode('preEdit');
    setDirty(false);
  }, [flashSaved, locationDraft, profile, setProfile, t]);

  const locationCanSave = isLocationComplete(locationDraft);

  const pickAvatar = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('profile.changePhoto'), t('profile.photoPermissionDenied'));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (result.canceled || !result.assets[0]) {
        return;
      }
      const nextUri = result.assets[0].uri;
      if (isFinderProfile(profile)) {
        setProfile({ ...profile, avatarUri: nextUri });
      } else if (isRecruiterProfile(profile)) {
        setProfile({ ...profile, avatarUri: nextUri });
      }
      flashSaved();
    } catch (error) {
      if (__DEV__) {
        console.info('[FindIT] pickAvatar failed:', error);
      }
      Alert.alert(t('profile.changePhoto'), t('profile.photoPickFailed'));
    }
  }, [flashSaved, profile, setProfile, t]);

  const selectBrick = (id: FinderBrickId | RecruiterBrickId) => {
    profileLayoutAnim();
    setEditingTarget(id);
    setMode('edit');
    setDirty(false);
  };

  const cancelBrick = () => {
    profileLayoutAnim();
    setEditingTarget(null);
    setMode('preEdit');
    setDirty(false);
  };

  const saveBrick = (next: RoleProfile) => {
    profileLayoutAnim();
    setProfile(next);
    flashSaved();
    setEditingTarget(null);
    setMode('preEdit');
    setDirty(false);
  };

  const menuItems = useMemo((): ProfileMenuItem[] => {
    const ratings: ProfileMenuItem = {
      id: 'ratings',
      label: t('profile.ratings'),
      icon: 'star-outline',
      onPress: () =>
        void requestNavigateAway(() => navigation.navigate('ProfileRatings')),
    };
    const settings: ProfileMenuItem = {
      id: 'settings',
      label: t('profile.settings'),
      icon: 'settings-outline',
      onPress: () =>
        void requestNavigateAway(() => navigation.navigate('ProfileSettings')),
    };

    if (role === 'finder') {
      return [
        {
          id: 'cardTheme',
          label: t('profile.cardThemeTitle'),
          icon: 'color-palette-outline',
          onPress: () =>
            void requestNavigateAway(() =>
              navigation.navigate('ProfileCardTheme'),
            ),
        },
        ratings,
        settings,
      ];
    }

    return [
      {
        id: 'vacancies',
        label: t('profile.myVacancies'),
        icon: 'briefcase-outline',
        onPress: () =>
          void requestNavigateAway(() =>
            navigation.navigate('ProfileVacancies'),
          ),
      },
      ratings,
      settings,
    ];
  }, [navigation, requestNavigateAway, role, t]);

  const menuDisabled = mode !== 'view';

  return (
    <View style={styles.root}>
      {/* <SuccessToast token={successToken} topInset={insets.top} /> */}

      {mode !== 'edit' ? (
        <View
          pointerEvents="box-none"
          style={[styles.chromeRow, { paddingTop: topPad }]}
        >
          <ProfileEditChrome
            active={mode !== 'view'}
            onPress={requestExitEdit}
          />
        </View>
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 44, paddingBottom: 140 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ProfileHeaderBlock
          displayName={displayName}
          phone={phone}
          locationLabel={locationLabel}
          locationIncomplete={!locationComplete}
          avatarUri={avatarUri}
          preEdit={preEdit}
          editingName={editingHeaderName}
          editingLocation={editingHeaderLocation}
          dirty={dirty}
          locationCanSave={locationCanSave}
          nameDraft={nameDraft}
          locationDraft={locationDraft}
          glowBorder={headerBorderColor}
          nameGlow={nameGlowColor}
          textGlow={textGlowColor}
          onRequestNameEdit={startNameEdit}
          onRequestPhotoEdit={() => {
            void pickAvatar();
          }}
          onRequestLocationEdit={startLocationEdit}
          onCancelName={cancelNameEdit}
          onSaveName={saveNameEdit}
          onChangeNameDraft={setNameDraft}
          onCancelLocation={cancelLocationEdit}
          onSaveLocation={saveLocationEdit}
          onChangeLocationDraft={setLocationDraft}
        />

        {isFinderProfile(profile) ? (
          <FinderProfileBody
            profile={profile}
            preEdit={preEdit}
            editingBrick={editingBrickId as FinderBrickId | null}
            dirty={dirty}
            glowProgress={glowPulse}
            onSelectBrick={selectBrick}
            onCancelBrick={cancelBrick}
            onSaveBrick={(next: FinderProfile) => saveBrick(next)}
            onDirtyChange={onDirtyChange}
          />
        ) : isRecruiterProfile(profile) ? (
          <RecruiterProfileBody
            profile={profile}
            preEdit={preEdit}
            editingBrick={editingBrickId as RecruiterBrickId | null}
            dirty={dirty}
            glowProgress={glowPulse}
            onSelectBrick={selectBrick}
            onCancelBrick={cancelBrick}
            onSaveBrick={(next: RecruiterProfile) => saveBrick(next)}
            onDirtyChange={onDirtyChange}
          />
        ) : null}

        <View
          pointerEvents={menuDisabled ? 'none' : 'auto'}
          style={[styles.menuBlock, menuDisabled && styles.menuDisabled]}
        >
          <ProfileMenuSection items={menuItems} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  chromeRow: {
    position: 'absolute',
    top: 0,
    right: 20,
    zIndex: 20,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 20,
  },
  menuBlock: {
    gap: 10,
  },
  menuDisabled: {
    opacity: 0.38,
  },
});
