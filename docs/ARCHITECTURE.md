# FindIT — архитектура и состояние кода

Карта кодовой базы для ИИ-агентов: стек, структура, навигация, что реализовано, а
что пока замокано. Продуктовый контекст — в
[`FINDIT_PRODUCT_CONTEXT.md`](./FINDIT_PRODUCT_CONTEXT.md).

---

## 1. Технологический стек

| Слой | Технология |
|------|-----------|
| Платформа | React Native `0.81.5` + Expo SDK `~54` |
| Язык | TypeScript `~5.9` |
| React | `19.1.0` |
| Навигация | React Navigation 7 (`native-stack` + `bottom-tabs`) |
| Жесты | `react-native-gesture-handler` |
| Бэкенд / Auth | Supabase (`@supabase/supabase-js`), сессии в `AsyncStorage` |
| Мониторинг | Sentry (`@sentry/react-native`, опционально) |
| Точка входа | `index.ts` → `App.tsx` |

Скрипты (`package.json`): `npm start` / `android` / `ios` поднимают **Expo Go** (`expo start --go`). `npm run start:dev-client` — только если на телефоне стоит EAS development build.

---

## 2. Карта папок

```
FindIT/
├─ App.tsx                  # Корень: GestureHandler → SafeArea → SupabaseAuthProvider → RootNavigator + DevPanel
├─ index.ts                 # Регистрация приложения
├─ navigation/
│  ├─ RootNavigator.tsx     # Native-stack: Welcome → Register → Main
│  ├─ MainNavigator.tsx     # Bottom-tabs: CandidateSwipe / Chats / Profile
│  ├─ ChatsNavigator.tsx    # Стек: список → комната чата
│  ├─ ProfileNavigator.tsx  # Стек: хаб профиля → настройки / оценки / вакансии
│  ├─ MainSessionContext.tsx# Контекст сессии (role + profile + setProfile) внутри Main
│  └─ types.ts              # Реэкспорт UserRole (lib/roles) + param-листы навигации
├─ screens/
│  ├─ WelcomeScreen.tsx     # Онбординг + выбор роли
│  ├─ CandidateSwipeScreen.tsx # Свайп (ветвление по роли)
│  ├─ ChatsScreen.tsx / ChatRoomScreen.tsx
│  ├─ ProfileScreen.tsx     # Хаб профиля (= резюме) + меню
│  ├─ ProfileSettingsScreen.tsx
│  ├─ ProfileRatingsScreen.tsx
│  └─ ProfileVacanciesScreen.tsx
├─ components/
│  ├─ profile/              # Avatar, Brick, GitProfileBlock, Finder/Recruiter body
│  ├─ swipe/                # CandidateSwipeCard, VacancySwipeCard
│  ├─ navigation/MainTabBar.tsx
│  └─ ui/GlassSurface.tsx / OutlineButton / SoftButton
├─ lib/
│  ├─ resumeCardTheme.ts    # Path A: темы карточки свайпа + JSON parse stub
│  ├─ profileTypes.ts       # FinderProfile / RecruiterProfile
│  ├─ git.ts                # FinderGit: ссылка, connection, коммиты, heatmap
│  └─ …
├─ data/
│  ├─ finderResumes.ts      # Мок-резюме finder'ов (лента свайпа recruiter'а)
│  └─ registerPresets.ts    # Стартовые значения формы регистрации по роли
├─ theme/
│  ├─ colors.ts             # Тёмная палитра (#051630 …)
│  └─ index.ts
├─ assets/                  # Логотипы, иконки
├─ supabase/migrations/     # SQL-миграции (0001_initial_schema, 0002_vcs_contributions)
└─ docs/                    # Документация (этот каталог)
```

---

## 3. Поток навигации (текущая реализация)

```
RootNavigator (native-stack, тёмная тема)
├─ Welcome            # выбор роли → navigate('Register', { role })
├─ Register           # форма → replace('Main', { role, greetingTitle, greetingSubtitle })
└─ Main (MainNavigator, bottom-tabs, кастомный таб-бар)
   ├─ CandidateSwipe  # initialRoute, лента по роли (мок)
   ├─ Chats           # ChatsNavigator
   └─ Profile         # ProfileNavigator: Hub → Settings / Ratings / Vacancies
```

- Роль и профиль прокидываются параметрами навигации и доступны через
  `useMainSession()` (`role`, `profile`, `setRole`, `setProfile`).
- Выход — в **Настройках** профиля: `reset` стека к `Welcome` (UI-выход, не
  связанный с Supabase-сессией).

---

## 4. Слой Supabase (готов, но пока в стороне от основного потока)

- `lib/supabase.ts` — ленивый клиент. Конфигурация валидна только при корректном
  `EXPO_PUBLIC_SUPABASE_URL` + **publishable**-ключе. `sb_secret_` в клиенте
  запрещён и игнорируется (см. `resolveSupabaseEnv`).
- `contexts/SupabaseAuthContext.tsx` — слушает `onAuthStateChange`, отдаёт
  `session/user/initializing`. Подключён в `App.tsx`.
- `lib/devAuth.ts` — dev-утилиты:
  - `devSignIn()` / `devSignOut()` — вход по `EXPO_PUBLIC_DEV_AUTH_*`;
  - `setAccountRole('finder'|'recruiter')` — пишет роль в `user_metadata` **и**
    upsert в таблицу `profiles`;
  - `readAccountRole(user)` — читает роль из метаданных.
- `components/dev/DevPanel.tsx` — видимая только в `__DEV__` выезжающая панель
  справа: верхние кнопки открывают мок-профили `finder` / `recruiter` (без auth,
  шаблон из `data/templateAccounts.ts`, сразу вкладка Профиль); ниже — вход/выход.

> Важно: основной навигационный поток (Welcome→Register→Main) **сейчас не завязан**
> на реальную Supabase-сессию — он работает на мок-данных и параметрах навигации.
> Supabase-слой подготовлен для последующей интеграции (auth-гейтинг, загрузка
> профилей/вакансий из БД).

---

## 5. Окружение (`.env`)

Переменные (типы — в `env.d.ts`, пример — в `.env.example`):

| Переменная | Назначение |
|-----------|-----------|
| `EXPO_PUBLIC_SUPABASE_URL` | URL проекта Supabase |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable-ключ (клиентский) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Legacy anon (deprecated, фолбэк) |
| `EXPO_PUBLIC_DEV_AUTH_EMAIL/PASSWORD` | Быстрый dev-вход в Dev-панели (локально) |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry (без DSN — события не шлются) |
| `SENTRY_AUTH_TOKEN/ORG/PROJECT` | Только для EAS Build (секреты, не в репо) |

Правила: только `EXPO_PUBLIC_*` попадает в клиент; секреты не коммитим.

---

## 6. Дизайн-система

- Тёмная палитра в `theme/colors.ts`: фон `#051630`, поверхности `#1a2b45`,
  интерактив `#243652`, текст белый/приглушённый. Навигационная тема собрана из этой
  палитры в `RootNavigator`.
- Соблюдай эти токены при добавлении экранов; не вводи хардкод-цвета мимо палитры.

---

## 7. Технический долг и важные заметки для агента

1. ✅ **Роли.** Только `finder` / `recruiter`: тип `UserRole` в `lib/roles.ts`,
   реэкспорт в навигации, enum `user_role` в БД. Других ролей нет.
2. **Свайп finder'а отсутствует.** Реализован только свайп резюме (вид recruiter'а).
   Нужен экран свайпа **вакансий** для finder'а + модель/мок вакансий. Главный
   свайп-экран должен ветвиться по роли.
3. **Персонализация резюме.** Секция Git: ссылка (GitHub/GitLab автодетект + иконка),
   опциональный contribution-грид и таблица коммитов (`FinderProfile.git`,
   `GitProfileBlock`). Реальный синк в `vcs_*` — позже.
4. **Auth-гейтинг.** Основной поток не использует Supabase-сессию для входа — при
   интеграции бэкенда добавить гейтинг по `SupabaseAuthContext` + роли.
5. **Чаты и мэтчи — мок.** `ChatsScreen` на статичных данных; модели мэтчей нет.

После любой архитектурной правки — обнови этот файл.
