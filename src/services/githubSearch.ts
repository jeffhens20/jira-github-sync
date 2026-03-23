/**
 * GitHub PR Search Service
 *
 * Searches a repo's pull requests for one whose branch name or title
 * contains a given Jira issue key (e.g. "PAY-142").
 */

import { USE_MOCK_DATA } from "@/config/projects";
import type { ProjectConfig } from "@/config/projects";

export interface PrMatch {
  prNumber: number;
  prUrl: string;
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

  const { owner, repo, token } = project.github;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const keyLower = issueKey.toLowerCase();

  // Search across open and closed PRs (two fetches in parallel)
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
