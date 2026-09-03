# FindIT — модель данных (Supabase / Postgres)

Схема БД под продукт из
[`FINDIT_PRODUCT_CONTEXT.md`](./FINDIT_PRODUCT_CONTEXT.md).

> 📦 **SQL:** [`0001_initial_schema.sql`](../supabase/migrations/0001_initial_schema.sql)
> (таблицы + enum'ы + RLS) и [`0002_vcs_contributions.sql`](../supabase/migrations/0002_vcs_contributions.sql)
> (heatmap). TS-типы — [`lib/database.types.ts`](../lib/database.types.ts).

Статус: SQL подготовлен, но в приложении пока реально используется только
`profiles.role` (пишется из `lib/devAuth.ts`). Остальное подключается на этапе
интеграции бэкенда (см. [`ROADMAP.md`](./ROADMAP.md)).

> Роли: только **`finder`** и **`recruiter`** (enum `user_role`, тип `UserRole`
> в `lib/roles.ts`). Других ролей нет. Все ссылки на пользователя — на
> `auth.users(id)` Supabase. Включать **RLS** на всех таблицах.

---

## 1. Обзор сущностей

```
auth.users (Supabase)
   └─ profiles (1:1)  role: finder | recruiter
        ├─ finder_profiles (1:1, если role=finder)
        │     ├─ projects (1:N)
        │     ├─ vcs_accounts (1:N)  github/gitlab (публичные поля)
        │     │     ├─ vcs_credentials (1:1, токены — только service_role)
        │     │     ├─ vcs_commits (1:N, кэш последних коммитов)
        │     │     └─ vcs_contributions (кэш heatmap по дням)
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
| `role` | `user_role` | enum `'finder' \| 'recruiter'` |
| `display_name` | `text` | |
| `avatar_url` | `text` | |
| `location_country` | `text` | свободный текст страны; клиент: `ProfileLocation.country` |
| `location_city` | `text` | свободный текст города; клиент: `ProfileLocation.city` (оба обязательны) |
| `created_at` | `timestamptz` | default `now()` |

> Сейчас `setAccountRole()` делает `upsert({ id, role })`. Дублирование роли в
> `user_metadata.role` оставить для быстрых клиентских проверок.

### `finder_profiles` (резюме соискателя)
| Колонка | Тип | Заметки |
|--------|-----|--------|
| `id` | `uuid` PK | |
| `profile_id` | `uuid` FK→profiles | unique |
| `headline` | `text` | ~~грейд~~ — deprecated; в UI не используется (позиция — отдельное поле) |
| `years_experience` | `int` | |
| `stack` | `text[]` | теги технологий |
| `salary_expectation` | `text` | цифры + `$` в UI клиента |
| `location_format` | `text` | CSV: `online` / `hybrid` / `offline` (мультивыбор) |
| `about` | `text` | письмо «о себе» finder'а; видно recruiter'ам при отклике (`FinderProfile.about`) |
| `highlights` | `text[]` | якорные факты |
| `is_searchable` | `bool` | виден ли в ленте recruiter'ов |

> Соответствует мок-типу `FinderResume` в `data/finderResumes.ts` (резюме finder'а, не отдельная роль).

### `companies` (компания recruiter'а)
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

### `vcs_contributions` — кэш contribution-грида (heatmap)
| Колонка | Тип | Заметки |
|--------|-----|--------|
| `account_id` | `uuid` FK→vcs_accounts | PK вместе с `day` |
| `day` | `date` | день UTC |
| `count` | `int` | число вкладов за день (≥ 0) |

> Коммиты и heatmap подтягиваются фоновым джобом / Edge Function через GitHub/GitLab API
> и кэшируются здесь, чтобы профиль рендерился быстро и без токенов в клиенте.
> Миграция: [`0002_vcs_contributions.sql`](../supabase/migrations/0002_vcs_contributions.sql).

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
| `data/finderResumes.ts` (мок) | `finder_profiles` + связанные |
| `FinderProfile.git` (мок: ссылка + connect) | `vcs_accounts` + `vcs_commits` + `vcs_contributions` |
| `data/registerPresets.ts` (мок) | данные регистрации → `profiles`/`companies` |
| мок-диалоги в `ChatsScreen` | `conversations` + `messages` |
| — (нет) | `vacancies`, `swipes`, `matches`, `projects`, `vcs_*`, `ai_experience` |

> При реализации миграций используй Supabase MCP (`apply_migration`, `list_tables`)
> и сверяйся с этим документом. Обновляй таблицу выше по мере интеграции.
