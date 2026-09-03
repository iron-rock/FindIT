import { createNavigationContainerRef } from '@react-navigation/native';

import { getTemplateProfile } from '../data/templateAccounts';
import type { UserRole } from '../lib/roles';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function resetToWelcome(): void {
  if (!navigationRef.isReady()) {
    return;
  }

  navigationRef.reset({ index: 0, routes: [{ name: 'Welcome' }] });
}

/** Dev: сразу в Main как роль, на вкладке профиля, с шаблонным мок-профилем (без auth). */
export function resetToMainProfile(role: UserRole): void {
  if (!navigationRef.isReady()) {
    return;
  }

  navigationRef.reset({
    index: 0,
    routes: [
      {
        name: 'Main',
        key: `Main-${role}`,
        params: {
          role,
          profile: getTemplateProfile(role),
          initialTab: 'Profile',
        },
        state: {
          index: 2,
          routes: [
            { name: 'CandidateSwipe' },
            { name: 'Chats' },
            { name: 'Profile' },
          ],
        },
      },
    ],
  });
}
