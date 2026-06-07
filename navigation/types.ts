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
  Register: { role: UserRole; mode?: AuthMode };
  Main: {
    role: UserRole;
    greetingTitle: string;
    greetingSubtitle: string;
  };
};
