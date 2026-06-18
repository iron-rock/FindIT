import type { UserRole } from '../lib/roles';

type RoleSwitcher = (role: UserRole) => void;

let roleSwitcher: RoleSwitcher | null = null;

export function registerMainSessionRoleSwitcher(fn: RoleSwitcher): () => void {
  roleSwitcher = fn;
  return () => {
    if (roleSwitcher === fn) {
      roleSwitcher = null;
    }
  };
}

export function requestMainSessionRoleSwitch(role: UserRole): void {
  roleSwitcher?.(role);
}
