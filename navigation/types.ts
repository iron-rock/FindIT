import type { NavigatorScreenParams } from '@react-navigation/native';

import type { RoleProfile } from '../lib/profileTypes';
import type { UserRole } from '../lib/roles';

export type { UserRole };

export type ChatsStackParamList = {
  ChatsList: undefined;
  ChatRoom: {
    conversationId: string;
    counterpartName: string;
  };
};

export type MainTabParamList = {
  CandidateSwipe: undefined;
  Chats: NavigatorScreenParams<ChatsStackParamList> | undefined;
  Profile: undefined;
};

export type AuthMode = 'login' | 'register';

export type RootStackParamList = {
  Welcome: undefined;
  Main: {
    role: UserRole;
    profile: RoleProfile;
  };
};
