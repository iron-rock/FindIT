import type { VcsProvider } from './database.types';

export type { VcsProvider };

/** Строка таблицы последних коммитов в профиле. */
export type GitCommit = {
  id: string;
  repo: string;
  message: string;
  sha: string;
  committedAt: string;
  url?: string;
};

/** Один день contribution-грида (как GitHub heatmap). */
export type GitContributionDay = {
  date: string;
  count: number;
};

/**
 * Git finder'а: ссылка обязательна для блока.
 * Провайдер (GitHub / GitLab) определяется по URL.
 * `showGrid` — показывать heatmap и таблицу коммитов в резюме.
 */
export type FinderGit = {
  profileUrl?: string;
  showGrid?: boolean;
  commits: GitCommit[];
  contributions: GitContributionDay[];
};

export function emptyGit(): FinderGit {
  return { commits: [], contributions: [] };
}

/** Нормализация git-блока, включая устаревшие gitlabUrl / connection. */
export function gitFromFinder(profile: {
  git?: FinderGit & { connection?: { username?: string } };
  gitlabUrl?: string;
}): FinderGit {
  if (profile.git) {
    return {
      profileUrl: profile.git.profileUrl,
      showGrid: profile.git.showGrid ?? Boolean(profile.git.connection?.username),
      commits: profile.git.commits ?? [],
      contributions: profile.git.contributions ?? [],
    };
  }
  if (profile.gitlabUrl?.trim()) {
    return { ...emptyGit(), profileUrl: profile.gitlabUrl.trim() };
  }
  return emptyGit();
}

export function parseGitProfileUrl(raw: string): {
  provider: VcsProvider | null;
  username: string;
  normalized: string;
} {
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!trimmed) {
    return { provider: null, username: '', normalized: '' };
  }

  const withoutProtocol = trimmed.replace(/^https?:\/\/(www\.)?/i, '');
  const gitlab = withoutProtocol.match(/^gitlab\.com\/([A-Za-z0-9_.-]+)/i);
  const githubHost = withoutProtocol.match(/^github\.com\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)/i);
  const githubBare = withoutProtocol.match(
    /^([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)$/i,
  );

  if (gitlab) {
    const username = gitlab[1];
    return { provider: 'gitlab', username, normalized: `gitlab.com/${username}` };
  }
  if (githubHost) {
    const username = githubHost[1];
    return { provider: 'github', username, normalized: `github.com/${username}` };
  }
  if (githubBare) {
    const username = githubBare[1];
    return { provider: 'github', username, normalized: `github.com/${username}` };
  }

  return { provider: null, username: '', normalized: withoutProtocol };
}

export function gitProvider(git: FinderGit): VcsProvider | null {
  return parseGitProfileUrl(git.profileUrl ?? '').provider;
}

export function gitDisplayHandle(git: FinderGit): string | undefined {
  const parsed = parseGitProfileUrl(git.profileUrl ?? '');
  return parsed.username || undefined;
}

export function gitDisplayUrl(git: FinderGit): string | undefined {
  const url = git.profileUrl?.trim();
  if (!url) {
    return undefined;
  }
  return parseGitProfileUrl(url).normalized || url;
}
