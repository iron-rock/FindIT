/** Анкеты кандидатов для ленты свайпов (позже придут из API). */
export type CandidateAnketa = {
  id: string;
  displayName: string;
  headline: string;
  yearsExperience: number;
  stack: string[];
  salaryRange: string;
  locationFormat: string;
  about: string;
  highlights: string[];
};

export const candidateAnkety: CandidateAnketa[] = [
  {
    id: 'c1',
    displayName: 'Алексей Петров',
    headline: 'Senior React Native',
    yearsExperience: 5,
    stack: ['TypeScript', 'React Native', 'Expo', 'Zustand', 'REST'],
    salaryRange: 'от 260 000 ₽',
    locationFormat: 'Москва · гибрид',
    about:
      'Ведущий экран приложения набора, переезды на новые архитектуры без боли для команды. Люблю чистые переходы и предсказуемый UX.',
    highlights: ['Релизы в стор каждые 2 недели', 'Менторство джунов'],
  },
  {
    id: 'c2',
    displayName: 'Дарья Соколова',
    headline: 'Backend — Go · PostgreSQL',
    yearsExperience: 4,
    stack: ['Go', 'PostgreSQL', 'Kafka', 'Docker', 'gRPC'],
    salaryRange: 'от 280 000 ₽',
    locationFormat: 'СПб · удалёнка',
    about:
      'Проектировала биллинг и отчётность высоких нагрузок. Отвечаю за стабильность и карту сервисов вокруг платежей.',
    highlights: ['SLA 99.95% на критичном сервисе', 'OpenAPI-first'],
  },
  {
    id: 'c3',
    displayName: 'Иван Ким',
    headline: 'Full-stack · Next.js · Node',
    yearsExperience: 6,
    stack: ['Next.js', 'Node', 'Prisma', 'AWS', 'Playwright'],
    salaryRange: 'от 320 000 ₽',
    locationFormat: 'РФ · полностью удалённо',
    about:
      'Стартаповый опыт от MVP до масштабирования: чекауут, роли, админки. Приоритезация фич совместно с продуктом.',
    highlights: ['B2C e-com', 'A/B через флаг-сервис'],
  },
  {
    id: 'c4',
    displayName: 'Милана Верещагина',
    headline: 'Product designer → UI Engineer',
    yearsExperience: 3,
    stack: ['Figma', 'React', 'Framer Motion', 'Design tokens'],
    salaryRange: 'от 220 000 ₽',
    locationFormat: 'Екатеринбург · офис',
    about:
      'Сшиваю дизайн-систему и фронт: сетки, темы, доступность. Быстро довожу макеты до пиксель-перфекта в коде.',
    highlights: ['WCAG-aware компоненты', 'Storybook'],
  },
  {
    id: 'c5',
    displayName: 'Никита Орлов',
    headline: 'ML engineer · NLP',
    yearsExperience: 4,
    stack: ['Python', 'PyTorch', 'Transformers', 'FastAPI', 'K8s'],
    salaryRange: 'от 300 000 ₽',
    locationFormat: 'Москва · гибрид',
    about:
      'Специализация — поиск и ранжирование в больших коллекциях текстов. Довожу модели до продакшена с мониторингом дрейфа.',
    highlights: ['RAG-пайплайны', 'Latency < 200 мс P95'],
  },
];
