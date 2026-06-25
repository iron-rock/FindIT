/**
 * Типы под схему Supabase из supabase/migrations/0001_initial_schema.sql.
 *
 * Это ручные типы (не сгенерированные `supabase gen types`), чтобы код можно было
 * типизировать до подключения CLI. При расхождении со схемой — обновляй и файл
 * миграции, и docs/DATA_MODEL.md.
 *
 * `Row`    — форма строки при чтении.
 * `Insert` — поля для вставки (с дефолтами в БД они опциональны).
 */
import type { UserRole } from './roles';

export type { UserRole };

export type VacancyStatus = 'open' | 'paused' | 'closed';
export type SwipeDirection = 'left' | 'right';
export type SwipeTarget = 'vacancy' | 'finder';
export type VcsProvider = 'github' | 'gitlab';

export type Iso8601 = string;
export type Uuid = string;

export interface ProfileRow {
  id: Uuid;
  role: UserRole;
  display_name: string | null;
  avatar_url: string | null;
  created_at: Iso8601;
  updated_at: Iso8601;
}
export type ProfileInsert = Pick<ProfileRow, 'id' | 'role'> &
  Partial<Pick<ProfileRow, 'display_name' | 'avatar_url'>>;

export interface FinderProfileRow {
  id: Uuid;
  profile_id: Uuid;
  headline: string | null;
  years_experience: number | null;
  stack: string[];
  salary_expectation: string | null;
  location_format: string | null;
  about: string | null;
  highlights: string[];
  is_searchable: boolean;
  created_at: Iso8601;
  updated_at: Iso8601;
}
export type FinderProfileInsert = Pick<FinderProfileRow, 'profile_id'> &
  Partial<
    Omit<FinderProfileRow, 'id' | 'profile_id' | 'created_at' | 'updated_at'>
  >;

export interface CompanyRow {
  id: Uuid;
  owner_id: Uuid;
  name: string;
  industry: string | null;
  size: string | null;
  description: string | null;
  logo_url: string | null;
  created_at: Iso8601;
  updated_at: Iso8601;
}
export type CompanyInsert = Pick<CompanyRow, 'owner_id' | 'name'> &
  Partial<Pick<CompanyRow, 'industry' | 'size' | 'description' | 'logo_url'>>;

export interface VacancyRow {
  id: Uuid;
  company_id: Uuid;
  title: string;
  level: string | null;
  stack: string[];
  salary_range: string | null;
  location_format: string | null;
  description: string | null;
  highlights: string[];
  status: VacancyStatus;
  created_at: Iso8601;
  updated_at: Iso8601;
}
export type VacancyInsert = Pick<VacancyRow, 'company_id' | 'title'> &
  Partial<Omit<VacancyRow, 'id' | 'company_id' | 'title' | 'created_at' | 'updated_at'>>;

export interface AiExperienceRow {
  id: Uuid;
  finder_id: Uuid;
  tool: string;
  proficiency: string | null;
  description: string | null;
  created_at: Iso8601;
}
export type AiExperienceInsert = Pick<AiExperienceRow, 'finder_id' | 'tool'> &
  Partial<Pick<AiExperienceRow, 'proficiency' | 'description'>>;

export interface ProjectRow {
  id: Uuid;
  finder_id: Uuid;
  title: string;
  role: string | null;
  description: string | null;
  url: string | null;
  tech: string[];
  created_at: Iso8601;
}
export type ProjectInsert = Pick<ProjectRow, 'finder_id' | 'title'> &
  Partial<Pick<ProjectRow, 'role' | 'description' | 'url' | 'tech'>>;

export interface VcsAccountRow {
  id: Uuid;
  finder_id: Uuid;
  provider: VcsProvider;
  username: string;
  profile_url: string | null;
  created_at: Iso8601;
}
export type VcsAccountInsert = Pick<VcsAccountRow, 'finder_id' | 'provider' | 'username'> &
  Partial<Pick<VcsAccountRow, 'profile_url'>>;

/** Доступна только service_role (Edge Functions). Не запрашивать из клиента. */
export interface VcsCredentialRow {
  account_id: Uuid;
  access_token: string;
  refresh_token: string | null;
  updated_at: Iso8601;
}

export interface VcsCommitRow {
  id: Uuid;
  account_id: Uuid;
  repo: string;
  message: string | null;
  sha: string | null;
  committed_at: Iso8601 | null;
  url: string | null;
}
export type VcsCommitInsert = Pick<VcsCommitRow, 'account_id' | 'repo'> &
  Partial<Pick<VcsCommitRow, 'message' | 'sha' | 'committed_at' | 'url'>>;

export interface SwipeRow {
  id: Uuid;
  actor_id: Uuid;
  target_type: SwipeTarget;
  target_id: Uuid;
  direction: SwipeDirection;
  created_at: Iso8601;
}
export type SwipeInsert = Pick<SwipeRow, 'actor_id' | 'target_type' | 'target_id' | 'direction'>;

export interface MatchRow {
  id: Uuid;
  finder_id: Uuid;
  recruiter_id: Uuid;
  vacancy_id: Uuid | null;
  created_at: Iso8601;
}

export interface ConversationRow {
  id: Uuid;
  match_id: Uuid;
  created_at: Iso8601;
}

export type MessageType = 'text' | 'image';

export interface MessageRow {
  id: Uuid;
  conversation_id: Uuid;
  sender_id: Uuid;
  body: string;
  message_type: MessageType;
  image_url: string | null;
  created_at: Iso8601;
}
export type MessageInsert = Pick<
  MessageRow,
  'conversation_id' | 'sender_id' | 'body' | 'message_type' | 'image_url'
>;

/** Карта таблиц: имя в БД -> { Row; Insert }. */
export interface FinditDatabase {
  profiles: { Row: ProfileRow; Insert: ProfileInsert };
  finder_profiles: { Row: FinderProfileRow; Insert: FinderProfileInsert };
  companies: { Row: CompanyRow; Insert: CompanyInsert };
  vacancies: { Row: VacancyRow; Insert: VacancyInsert };
  ai_experience: { Row: AiExperienceRow; Insert: AiExperienceInsert };
  projects: { Row: ProjectRow; Insert: ProjectInsert };
  vcs_accounts: { Row: VcsAccountRow; Insert: VcsAccountInsert };
  vcs_credentials: { Row: VcsCredentialRow; Insert: VcsCredentialRow };
  vcs_commits: { Row: VcsCommitRow; Insert: VcsCommitInsert };
  swipes: { Row: SwipeRow; Insert: SwipeInsert };
  matches: { Row: MatchRow; Insert: Omit<MatchRow, 'id' | 'created_at'> };
  conversations: { Row: ConversationRow; Insert: Pick<ConversationRow, 'match_id'> };
  messages: { Row: MessageRow; Insert: MessageInsert };
}

export type TableName = keyof FinditDatabase;
