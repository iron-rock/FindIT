import type { UserRole } from './roles';

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
  headline?: string;
  selectedAiTools: string[];
  gitlabUrl?: string;
  stack: string[];
  position?: string;
  salary?: string;
  workFormat?: string;
  yearsExperience: number;
  experience: WorkExperience[];
};

export type RecruiterProfile = {
  kind: 'recruiter';
  companyName: string;
  contactName: string;
  corpEmail?: string;
  companyLink?: string;
  industry?: string;
};

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
