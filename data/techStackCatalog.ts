/**
 * Каталог технологий для T9-автокомплита стека finder'а.
 * Имена канонические (английский регистр), без дублей.
 */

export const TECH_STACK_CATALOG: readonly string[] = [
  // Languages
  'TypeScript',
  'JavaScript',
  'Python',
  'Go',
  'Rust',
  'Java',
  'Kotlin',
  'Swift',
  'C#',
  'C++',
  'C',
  'PHP',
  'Ruby',
  'Scala',
  'Dart',
  'Elixir',
  'Haskell',
  'Lua',
  'R',
  'SQL',
  'Bash',
  'Shell',
  // Frontend / UI
  'React',
  'React Native',
  'Expo',
  'Next.js',
  'Remix',
  'Vue.js',
  'Nuxt',
  'Angular',
  'Svelte',
  'SvelteKit',
  'SolidJS',
  'Astro',
  'HTML',
  'CSS',
  'Sass',
  'Tailwind CSS',
  'Styled Components',
  'Emotion',
  'Redux',
  'Zustand',
  'Jotai',
  'MobX',
  'Recoil',
  'React Query',
  'TanStack Query',
  'SWR',
  'Framer Motion',
  'Reanimated',
  'Three.js',
  'WebGL',
  'D3.js',
  'Storybook',
  'Figma',
  'Design tokens',
  'WCAG',
  // Backend
  'Node.js',
  'Express',
  'Fastify',
  'NestJS',
  'Hono',
  'Django',
  'Flask',
  'FastAPI',
  'Spring Boot',
  'ASP.NET',
  '.NET',
  'Laravel',
  'Ruby on Rails',
  'Phoenix',
  'Gin',
  'Fiber',
  'gRPC',
  'GraphQL',
  'tRPC',
  'REST',
  'WebSockets',
  'OpenAPI',
  'Swagger',
  // Mobile
  'SwiftUI',
  'UIKit',
  'Combine',
  'Jetpack Compose',
  'Coroutines',
  'Flutter',
  'Ionic',
  'Capacitor',
  // Data / DB
  'PostgreSQL',
  'MySQL',
  'MariaDB',
  'SQLite',
  'MongoDB',
  'Redis',
  'Elasticsearch',
  'OpenSearch',
  'ClickHouse',
  'Cassandra',
  'DynamoDB',
  'Firestore',
  'Prisma',
  'Drizzle',
  'TypeORM',
  'Sequelize',
  'SQLAlchemy',
  'Kafka',
  'RabbitMQ',
  'NATS',
  'Pulsar',
  'Apache Spark',
  'Airflow',
  'dbt',
  'Snowflake',
  'BigQuery',
  'DuckDB',
  // Cloud / DevOps
  'AWS',
  'GCP',
  'Azure',
  'Docker',
  'Kubernetes',
  'Helm',
  'Terraform',
  'Pulumi',
  'Ansible',
  'CI/CD',
  'GitHub Actions',
  'GitLab CI',
  'CircleCI',
  'Jenkins',
  'ArgoCD',
  'Nginx',
  'Traefik',
  'Cloudflare',
  'Vercel',
  'Netlify',
  'Railway',
  'Fly.io',
  'Serverless',
  'Lambda',
  'Cloud Functions',
  'S3',
  'CloudFront',
  'Observability',
  'Prometheus',
  'Grafana',
  'OpenTelemetry',
  'Datadog',
  'Sentry',
  'ELK',
  // AI / ML
  'Machine Learning',
  'Deep Learning',
  'NLP',
  'Computer Vision',
  'PyTorch',
  'TensorFlow',
  'Keras',
  'scikit-learn',
  'Hugging Face',
  'Transformers',
  'LangChain',
  'LlamaIndex',
  'OpenAI API',
  'Anthropic API',
  'RAG',
  'Vector DB',
  'Pinecone',
  'Weaviate',
  'pgvector',
  'MLOps',
  'CUDA',
  // Testing / QA
  'Jest',
  'Vitest',
  'Playwright',
  'Cypress',
  'Detox',
  'Testing Library',
  'Pytest',
  'JUnit',
  // Practices / other
  'Microservices',
  'Event-driven',
  'Domain-Driven Design',
  'Clean Architecture',
  'TDD',
  'Agile',
  'Scrum',
  'Git',
  'Linux',
  'Unix',
  'iOS',
  'Android',
  'macOS',
  'Windows',
  'Blockchain',
  'Solidity',
  'Web3',
  'Unity',
  'Unreal Engine',
  'Godot',
  'Blender',
  'Shopify',
  'Stripe',
  'Supabase',
  'Firebase',
  'Auth0',
  'Clerk',
  'PostHog',
  'Amplitude',
  'Segment',
] as const;

export function normalizeTechLabel(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

function selectedKeySet(selected: readonly string[]): Set<string> {
  return new Set(selected.map((s) => s.toLowerCase()));
}

/**
 * Подсказки: сначала startsWith, затем includes; уже выбранные скрыты.
 */
export function filterTechSuggestions(
  query: string,
  selected: readonly string[],
  limit = 8,
): string[] {
  const q = normalizeTechLabel(query).toLowerCase();
  if (!q) {
    return [];
  }

  const taken = selectedKeySet(selected);
  const starts: string[] = [];
  const includes: string[] = [];

  for (const tech of TECH_STACK_CATALOG) {
    if (taken.has(tech.toLowerCase())) {
      continue;
    }
    const lower = tech.toLowerCase();
    if (lower.startsWith(q)) {
      starts.push(tech);
    } else if (lower.includes(q)) {
      includes.push(tech);
    }
  }

  return [...starts, ...includes].slice(0, limit);
}

/** Каноническое имя из каталога при точном совпадении (без учёта регистра). */
export function matchCatalogTech(raw: string): string | undefined {
  const q = normalizeTechLabel(raw).toLowerCase();
  if (!q) {
    return undefined;
  }
  return TECH_STACK_CATALOG.find((tech) => tech.toLowerCase() === q);
}
