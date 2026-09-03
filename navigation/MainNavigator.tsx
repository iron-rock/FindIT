import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppAtmosphere } from '../components/background/AppAtmosphere';
import { MainTabBar } from '../components/navigation/MainTabBar';
import { CandidateSwipeScreen } from '../screens/CandidateSwipeScreen';
import { colors } from '../theme/colors';
import { ChatsNavigator } from './ChatsNavigator';
import { MainSessionProvider, useMainSession } from './MainSessionContext';
import { registerMainSessionRoleSwitcher } from './mainSessionBridge';
import { ProfileNavigator } from './ProfileNavigator';
import type { MainTabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

/** Scrim темнее Welcome (0.58), чтобы лента/чаты/профиль читались спокойнее. */
const MAIN_SCRIM_OPACITY = 0.78;

export type MainNavigatorProps = NativeStackScreenProps<RootStackParamList, 'Main'>;

function MainSessionBridge() {
  const { setRole } = useMainSession();

  useEffect(() => registerMainSessionRoleSwitcher(setRole), [setRole]);

  return null;
}

export function MainNavigator({ route }: MainNavigatorProps) {
  const { role, profile, initialTab } = route.params;

  return (
    <MainSessionProvider initialRole={role} initialProfile={profile}>
      <MainSessionBridge />
      <View style={styles.root}>
        <AppAtmosphere scrimOpacity={MAIN_SCRIM_OPACITY} />
        <Tab.Navigator
          key={`${role}-${initialTab ?? 'CandidateSwipe'}`}
          initialRouteName={initialTab ?? 'CandidateSwipe'}
          tabBar={(props) => <MainTabBar {...props} />}
          screenOptions={{
            headerShown: false,
            sceneStyle: {
              backgroundColor: 'transparent',
            },
          }}
        >
          <Tab.Screen name="CandidateSwipe" component={CandidateSwipeScreen} />
          <Tab.Screen name="Chats" component={ChatsNavigator} />
          <Tab.Screen name="Profile" component={ProfileNavigator} />
        </Tab.Navigator>
      </View>
    </MainSessionProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
