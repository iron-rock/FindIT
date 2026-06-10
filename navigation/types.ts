import type { UserRole } from '../lib/roles';

export type { UserRole };

export type MainTabParamList = {
  CandidateSwipe: undefined;
  Chats: undefined;
  Profile: undefined;
};

export type AuthMode = 'login' | 'register';

export type RootStackParamList = {
  Welcome: undefined;
  Main: {
    role: UserRole;
    greetingTitle: string;
    greetingSubtitle: string;
  };
};
