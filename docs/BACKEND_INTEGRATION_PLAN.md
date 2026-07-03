# FindIT — план подключения бэкенда (Supabase)

> **Статус БД:** миграции `0001_initial_schema.sql` и `0002_message_images.sql` **уже применены** в Supabase.  
> **Цель документа:** пошагово довести приложение от UI-прототипа с моками до полной работы через Supabase: auth, регистрация по шагам, профили по ролям, ленты, свайпы, мэтчи, чаты.

Связанные документы: [`DATA_MODEL.md`](./DATA_MODEL.md), [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`ROADMAP.md`](./ROADMAP.md).

---

## 0. Текущее состояние (что уже есть)

### База данных (применено)

| Миграция | Содержимое |
|----------|------------|
| `0001_initial_schema.sql` | Enum'ы, 14 таблиц, RLS на всех, триггеры `updated_at` |
| `0002_message_images.sql` | `message_type` (`text` \| `image`), `image_url`, CHECK на контент сообщения |

**Таблицы:** `profiles`, `finder_profiles`, `companies`, `vacancies`, `ai_experience`, `projects`, `vcs_accounts`, `vcs_credentials`, `vcs_commits`, `swipes`, `matches`, `conversations`, `messages`.

**RLS-ограничения, важные для клиента:**
- `matches` — клиент **только читает** (INSERT только через service_role / Edge Function).
- `vcs_credentials` — **нет политик** → клиент не имеет доступа.
- `conversations` — только SELECT (создание вместе с match на бэке).
- `finder_profiles` — recruiter видит только `is_searchable = true`.

### Клиентский слой Supabase (готов частично)

| Файл | Что делает | Статус |
|------|------------|--------|
| `lib/supabase.ts` | Клиент + валидация env | ✅ |
| `contexts/SupabaseAuthContext.tsx` | `session` / `user` / `initializing` | ✅ не используется в навигации |
| `lib/devAuth.ts` | Dev email-вход, `setAccountRole`, upsert `profiles` | ✅ только DevPanel |
| `lib/registerAuth.ts` | Phone OTP, verify, password, sign-in | 🟡 **не подключён** к WelcomeScreen |
| `lib/registerProgress.ts` | Сохранение шагов регистрации в БД | 🟡 **устаревшие step id**, не вызывается из UI |
| `lib/database.types.ts` | TS-типы под схему | ✅ ручные, сверить после `supabase gen types` |
| `lib/chat/chatService.ts` | Чаты | 🟡 messages — частично; conversations — мок |

### UI-поток (работает на моках)

```
WelcomeScreen (intent → login / register)
  → navigation.replace('Main', { role, profile })   // без реальной сессии
MainNavigator → MainSessionContext (template profile)
  → CandidateSwipe (мок: candidateAnkety / vacancies)
  → Chats (мок + частичный Supabase для messages)
  → Profile (signOut = reset на Welcome, без supabase.auth.signOut)
```

**Ключевой разрыв:** основной поток **не завязан** на `SupabaseAuthContext`. Роль и профиль живут в параметрах навигации и `data/templateAccounts.ts`.

---

## 1. Подготовка Supabase Dashboard (до кода)

### 1.1 Переменные окружения

В `.env` (локально и в EAS Secrets):

```
EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...   # или legacy anon
```

Опционально для DevPanel:
```
EXPO_PUBLIC_DEV_AUTH_EMAIL=...
EXPO_PUBLIC_DEV_AUTH_PASSWORD=...
```

### 1.2 Authentication

| Задача | Где в Dashboard |
|--------|-----------------|
| Включить **Phone** provider | Authentication → Providers → Phone |
| Настроить SMS (Twilio / MessageBird / Vonage) | Phone → SMS provider |
| Включить **Email + Password** (для dev-входа) | Providers → Email |
| OAuth (Google / Apple / LinkedIn) — позже | Providers → соответствующие |
| Phone confirm: включить | Phone settings |
| JWT / session: стандартные настройки | OK для MVP |

**Проверка:** тестовый OTP на реальный номер; dev-вход по email из DevPanel.

### 1.3 Storage (для чатов, миграция 0002)

1. Создать bucket **`chat-images`** (private).
2. Политики `storage.objects`:
   - **INSERT:** `authenticated`, path `{conversation_id}/*`
   - **SELECT:** только участники conversation (через join `matches` — лучше Edge Function или policy с subquery)
3. Для private bucket — **signed URLs** вместо `getPublicUrl` (сейчас в `chatService.ts` stub).

### 1.4 Edge Functions (запланировать)

| Function | Назначение |
|----------|------------|
| `on-swipe` или `check-match` | После `swipes` INSERT — проверка взаимного `right`, создание `matches` + `conversations` |
| `sync-vcs-commits` | Фоновая подтяжка коммитов GitHub/GitLab в `vcs_commits` (service_role → `vcs_credentials`) |

Клиент **не может** создавать `matches` и `conversations` из-за RLS.

### 1.5 Сид-данные (опционально, для dev)

- 2–3 recruiter + companies + open vacancies
- 3–5 finder + finder_profiles + ai_experience
- Скрипт SQL или seed через Dashboard

---

## 2. Фаза A — Auth-гейтинг и сессия

**Цель:** после сплеша пользователь попадает в Welcome или Main в зависимости от сессии; выход реально разлогинивает.

### Задачи

| # | Задача | Файлы |
|---|--------|-------|
| A1 | Ожидать `initializing === false` перед показом RootNavigator | `App.tsx`, `RootNavigator.tsx` |
| A2 | Auth-гейт: есть session → `Main`, нет → `Welcome` | `RootNavigator.tsx` или обёртка `AuthGate` |
| A3 | При старте с session: загрузить `profiles.role` + role-specific profile из БД | новый `lib/profileService.ts` |
| A4 | `ProfileScreen.signOut` → `supabase.auth.signOut()` + reset навигации | `ProfileScreen.tsx` |
| A5 | `readAccountRole`: fallback на `profiles.role`, если нет в `user_metadata` | `lib/devAuth.ts` → переименовать/расширить в `lib/accountRole.ts` |
| A6 | DevPanel: оставить для смены роли в dev, но не как единственный способ auth | `DevPanel.tsx` |

### Критерий готовности

- Перезапуск приложения с валидной сессией → сразу Main.
- Sign out → Welcome, повторный вход нужен.
- Без `.env` — понятная ошибка / fallback (как сейчас `isSupabaseConfigured`).

---

## 3. Фаза B — Регистрация и вход (WelcomeScreen + steps)

**Цель:** полный цикл phone auth + мастер регистрации пишет в БД.

### 3.1 Текущие шаги регистрации (`data/registerStepDefs.ts`)

**Общий account-step (step 0):** телефон + пароль + выбор роли (`finder` \| `recruiter`).

| Роль | Шаг 1 | Шаг 2 |
|------|-------|-------|
| `finder` | `verify` — OTP SMS | `highlights` — AI tools, AI models, GitHub |
| `recruiter` | `verify` — OTP SMS | `company` — corp email, название, ссылка |

### 3.2 Поток auth (что подключить из `lib/registerAuth.ts`)

```
Account step (phone + password + role)
  1. sendPhoneOtp(e164)                    // уже вызывается при resend
  2. verifyPhoneOtp(e164, otp)             // на шаге verify → «Далее»
  3. finalizePhoneSignup({ password, role }) // после verify: пароль + role в metadata + profiles upsert

Login flow
  signInWithPhonePassword(e164, password) → session → load profile → Main
```

**Файлы:** `screens/WelcomeScreen.tsx`, `lib/registerAuth.ts`.

### 3.3 Маппинг формы → БД

| Поле формы | Таблица / колонка | Заметки |
|------------|-------------------|---------|
| `phone` | `auth.users.phone` | E.164 через `lib/phoneFormat.ts` |
| `password` | Supabase Auth | `finalizePhoneSignup` / sign-in |
| `role` | `profiles.role` + `user_metadata.role` | enum `finder` \| `recruiter` |
| `otpCode` | — | только verify, не хранить |
| `selectedAiTools` | `ai_experience` (N строк) | `tool` = id из `aiToolsCatalog` |
| `selectedAiModels` | **⚠️ нет колонки** | варианты: (a) второй набор `ai_experience` с prefix `model:`; (b) `finder_profiles.highlights`; (c) миграция `ai_models text[]` |
| `github` | `vcs_accounts` | `provider='github'`, parse username из URL |
| `email` (recruiter) | `auth.users.email` | `updateUser({ email })` |
| `company` | `companies.name` | `owner_id = auth.uid()` |
| `companyLink` | `companies.description` или новая колонка `website` | **⚠️ сейчас пишется в description** — решить канон |
| `industry` | `companies.industry` | не в текущем UI recruiter step — добавить или пропустить |

**Finder после регистрации:** создать пустой `finder_profiles` (минимум `profile_id`, `is_searchable=true`).

**Recruiter после регистрации:** `profiles` + `companies` row.

### 3.4 Переписать `lib/registerProgress.ts`

Текущие step id (`about`, `stack`, `ai`, `vcs`) **не совпадают** с UI (`verify`, `highlights`, `company`).

| Новый step id | Действие |
|---------------|----------|
| `verify` | только auth (verify + finalize) — в `registerAuth`, не в progress |
| `highlights` | upsert `finder_profiles`, replace `ai_experience`, upsert `vcs_accounts` |
| `company` | upsert `profiles`, insert/update `companies` |

Вызывать:
- `saveRegisterStep(role, stepId, form)` в `goNextRegister` после успешного шага;
- `saveRegisterFinal(role, form)` в `completeRegister`.

### 3.5 Login vs Register

| Сценарий | Поведение |
|----------|-----------|
| Login | `signInWithPhonePassword` → загрузить profile из БД → `replace('Main')` |
| Register | OTP flow → steps → `saveRegisterFinal` → `replace('Main')` |
| Social buttons | **Фаза позже:** Supabase OAuth providers + тот же upsert `profiles` |

### 3.6 Обработка ошибок

- `RegisterAuthError` (`supabaseNotConfigured`, `authFailed`) — уже есть в resend; расширить на все auth-вызовы.
- Loading state на CTA-кнопках (disable + spinner).
- При ошибке profiles upsert — **блокировать** переход (сейчас только `console.info`).

### Критерий готовности

- Новый finder: phone → OTP → highlights → Main; в Supabase есть `profiles`, `finder_profiles`, `ai_experience`, `vcs_accounts`.
- Новый recruiter: phone → OTP → company → Main; есть `profiles`, `companies`.
- Login существующим пользователем → Main с данными из БД.

---

## 4. Фаза C — Профили по ролям (загрузка / сохранение)

**Цель:** `MainSessionContext` питается из Supabase, а не из `templateAccounts`.

### 4.1 Новый сервис `lib/profileService.ts`

```text
loadRoleProfile(userId, role): Promise<RoleProfile>
  finder  → join profiles + finder_profiles + ai_experience + vcs_accounts
  recruiter → join profiles + companies (first by owner_id)

mapDbToRoleProfile(rows): RoleProfile   // DB → lib/profileTypes.ts
mapFormToDbInserts(form, role): ...     // для регистрации
```

### 4.2 Согласование типов

| `lib/profileTypes.ts` | БД |
|-----------------------|-----|
| `FinderProfile.displayName` | `profiles.display_name` |
| `FinderProfile.headline` | `finder_profiles.headline` |
| `FinderProfile.stack` | `finder_profiles.stack` |
| `FinderProfile.selectedAiTools` | `ai_experience.tool` (filter tools) |
| `FinderProfile.gitlabUrl` | `vcs_accounts.profile_url` |
| `FinderProfile.experience[]` | **нет таблицы** — пока mock / будущая `work_experience` |
| `RecruiterProfile.companyName` | `companies.name` |
| `RecruiterProfile.contactName` | `profiles.display_name` |

**Техдолг:** `WorkExperience` — нет в миграции; для MVP оставить пустым массивом или добавить миграцию `0003_work_experience.sql`.

### 4.3 MainSessionContext

- `initialProfile` загружать async в `MainNavigator` (splash / loading).
- Убрать `getTemplateProfile` как default после интеграции (оставить fallback offline).

### Критерий готовности

- Profile tab показывает данные из БД после регистрации.
- Смена роли через DevPanel синхронизирует `profiles.role` + перезагрузку profile.

---

## 5. Фаза D — Ленты свайпа

**Цель:** recruiter свайпает finder'ов, finder — вакансии; данные из БД.

### 5.1 Recruiter → finder_profiles

```sql
-- лента: searchable finder'ы, исключая уже свайпнутых
SELECT fp.*, p.display_name, ...
FROM finder_profiles fp
JOIN profiles p ON p.id = fp.profile_id
WHERE fp.is_searchable = true
  AND p.role = 'finder'
  AND NOT EXISTS (
    SELECT 1 FROM swipes s
    WHERE s.actor_id = auth.uid()
      AND s.target_type = 'finder'
      AND s.target_id = fp.id
  )
ORDER BY fp.updated_at DESC
LIMIT 20;
```

**Файлы:** новый `lib/swipeService.ts`, `screens/CandidateSwipeScreen.tsx`, `data/candidateAnkety.ts` → fallback.

### 5.2 Finder → vacancies

```sql
SELECT v.*, c.name AS company_name, ...
FROM vacancies v
JOIN companies c ON c.id = v.company_id
WHERE v.status = 'open'
  AND NOT EXISTS (
    SELECT 1 FROM swipes s
    WHERE s.actor_id = auth.uid()
      AND s.target_type = 'vacancy'
      AND s.target_id = v.id
  );
```

**Файлы:** `data/vacancies.ts` → fallback, `VacancySwipeCard.tsx`.

### 5.3 Запись свайпа

```typescript
await supabase.from('swipes').insert({
  actor_id: userId,
  target_type: isFinder ? 'vacancy' : 'finder',
  target_id: cardId,
  direction: 'right' | 'left',
});
```

После INSERT — вызов Edge Function `check-match` (или Database Webhook).

### Критерий готовности

- Свайп сохраняется в `swipes`.
- Лента не показывает уже свайпнутые карточки.
- При взаимном right создаётся match (через Edge Function).

---

## 6. Фаза E — Мэтчи и чаты

### 6.1 Edge Function: создание match

**Триггер:** INSERT в `swipes` WHERE `direction = 'right'`.

**Логика (упрощённо):**
1. Если actor = finder, target = vacancy → найти recruiter (owner company) → проверить, свайпал ли recruiter этого finder'а right.
2. Если actor = recruiter, target = finder → проверить, свайпал ли finder вакансию этого recruiter'а right.
3. INSERT `matches` + `conversations`.

### 6.2 `lib/chat/chatService.ts` — доработки

| Функция | Сейчас | Нужно |
|---------|--------|-------|
| `fetchConversations` | мок | join `conversations` → `matches` → peer profile + last message |
| `fetchMessages` | ✅ частично | realtime subscription (`supabase.channel`) |
| `sendTextMessage` | ✅ | OK |
| `sendImageMessage` | ✅ insert | Storage policies + signed URL |
| `getCurrentChatUserId` | mock id | `session.user.id` |

**RPC (опционально):** `get_conversation_previews(user_id)` — один запрос вместо N+1.

### 6.3 Realtime

- Subscribe на `messages` WHERE `conversation_id = ?`.
- Subscribe на новые `matches` для badge в таб-баре.

### Критерий готовности

- Список чатов — только реальные мэтчи пользователя.
- Сообщения синхронизируются между двумя аккаунтами.
- Картинки в чате загружаются в Storage и отображаются.

---

## 7. Фаза F — Доп. миграции (по необходимости)

| ID | Что | Зачем |
|----|-----|-------|
| `0003` | `finder_profiles.ai_models text[]` или таблица | Хранить выбранные модели из регистрации |
| `0003` | `companies.website text` | Отделить сайт от `description` |
| `0004` | `work_experience` | Блок опыта работы в профиле finder |
| `0005` | `profiles.phone text` | Дублировать для поиска (опционально) |
| — | Database trigger / Edge Function on `swipes` | Автоматические matches |
| — | RLS policy INSERT на `conversations` | Только если создание match на клиенте (не рекомендуется) |

Перед каждой новой миграцией: SQL в `supabase/migrations/`, обновить `DATA_MODEL.md` + `database.types.ts`.

---

## 8. Порядок работ (рекомендуемый)

```text
[Подготовка Dashboard: Phone SMS, Storage bucket]
        ↓
A. Auth-гейтинг + signOut + load session
        ↓
B. Register/Login phone flow + saveRegisterStep (актуальные step id)
        ↓
C. profileService + MainSession из БД
        ↓
D. Ленты + запись swipes
        ↓
E. Edge Function matches + чаты (fetchConversations, realtime)
        ↓
F. OAuth, work_experience, VCS sync, seed-данные
```

**Оценка MVP (бэкенд подключён):** фазы A + B + C + D (без auto-match) + базовый E.

---

## 9. Чеклист «полностью подключено»

### Auth & users
- [ ] Phone OTP регистрация работает end-to-end
- [ ] Login по phone + password
- [ ] `profiles.role` = `finder` | `recruiter` для каждого пользователя
- [ ] Auth-гейтинг: session определяет Welcome vs Main
- [ ] Sign out через Supabase

### Регистрация по шагам
- [ ] Verify → session создаётся
- [ ] Finder highlights → `finder_profiles`, `ai_experience`, `vcs_accounts`
- [ ] Recruiter company → `companies`
- [ ] `registerProgress.ts` синхронизирован с `registerStepDefs.ts`

### Профиль
- [ ] MainSession грузится из БД
- [ ] ProfileScreen отображает актуальные данные
- [ ] DevPanel смена роли пишет в `profiles`

### Свайпы & мэтчи
- [ ] Лента finder: `vacancies` из БД
- [ ] Лента recruiter: `finder_profiles` из БД
- [ ] `swipes` пишутся на каждый свайп
- [ ] Edge Function создаёт `matches` + `conversations`

### Чаты
- [ ] `fetchConversations` из Supabase
- [ ] Realtime messages
- [ ] Bucket `chat-images` + политики + image messages

### Инфра
- [ ] `.env` / EAS secrets настроены
- [ ] `supabase gen types` → обновить `database.types.ts`
- [ ] Seed-данные для тестирования двух ролей

---

## 10. Карта файлов для правок

| Область | Файлы |
|---------|-------|
| Auth gate | `App.tsx`, `navigation/RootNavigator.tsx` |
| Register/Login | `screens/WelcomeScreen.tsx`, `lib/registerAuth.ts`, `lib/registerProgress.ts` |
| Profile load | **новый** `lib/profileService.ts`, `navigation/MainSessionContext.tsx`, `navigation/MainNavigator.tsx` |
| Sign out | `screens/ProfileScreen.tsx` |
| Swipe | **новый** `lib/swipeService.ts`, `screens/CandidateSwipeScreen.tsx` |
| Chat | `lib/chat/chatService.ts`, `screens/ChatsScreen.tsx`, `screens/ChatRoomScreen.tsx` |
| Matches | **новый** `supabase/functions/check-match/` |
| Types | `lib/database.types.ts`, `lib/profileTypes.ts` |
| Dev | `lib/devAuth.ts`, `components/dev/DevPanel.tsx` |
| Docs | `DATA_MODEL.md`, `ARCHITECTURE.md`, `ROADMAP.md` (статусы ✅) |

---

## 11. Риски и решения

| Риск | Решение |
|------|---------|
| SMS не приходит | Проверить Twilio geo permissions; dev fallback — test OTP в Supabase |
| RLS блокирует insert | Сверить `auth.uid()` = `profiles.id`; пользователь authenticated |
| `registerProgress` out of sync | Переписать под `verify` / `highlights` / `company` |
| AI models некуда писать | Быстрый fix: `highlights[]` или миграция `0003` |
| Match logic сложная | MVP: match только finder swiped vacancy X + recruiter swiped finder Y (same vacancy) |
| Нет work_experience в БД | Показывать пустой блок или mock до миграции |

---

*Документ создан для интеграции бэкенда. Обновляй чеклист и статусы фаз по мере выполнения.*
