import type { FinderGit, GitCommit, GitContributionDay, VcsProvider } from '../lib/git';
import { parseGitProfileUrl } from '../lib/git';

const MOCK_COMMITS: GitCommit[] = [
  {
    id: 'c1',
    repo: 'findit-app',
    message: 'feat: swipe feed for finder vacancies',
    sha: 'a3f91c2',
    committedAt: '2026-08-21T14:12:00.000Z',
  },
  {
    id: 'c2',
    repo: 'findit-app',
    message: 'fix: tab bar rubber-band at edges',
    sha: '9b10d44',
    committedAt: '2026-08-18T09:40:00.000Z',
  },
  {
    id: 'c3',
    repo: 'rn-kit',
    message: 'chore: bump Expo SDK 54',
    sha: 'c81e0ab',
    committedAt: '2026-08-12T16:05:00.000Z',
  },
  {
    id: 'c4',
    repo: 'findit-app',
    message: 'feat: LinkedIn-style profile bricks',
    sha: 'e2d47f1',
    committedAt: '2026-08-04T11:22:00.000Z',
  },
  {
    id: 'c5',
    repo: 'infra',
    message: 'ci: cache native builds',
    sha: '7aa12e8',
    committedAt: '2026-07-28T08:15:00.000Z',
  },
];

const CONTRIBUTION_WEEKS = 20;

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function startOfWeekSunday(date: Date): Date {
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  next.setUTCDate(next.getUTCDate() - next.getUTCDay());
  return next;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function buildMockContributions(seed: string, weeks = CONTRIBUTION_WEEKS): GitContributionDay[] {
  const rand = mulberry32(hashSeed(seed));
  const end = startOfWeekSunday(new Date());
  end.setUTCDate(end.getUTCDate() + 6);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (weeks * 7 - 1));

  const days: GitContributionDay[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const roll = rand();
    let count = 0;
    if (roll > 0.42) {
      count = 1 + Math.floor(rand() * 4);
    }
    if (roll > 0.82) {
      count += 3 + Math.floor(rand() * 6);
    }
    days.push({ date: toIsoDate(cursor), count });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export function buildMockCommits(username: string, provider: VcsProvider): GitCommit[] {
  const host = provider === 'gitlab' ? 'gitlab.com' : 'github.com';
  return MOCK_COMMITS.map((commit) => ({
    ...commit,
    id: `${provider}-${commit.id}`,
    url: `https://${host}/${username}/${commit.repo}/commit/${commit.sha}`,
  }));
}

/** Мок-кэш коммитов/грида по ссылке (пока нет VCS API). */
export function ensureMockActivity(git: FinderGit): FinderGit {
  const parsed = parseGitProfileUrl(git.profileUrl ?? '');
  const username = parsed.username || 'alexey-petrov';
  const provider = parsed.provider ?? 'github';
  const seed = `${provider}:${username}`;

  return {
    ...git,
    commits: buildMockCommits(username, provider),
    contributions: buildMockContributions(seed),
  };
}

export function templateFinderGit(): FinderGit {
  return ensureMockActivity({
    profileUrl: 'github.com/alexey-petrov',
    showGrid: true,
    commits: [],
    contributions: [],
  });
}
