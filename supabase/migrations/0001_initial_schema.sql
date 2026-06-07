-- =====================================================================
-- FindIT — начальная схема базы данных (Supabase / Postgres)
-- ---------------------------------------------------------------------
-- Как применить:
--   1) Supabase Dashboard → SQL Editor → New query → вставить весь файл → Run.
--   ИЛИ
--   2) Supabase CLI:  supabase db push   (файл лежит в supabase/migrations).
--
-- Соответствует docs/DATA_MODEL.md. Канонические роли: finder | recruiter.
-- Все таблицы под RLS. Токены VCS вынесены в отдельную таблицу без клиентских
-- политик (доступ только service_role / Edge Functions).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('finder', 'recruiter');
exception when duplicate_object then null; end $$;

do $$ begin
  create type vacancy_status as enum ('open', 'paused', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type swipe_direction as enum ('left', 'right');
exception when duplicate_object then null; end $$;

do $$ begin
  create type swipe_target as enum ('vacancy', 'finder');
exception when duplicate_object then null; end $$;

do $$ begin
  create type vcs_provider as enum ('github', 'gitlab');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- Триггер updated_at
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- БАЗОВЫЕ ТАБЛИЦЫ
-- =====================================================================

-- profiles: 1:1 c auth.users. Роль выставляется приложением (см. lib/devAuth.ts).
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         user_role not null,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
drop trigger if exists trg_profiles_updated on profiles;
create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- finder_profiles: резюме соискателя (role = finder).
create table if not exists finder_profiles (
  id                 uuid primary key default gen_random_uuid(),
  profile_id         uuid not null unique references profiles(id) on delete cascade,
  headline           text,
  years_experience   int check (years_experience >= 0),
  stack              text[] not null default '{}',
  salary_expectation text,
  location_format    text,
  about              text,
  highlights         text[] not null default '{}',
  is_searchable      boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
drop trigger if exists trg_finder_profiles_updated on finder_profiles;
create trigger trg_finder_profiles_updated before update on finder_profiles
  for each row execute function set_updated_at();

-- companies: работодатель (role = recruiter может владеть несколькими).
create table if not exists companies (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references profiles(id) on delete cascade,
  name        text not null,
  industry    text,
  size        text,
  description text,
  logo_url    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_companies_owner on companies(owner_id);
drop trigger if exists trg_companies_updated on companies;
create trigger trg_companies_updated before update on companies
  for each row execute function set_updated_at();

-- vacancies: то, что свайпает finder.
create table if not exists vacancies (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references companies(id) on delete cascade,
  title           text not null,
  level           text,
  stack           text[] not null default '{}',
  salary_range    text,
  location_format text,
  description     text,
  highlights      text[] not null default '{}',
  status          vacancy_status not null default 'open',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_vacancies_company on vacancies(company_id);
create index if not exists idx_vacancies_status on vacancies(status);
drop trigger if exists trg_vacancies_updated on vacancies;
create trigger trg_vacancies_updated before update on vacancies
  for each row execute function set_updated_at();

-- =====================================================================
-- ПЕРСОНАЛИЗАЦИЯ РЕЗЮМЕ FINDER'А
-- =====================================================================

-- ai_experience: опыт работы с ИИ-агентами.
create table if not exists ai_experience (
  id          uuid primary key default gen_random_uuid(),
  finder_id   uuid not null references finder_profiles(id) on delete cascade,
  tool        text not null,
  proficiency text,
  description text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_ai_experience_finder on ai_experience(finder_id);

-- projects: проекты, которые можно линковать.
create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  finder_id   uuid not null references finder_profiles(id) on delete cascade,
  title       text not null,
  role        text,
  description text,
  url         text,
  tech        text[] not null default '{}',
  created_at  timestamptz not null default now()
);
create index if not exists idx_projects_finder on projects(finder_id);

-- vcs_accounts: привязка GitHub/GitLab (БЕЗ токенов — публичные поля).
create table if not exists vcs_accounts (
  id          uuid primary key default gen_random_uuid(),
  finder_id   uuid not null references finder_profiles(id) on delete cascade,
  provider    vcs_provider not null,
  username    text not null,
  profile_url text,
  created_at  timestamptz not null default now(),
  unique (finder_id, provider)
);
create index if not exists idx_vcs_accounts_finder on vcs_accounts(finder_id);

-- vcs_credentials: секреты VCS. RLS включён, политик НЕТ -> доступ только
-- service_role (обходит RLS), напр. из Edge Function. В клиент не попадает.
create table if not exists vcs_credentials (
  account_id    uuid primary key references vcs_accounts(id) on delete cascade,
  access_token  text not null,
  refresh_token text,
  updated_at    timestamptz not null default now()
);

-- vcs_commits: кэш последних коммитов для таблицы в профиле.
create table if not exists vcs_commits (
  id           uuid primary key default gen_random_uuid(),
  account_id   uuid not null references vcs_accounts(id) on delete cascade,
  repo         text not null,
  message      text,
  sha          text,
  committed_at timestamptz,
  url          text
);
create index if not exists idx_vcs_commits_account
  on vcs_commits(account_id, committed_at desc);

-- =====================================================================
-- СВАЙПЫ / МЭТЧИ / ЧАТЫ
-- =====================================================================

-- swipes: finder->vacancy и recruiter->finder. target_id без FK (полиморфно).
create table if not exists swipes (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid not null references profiles(id) on delete cascade,
  target_type swipe_target not null,
  target_id   uuid not null,
  direction   swipe_direction not null,
  created_at  timestamptz not null default now(),
  unique (actor_id, target_type, target_id)
);
create index if not exists idx_swipes_target on swipes(target_type, target_id);

-- matches: создаётся при взаимном 'right' (обычно из Edge Function/service_role).
create table if not exists matches (
  id           uuid primary key default gen_random_uuid(),
  finder_id    uuid not null references profiles(id) on delete cascade,
  recruiter_id uuid not null references profiles(id) on delete cascade,
  vacancy_id   uuid references vacancies(id) on delete set null,
  created_at   timestamptz not null default now(),
  unique (finder_id, recruiter_id, vacancy_id)
);
create index if not exists idx_matches_finder on matches(finder_id);
create index if not exists idx_matches_recruiter on matches(recruiter_id);

create table if not exists conversations (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null unique references matches(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null references profiles(id) on delete cascade,
  body            text not null,
  created_at      timestamptz not null default now()
);
create index if not exists idx_messages_conversation
  on messages(conversation_id, created_at);

-- =====================================================================
-- RLS — включаем на всех таблицах
-- =====================================================================
alter table profiles        enable row level security;
alter table finder_profiles enable row level security;
alter table companies       enable row level security;
alter table vacancies       enable row level security;
alter table ai_experience   enable row level security;
alter table projects        enable row level security;
alter table vcs_accounts    enable row level security;
alter table vcs_credentials enable row level security;  -- без политик = deny all
alter table vcs_commits     enable row level security;
alter table swipes          enable row level security;
alter table matches         enable row level security;
alter table conversations   enable row level security;
alter table messages        enable row level security;

-- ---------- profiles ----------
drop policy if exists profiles_select_all on profiles;
create policy profiles_select_all on profiles
  for select to authenticated using (true);
drop policy if exists profiles_insert_own on profiles;
create policy profiles_insert_own on profiles
  for insert to authenticated with check (id = auth.uid());
drop policy if exists profiles_update_own on profiles;
create policy profiles_update_own on profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ---------- finder_profiles ----------
drop policy if exists finder_profiles_select on finder_profiles;
create policy finder_profiles_select on finder_profiles
  for select to authenticated using (is_searchable or profile_id = auth.uid());
drop policy if exists finder_profiles_modify_own on finder_profiles;
create policy finder_profiles_modify_own on finder_profiles
  for all to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- ---------- companies ----------
drop policy if exists companies_select_all on companies;
create policy companies_select_all on companies
  for select to authenticated using (true);
drop policy if exists companies_modify_own on companies;
create policy companies_modify_own on companies
  for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ---------- vacancies ----------
drop policy if exists vacancies_select on vacancies;
create policy vacancies_select on vacancies
  for select to authenticated using (
    status = 'open'
    or exists (select 1 from companies c
               where c.id = vacancies.company_id and c.owner_id = auth.uid())
  );
drop policy if exists vacancies_modify_own on vacancies;
create policy vacancies_modify_own on vacancies
  for all to authenticated
  using (exists (select 1 from companies c
                 where c.id = vacancies.company_id and c.owner_id = auth.uid()))
  with check (exists (select 1 from companies c
                      where c.id = vacancies.company_id and c.owner_id = auth.uid()));

-- ---------- ai_experience ----------
drop policy if exists ai_experience_select on ai_experience;
create policy ai_experience_select on ai_experience
  for select to authenticated using (
    exists (select 1 from finder_profiles fp
            where fp.id = ai_experience.finder_id
              and (fp.is_searchable or fp.profile_id = auth.uid()))
  );
drop policy if exists ai_experience_modify_own on ai_experience;
create policy ai_experience_modify_own on ai_experience
  for all to authenticated
  using (exists (select 1 from finder_profiles fp
                 where fp.id = ai_experience.finder_id and fp.profile_id = auth.uid()))
  with check (exists (select 1 from finder_profiles fp
                      where fp.id = ai_experience.finder_id and fp.profile_id = auth.uid()));

-- ---------- projects ----------
drop policy if exists projects_select on projects;
create policy projects_select on projects
  for select to authenticated using (
    exists (select 1 from finder_profiles fp
            where fp.id = projects.finder_id
              and (fp.is_searchable or fp.profile_id = auth.uid()))
  );
drop policy if exists projects_modify_own on projects;
create policy projects_modify_own on projects
  for all to authenticated
  using (exists (select 1 from finder_profiles fp
                 where fp.id = projects.finder_id and fp.profile_id = auth.uid()))
  with check (exists (select 1 from finder_profiles fp
                      where fp.id = projects.finder_id and fp.profile_id = auth.uid()));

-- ---------- vcs_accounts ----------
drop policy if exists vcs_accounts_select on vcs_accounts;
create policy vcs_accounts_select on vcs_accounts
  for select to authenticated using (
    exists (select 1 from finder_profiles fp
            where fp.id = vcs_accounts.finder_id
              and (fp.is_searchable or fp.profile_id = auth.uid()))
  );
drop policy if exists vcs_accounts_modify_own on vcs_accounts;
create policy vcs_accounts_modify_own on vcs_accounts
  for all to authenticated
  using (exists (select 1 from finder_profiles fp
                 where fp.id = vcs_accounts.finder_id and fp.profile_id = auth.uid()))
  with check (exists (select 1 from finder_profiles fp
                      where fp.id = vcs_accounts.finder_id and fp.profile_id = auth.uid()));

-- ---------- vcs_commits ----------
drop policy if exists vcs_commits_select on vcs_commits;
create policy vcs_commits_select on vcs_commits
  for select to authenticated using (
    exists (select 1 from vcs_accounts va
            join finder_profiles fp on fp.id = va.finder_id
            where va.id = vcs_commits.account_id
              and (fp.is_searchable or fp.profile_id = auth.uid()))
  );
drop policy if exists vcs_commits_modify_own on vcs_commits;
create policy vcs_commits_modify_own on vcs_commits
  for all to authenticated
  using (exists (select 1 from vcs_accounts va
                 join finder_profiles fp on fp.id = va.finder_id
                 where va.id = vcs_commits.account_id and fp.profile_id = auth.uid()))
  with check (exists (select 1 from vcs_accounts va
                      join finder_profiles fp on fp.id = va.finder_id
                      where va.id = vcs_commits.account_id and fp.profile_id = auth.uid()));

-- vcs_credentials: политик нет — клиентский доступ запрещён полностью.

-- ---------- swipes ----------
drop policy if exists swipes_select_own on swipes;
create policy swipes_select_own on swipes
  for select to authenticated using (actor_id = auth.uid());
drop policy if exists swipes_insert_own on swipes;
create policy swipes_insert_own on swipes
  for insert to authenticated with check (actor_id = auth.uid());

-- ---------- matches (создание — service_role; клиент только читает свои) ----------
drop policy if exists matches_select_participant on matches;
create policy matches_select_participant on matches
  for select to authenticated
  using (finder_id = auth.uid() or recruiter_id = auth.uid());

-- ---------- conversations ----------
drop policy if exists conversations_select_participant on conversations;
create policy conversations_select_participant on conversations
  for select to authenticated using (
    exists (select 1 from matches m
            where m.id = conversations.match_id
              and (m.finder_id = auth.uid() or m.recruiter_id = auth.uid()))
  );

-- ---------- messages ----------
drop policy if exists messages_select_participant on messages;
create policy messages_select_participant on messages
  for select to authenticated using (
    exists (select 1 from conversations c
            join matches m on m.id = c.match_id
            where c.id = messages.conversation_id
              and (m.finder_id = auth.uid() or m.recruiter_id = auth.uid()))
  );
drop policy if exists messages_insert_participant on messages;
create policy messages_insert_participant on messages
  for insert to authenticated with check (
    sender_id = auth.uid()
    and exists (select 1 from conversations c
                join matches m on m.id = c.match_id
                where c.id = messages.conversation_id
                  and (m.finder_id = auth.uid() or m.recruiter_id = auth.uid()))
  );

-- =====================================================================
-- Готово. После применения сверь список таблиц: docs/DATA_MODEL.md
-- =====================================================================
