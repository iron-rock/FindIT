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

export type ProfileStackParamList = {
  ProfileHub: undefined;
  ProfileCardTheme: undefined;
  ProfileSettings: undefined;
  ProfileRatings: undefined;
  ProfileVacancies: undefined;
};

export type MainTabParamList = {
  CandidateSwipe: undefined;
  Chats: NavigatorScreenParams<ChatsStackParamList> | undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

export type AuthMode = 'login' | 'register';

export type RootStackParamList = {
  Welcome: undefined;
  Main: {
    role: UserRole;
    profile: RoleProfile;
    /** Dev-шорткат: с какой вкладки открыть Main. По умолчанию — лента свайпа. */
    initialTab?: keyof MainTabParamList;
  };
};
