import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ExpandableFabTabBar } from '../components/navigation/ExpandableFabTabBar';
import { CandidateSwipeScreen } from '../screens/CandidateSwipeScreen';
import { ChatsScreen } from '../screens/ChatsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors } from '../theme/colors';
import { MainSessionProvider } from './MainSessionContext';
import type { MainTabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export type MainNavigatorProps = NativeStackScreenProps<RootStackParamList, 'Main'>;

export function MainNavigator({ route }: MainNavigatorProps) {
  const { role, greetingTitle, greetingSubtitle } = route.params;

  return (
    <MainSessionProvider value={{ role, greetingTitle, greetingSubtitle }}>
      <Tab.Navigator
        initialRouteName="CandidateSwipe"
        tabBar={(props) => <ExpandableFabTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Tab.Screen name="CandidateSwipe" component={CandidateSwipeScreen} />
        <Tab.Screen name="Chats" component={ChatsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </MainSessionProvider>
  );
}
