/**
 * Guard ухода с Profile hub: PreEdit/Edit сбрасываются в view,
 * при dirty — тот же Alert, что у крестика.
 */
type LeaveConfirm = () => Promise<boolean>;

let leaveConfirm: LeaveConfirm | null = null;

export function registerProfileLeaveGuard(fn: LeaveConfirm | null): void {
  leaveConfirm = fn;
}

/** true — можно уходить; false — остаёмся на профиле. */
export async function requestLeaveProfileIfEditing(): Promise<boolean> {
  if (!leaveConfirm) {
    return true;
  }
  return leaveConfirm();
}
