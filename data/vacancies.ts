/** Вакансии для ленты свайпов finder (позже придут из API). */
export type Vacancy = {
  id: string;
  title: string;
  company: string;
  grade: string;
  stack: string[];
  salaryRange: string;
  locationFormat: string;
  about: string;
  highlights: string[];
};

export const vacancies: Vacancy[] = [
  {
    id: 'v1',
    title: 'Senior React Native Developer',
    company: 'НейроСофт',
    grade: 'Senior',
    stack: ['TypeScript', 'React Native', 'Expo', 'GraphQL'],
    salaryRange: '280 000 – 350 000 ₽',
    locationFormat: 'Москва · гибрид',
    about:
      'Продуктовая команда мобильного банка. Релизы каждые 2 недели, сильный дизайн и автотесты.',
    highlights: ['FinTech', 'Команда 8 мобильных разработчиков'],
  },
  {
    id: 'v2',
    title: 'Backend Engineer (Go)',
    company: 'CloudPay',
    grade: 'Middle+',
    stack: ['Go', 'PostgreSQL', 'Kafka', 'Kubernetes'],
    salaryRange: '300 000 – 380 000 ₽',
    locationFormat: 'СПб · удалёнка',
    about:
      'Платёжный шлюз с высокой нагрузкой. Ищем инженера для биллинга и отчётности.',
    highlights: ['Highload', 'On-call ротация'],
  },
  {
    id: 'v3',
    title: 'Full-stack · Next.js',
    company: 'MarketPulse',
    grade: 'Middle',
    stack: ['Next.js', 'Node.js', 'Prisma', 'AWS'],
    salaryRange: '250 000 – 320 000 ₽',
    locationFormat: 'РФ · полностью удалённо',
    about:
      'B2C маркетплейс. Быстрый рост, нужен человек на чекаут и личный кабинет.',
    highlights: ['E-commerce', 'A/B тесты'],
  },
  {
    id: 'v4',
    title: 'Product Designer → UI Engineer',
    company: 'DesignFlow',
    grade: 'Middle',
    stack: ['Figma', 'React', 'Framer Motion', 'Design tokens'],
    salaryRange: '220 000 – 280 000 ₽',
    locationFormat: 'Екатеринбург · офис',
    about:
      'Сшиваем дизайн-систему и фронт. Нужен человек, который доводит макеты до кода.',
    highlights: ['Design system', 'Accessibility'],
  },
  {
    id: 'v5',
    title: 'DevOps / Platform Engineer',
    company: 'DataForge',
    grade: 'Senior',
    stack: ['Terraform', 'AWS', 'GitLab CI', 'Observability'],
    salaryRange: '320 000 – 400 000 ₽',
    locationFormat: 'Москва · гибрид',
    about:
      'Платформа для ML-пайплайнов. Строим self-service для команд разработки.',
    highlights: ['ML infra', 'GitLab'],
  },
];
