import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { getTemplateProfile } from '../data/templateAccounts';
import type { RoleProfile } from '../lib/profileTypes';
import type { UserRole } from '../lib/roles';

export type MainSession = {
  role: UserRole;
  profile: RoleProfile;
  setRole: (role: UserRole) => void;
};

const MainSessionContext = createContext<MainSession | null>(null);

export function MainSessionProvider({
  initialRole,
  initialProfile,
  children,
}: {
  initialRole: UserRole;
  initialProfile: RoleProfile;
  children: ReactNode;
}) {
  const [role, setRoleState] = useState<UserRole>(initialRole);
  const [profile, setProfile] = useState<RoleProfile>(initialProfile);

  const setRole = useCallback((nextRole: UserRole) => {
    setRoleState(nextRole);
    setProfile(getTemplateProfile(nextRole));
  }, []);

  const value = useMemo(
    () => ({ role, profile, setRole }),
    [role, profile, setRole],
  );

  return <MainSessionContext.Provider value={value}>{children}</MainSessionContext.Provider>;
}

export function useMainSession() {
  const ctx = useContext(MainSessionContext);
  if (!ctx) {
    throw new Error('useMainSession: вне MainSessionProvider');
  }
  return ctx;
}
