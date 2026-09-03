-- Contribution heatmap (грид активности) для профиля finder'а.
-- Кэш с GitHub/GitLab API; клиент читает только count по дням, без токенов.

create table if not exists vcs_contributions (
  account_id uuid not null references vcs_accounts(id) on delete cascade,
  day        date not null,
  count      int not null default 0 check (count >= 0),
  primary key (account_id, day)
);
create index if not exists idx_vcs_contributions_account_day
  on vcs_contributions(account_id, day desc);

alter table vcs_contributions enable row level security;

drop policy if exists vcs_contributions_select on vcs_contributions;
create policy vcs_contributions_select on vcs_contributions
  for select to authenticated using (
    exists (select 1 from vcs_accounts va
            join finder_profiles fp on fp.id = va.finder_id
            where va.id = vcs_contributions.account_id
              and (fp.is_searchable or fp.profile_id = auth.uid()))
  );

drop policy if exists vcs_contributions_modify_own on vcs_contributions;
create policy vcs_contributions_modify_own on vcs_contributions
  for all to authenticated
  using (exists (select 1 from vcs_accounts va
                 join finder_profiles fp on fp.id = va.finder_id
                 where va.id = vcs_contributions.account_id and fp.profile_id = auth.uid()))
  with check (exists (select 1 from vcs_accounts va
                      join finder_profiles fp on fp.id = va.finder_id
                      where va.id = vcs_contributions.account_id and fp.profile_id = auth.uid()));
