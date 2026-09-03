import type { FinderGit } from './git';
import type { ProfileLocation } from './location';
import type { UserRole } from './roles';
import type { WorkFormat } from './workFormat';

export type { FinderGit, GitCommit, GitContributionDay } from './git';
export type { ProfileLocation } from './location';
export type { WorkFormat } from './workFormat';

export type WorkExperience = {
  id: string;
  title: string;
  company: string;
  employmentType?: string;
  startDate: string;
  endDate?: string | null;
  location?: string;
};

export type FinderProfile = {
  kind: 'finder';
  displayName: string;
  phone?: string;
  /** Локальный URI фото (без Storage пока). */
  avatarUri?: string;
  /** Страна + город (оба обязательны, свободный текст). */
  location: ProfileLocation;
  /** Письмо «о себе» — видно recruiter'ам при отклике. */
  about?: string;
  selectedAiModels: string[];
  git: FinderGit;
  stack: string[];
  position?: string;
  /** Только цифры; в UI показывается с префиксом `$`. */
  salary?: string;
  /** Онлайн / гибрид / оффлайн — мультивыбор. */
  workFormats: WorkFormat[];
  yearsExperience: number;
  experience: WorkExperience[];
  /** Тема карточки в ленте recruiter'а (Path A). */
  cardThemeId?: string;
};

export type RecruiterProfile = {
  kind: 'recruiter';
  companyName: string;
  phone?: string;
  /** Локальный URI логотипа/аватара (без Storage пока). */
  avatarUri?: string;
  /** Страна + город (оба обязательны, свободный текст). */
  location: ProfileLocation;
  contactName: string;
  corpEmail?: string;
  companyLink?: string;
  industry?: string;
};

export function profilePhone(profile: RoleProfile): string | undefined {
  return profile.phone?.trim() || undefined;
}

export function profileAvatarUri(profile: RoleProfile): string | undefined {
  return profile.avatarUri?.trim() || undefined;
}

export function profileLocation(profile: RoleProfile): ProfileLocation {
  return profile.location;
}

export type RoleProfile = FinderProfile | RecruiterProfile;

export function isFinderProfile(profile: RoleProfile): profile is FinderProfile {
  return profile.kind === 'finder';
}

export function isRecruiterProfile(profile: RoleProfile): profile is RecruiterProfile {
  return profile.kind === 'recruiter';
}

export function profileDisplayName(profile: RoleProfile): string {
  return profile.kind === 'finder' ? profile.displayName : profile.companyName;
}

export type ProfileByRole = {
  finder: FinderProfile;
  recruiter: RecruiterProfile;
};

export type { UserRole };
