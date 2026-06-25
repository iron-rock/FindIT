import { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { MainTabBar } from '../components/navigation/MainTabBar';
import { CandidateSwipeScreen } from '../screens/CandidateSwipeScreen';
import { ChatsNavigator } from './ChatsNavigator';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors } from '../theme/colors';
import { MainSessionProvider, useMainSession } from './MainSessionContext';
import { registerMainSessionRoleSwitcher } from './mainSessionBridge';
import type { MainTabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export type MainNavigatorProps = NativeStackScreenProps<RootStackParamList, 'Main'>;

function MainSessionBridge() {
  const { setRole } = useMainSession();

  useEffect(() => registerMainSessionRoleSwitcher(setRole), [setRole]);

  return null;
}

export function MainNavigator({ route }: MainNavigatorProps) {
  const { role, profile } = route.params;

  return (
    <MainSessionProvider initialRole={role} initialProfile={profile}>
      <MainSessionBridge />
      <Tab.Navigator
        initialRouteName="CandidateSwipe"
        tabBar={(props) => <MainTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: {
            backgroundColor: colors.surfaceDeep,
          },
        }}
      >
        <Tab.Screen name="CandidateSwipe" component={CandidateSwipeScreen} />
        <Tab.Screen name="Chats" component={ChatsNavigator} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </MainSessionProvider>
  );
}
