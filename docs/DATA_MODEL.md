# FindIT — модель данных (Supabase / Postgres)

Схема БД под продукт из
[`FINDIT_PRODUCT_CONTEXT.md`](./FINDIT_PRODUCT_CONTEXT.md).

> 📦 **Готовый SQL:** [`supabase/migrations/0001_initial_schema.sql`](../supabase/migrations/0001_initial_schema.sql)
> — создаёт все таблицы ниже + enum'ы + RLS. Применяется через SQL Editor или
> `supabase db push`. TS-типы строк/вставок — [`lib/database.types.ts`](../lib/database.types.ts).

Статус: SQL подготовлен, но в приложении пока реально используется только
`profiles.role` (пишется из `lib/devAuth.ts`). Остальное подключается на этапе
интеграции бэкенда (см. [`ROADMAP.md`](./ROADMAP.md)).

> Канон ролей: **`finder`** и **`recruiter`** (см. `AGENTS.md`). Все ссылки на
> пользователя — на `auth.users(id)` Supabase. Включать **RLS** на всех таблицах.

---

## 1. Обзор сущностей

```
auth.users (Supabase)
   └─ profiles (1:1)  role: finder | recruiter
        ├─ finder_profiles (1:1, если role=finder)
        │     ├─ projects (1:N)
        │     ├─ vcs_accounts (1:N)  github/gitlab (публичные поля)
        │     │     ├─ vcs_credentials (1:1, токены — только service_role)
        │     │     └─ vcs_commits (1:N, кэш последних коммитов)
        │     └─ ai_experience (1:N)  опыт с ИИ-агентами
        └─ companies (1:N, если role=recruiter)
              └─ vacancies (1:N)

swipes (finder↔vacancy и recruiter↔finder)
   └─ matches → conversations → messages
```

---

## 2. Базовые таблицы

### `profiles` (есть сейчас)
| Колонка | Тип | Заметки |
|--------|-----|--------|
| `id` | `uuid` PK | = `auth.users.id` |
| `role` | `text` | `'finder' \| 'recruiter'` (CHECK) |
| `display_name` | `text` | |
| `avatar_url` | `text` | |
| `created_at` | `timestamptz` | default `now()` |

> Сейчас `setAccountRole()` делает `upsert({ id, role })`. Дублирование роли в
> `user_metadata.role` оставить для быстрых клиентских проверок.

### `finder_profiles` (резюме соискателя)
| Колонка | Тип | Заметки |
|--------|-----|--------|
| `id` | `uuid` PK | |
| `profile_id` | `uuid` FK→profiles | unique |
| `headline` | `text` | заголовок/грейд |
| `years_experience` | `int` | |
| `stack` | `text[]` | теги технологий |
| `salary_expectation` | `text` | вилка |
| `location_format` | `text` | офис/гибрид/удалёнка + город |
| `about` | `text` | «о себе» |
| `highlights` | `text[]` | якорные факты |
| `is_searchable` | `bool` | виден ли в ленте recruiter'ов |

> Соответствует мок-типу `CandidateAnketa` в `data/candidateAnkety.ts`.

### `companies` (работодатель)
| Колонка | Тип |
|--------|-----|
| `id` | `uuid` PK |
| `owner_id` | `uuid` FK→profiles (recruiter) |
| `name` | `text` |
| `industry` | `text` |
| `size` | `text` |
| `description` | `text` |
| `logo_url` | `text` |

### `vacancies` (что свайпает finder)
| Колонка | Тип | Заметки |
|--------|-----|--------|
| `id` | `uuid` PK | |
| `company_id` | `uuid` FK→companies | |
| `title` | `text` | позиция |
| `level` | `text` | грейд |
| `stack` | `text[]` | |
| `salary_range` | `text` | |
| `location_format` | `text` | |
| `description` | `text` | |
| `highlights` | `text[]` | |
| `status` | `text` | `'open' \| 'paused' \| 'closed'` |
| `created_at` | `timestamptz` | |

---

## 3. Персонализация finder'а (главная фишка)

### `ai_experience` — опыт работы с ИИ-агентами
| Колонка | Тип | Заметки |
|--------|-----|--------|
| `id` | `uuid` PK | |
| `finder_id` | `uuid` FK→finder_profiles | |
| `tool` | `text` | напр. Cursor, Claude Code, Copilot |
| `proficiency` | `text` | уровень |
| `description` | `text` | как использует / кейсы |

### `projects` — проекты, в которых участвовал (линкуемые)
| Колонка | Тип | Заметки |
|--------|-----|--------|
| `id` | `uuid` PK | |
| `finder_id` | `uuid` FK→finder_profiles | |
| `title` | `text` | |
| `role` | `text` | роль/вклад |
| `description` | `text` | |
| `url` | `text` | ссылка на репозиторий/демо/кейс |
| `tech` | `text[]` | стек проекта |

### `vcs_accounts` — привязка GitHub / GitLab (публичные поля)
| Колонка | Тип | Заметки |
|--------|-----|--------|
| `id` | `uuid` PK | |
| `finder_id` | `uuid` FK→finder_profiles | |
| `provider` | `text` | `'github' \| 'gitlab'` |
| `username` | `text` | |
| `profile_url` | `text` | |

### `vcs_credentials` — секреты VCS (никогда в клиент)
| Колонка | Тип | Заметки |
|--------|-----|--------|
| `account_id` | `uuid` PK FK→vcs_accounts | |
| `access_token` | `text` | RLS без политик → только service_role / Edge Function |
| `refresh_token` | `text` | |

> Токены вынесены из `vcs_accounts` в отдельную таблицу, т.к. RLS работает на уровне
> строк, а не колонок: иначе recruiter, читая публичный аккаунт finder'а, мог бы
> увидеть токен. `vcs_credentials` под RLS **без политик** — клиент не имеет доступа.

### `vcs_commits` — кэш последних коммитов для таблицы в профиле
| Колонка | Тип | Заметки |
|--------|-----|--------|
| `id` | `uuid` PK | |
| `account_id` | `uuid` FK→vcs_accounts | |
| `repo` | `text` | |
| `message` | `text` | |
| `sha` | `text` | |
| `committed_at` | `timestamptz` | |
| `url` | `text` | ссылка на коммит |

> Коммиты подтягиваются фоновым джобом / Edge Function через GitHub/GitLab API и
> кэшируются здесь, чтобы профиль рендерился быстро и без токенов в клиенте.

---

## 4. Свайпы, мэтчи, чаты

### `swipes`
| Колонка | Тип | Заметки |
|--------|-----|--------|
| `id` | `uuid` PK | |
| `actor_id` | `uuid` FK→profiles | кто свайпнул |
| `target_type` | `text` | `'vacancy'` (свайпнул finder) или `'finder'` (свайпнул recruiter) |
| `target_id` | `uuid` | id вакансии или finder_profile |
| `direction` | `text` | `'right' \| 'left'` |
| `created_at` | `timestamptz` | |

Уникальность: `(actor_id, target_type, target_id)`.

### `matches`
Создаётся, когда есть взаимный `right` (finder ↔ конкретная вакансия/компания).
| Колонка | Тип |
|--------|-----|
| `id` | `uuid` PK |
| `finder_id` | `uuid` FK→profiles |
| `recruiter_id` | `uuid` FK→profiles |
| `vacancy_id` | `uuid` FK→vacancies |
| `created_at` | `timestamptz` |

### `conversations` / `messages`
Привязаны к `match_id`; `messages(sender_id, body, created_at)`. Соответствует
мок-данным `ChatsScreen`.

---

## 5. RLS — принципы безопасности

- Включить RLS на **всех** таблицах.
- `profiles`/`finder_profiles`/`companies`/`vacancies`: владелец читает/пишет своё;
  чтение чужих — только публичные поля и только для противоположной роли
  (recruiter видит searchable-резюме, finder видит open-вакансии).
- `vcs_accounts.access_token` **никогда** не отдавать клиенту — доступ только из
  Edge Function (service role).
- `swipes`/`matches`/`messages`: пользователь видит только записи, где он участник.

---

## 6. Связь с текущим кодом

| Сейчас в коде | Будущее в БД |
|---------------|--------------|
| `profiles.role` (пишется в `devAuth.ts`) | `profiles` |
| `data/candidateAnkety.ts` (мок) | `finder_profiles` + связанные |
| `data/registerPresets.ts` (мок) | данные регистрации → `profiles`/`companies` |
| мок-диалоги в `ChatsScreen` | `conversations` + `messages` |
| — (нет) | `vacancies`, `swipes`, `matches`, `projects`, `vcs_*`, `ai_experience` |

> При реализации миграций используй Supabase MCP (`apply_migration`, `list_tables`)
> и сверяйся с этим документом. Обновляй таблицу выше по мере интеграции.
