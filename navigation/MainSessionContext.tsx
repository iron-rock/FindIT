import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import type { UserRole } from './types';

export type MainSession = {
  role: UserRole;
  greetingTitle: string;
  greetingSubtitle: string;
};

const MainSessionContext = createContext<MainSession | null>(null);

export function MainSessionProvider({
  value,
  children,
}: {
  value: MainSession;
  children: ReactNode;
}) {
  return <MainSessionContext.Provider value={value}>{children}</MainSessionContext.Provider>;
}

export function useMainSession() {
  const ctx = useContext(MainSessionContext);
  if (!ctx) {
    throw new Error('useMainSession: вне MainSessionProvider');
  }
  return ctx;
}
