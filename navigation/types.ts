export type UserRole = 'developer' | 'employer';

export type MainTabParamList = {
  CandidateSwipe: undefined;
  Chats: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  Register: { role: UserRole };
  Main: {
    role: UserRole;
    greetingTitle: string;
    greetingSubtitle: string;
  };
};
