/**
 * GitHub PR Search Service
 *
 * Searches a repo's pull requests for one whose branch name or title
 * contains a given Jira issue key (e.g. "PAY-142").
 *
 * PR lists are cached per repo for 5 minutes to avoid redundant fetches
 * when enriching multiple stories from the same repository.
 */

import { USE_MOCK_DATA } from "@/config/projects";
import type { ProjectConfig } from "@/config/projects";
import { createCache } from "@/services/cache";

export interface PrMatch {
  prNumber: number;
  prUrl: string;
}

/** Cache the combined PR list per repo for 5 minutes */
const prListCache = createCache<any[]>(5 * 60 * 1000);

async function fetchPrList(project: ProjectConfig): Promise<any[]> {
  const { owner, repo, token } = project.github;
  const cacheKey = `${owner}/${repo}`;

  const cached = prListCache.get(cacheKey);
  if (cached) return cached;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const [openRes, closedRes] = await Promise.all([
    fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=100`,
      { headers }
    ),
    fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&per_page=100`,
      { headers }
    ),
  ]);

  const prs: any[] = [];
  if (openRes.ok) prs.push(...(await openRes.json()));
  if (closedRes.ok) prs.push(...(await closedRes.json()));

  prListCache.set(cacheKey, prs);
  return prs;
}

/**
 * Find the first PR whose branch name or title contains the issue key.
 * Returns null if no match is found.
 */
export async function findPrForIssueKey(
  issueKey: string,
  project: ProjectConfig
): Promise<PrMatch | null> {
  if (USE_MOCK_DATA) return null;

  const keyLower = issueKey.toLowerCase();
  const prs = await fetchPrList(project);

  const match = prs.find(
    (pr: any) =>
      pr.head.ref.toLowerCase().includes(keyLower) ||
      pr.title.toLowerCase().includes(keyLower)
  );

  if (!match) return null;

  return {
    prNumber: match.number,
    prUrl: match.html_url,
  };
}
