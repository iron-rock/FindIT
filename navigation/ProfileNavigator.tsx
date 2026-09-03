import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ProfileCardThemeScreen } from '../screens/ProfileCardThemeScreen';
import { ProfileHubScreen } from '../screens/ProfileScreen';
import { ProfileRatingsScreen } from '../screens/ProfileRatingsScreen';
import { ProfileSettingsScreen } from '../screens/ProfileSettingsScreen';
import { ProfileVacanciesScreen } from '../screens/ProfileVacanciesScreen';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'slide_from_right',
        animationDuration: 280,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name="ProfileHub" component={ProfileHubScreen} />
      <Stack.Screen name="ProfileCardTheme" component={ProfileCardThemeScreen} />
      <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
      <Stack.Screen name="ProfileRatings" component={ProfileRatingsScreen} />
      <Stack.Screen name="ProfileVacancies" component={ProfileVacanciesScreen} />
    </Stack.Navigator>
  );
}
