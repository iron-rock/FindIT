import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ChatsScreen } from '../screens/ChatsScreen';
import { ChatRoomScreen } from '../screens/ChatRoomScreen';
import type { ChatsStackParamList } from './types';

const Stack = createNativeStackNavigator<ChatsStackParamList>();

export function ChatsNavigator() {
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
      <Stack.Screen name="ChatsList" component={ChatsScreen} />
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 280,
        }}
      />
    </Stack.Navigator>
  );
}
