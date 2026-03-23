/**
 * Jira API Service
 *
 * Fetches stories/issues from Jira's REST API.
 * Results are cached per project for 2 minutes.
 * Returns mock data when USE_MOCK_DATA is true.
 */

import { USE_MOCK_DATA } from "@/config/projects";
import { mockStoriesByProject } from "@/services/mockData";
import { findPrForIssueKey } from "@/services/githubSearch";
import { getDeploymentStage } from "@/services/github";
import { createCache } from "@/services/cache";
import type { ProjectConfig } from "@/config/projects";
import type { PipelineStory } from "@/types/pipeline";

/** Cache enriched stories per project for 2 minutes */
const storiesCache = createCache<PipelineStory[]>(2 * 60 * 1000);

/**
 * Fetch current sprint stories from Jira for a given project.
 */
export async function fetchJiraStories(project: ProjectConfig): Promise<PipelineStory[]> {
  // ── Mock mode ──────────────────────────────
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 600));
    return mockStoriesByProject[project.id] ?? [];
  }

  // ── Check cache ────────────────────────────
  const cached = storiesCache.get(project.id);
  if (cached) return cached;

  // ── Live API call ──────────────────────────
  const { baseUrl, projectKey, apiToken, userEmail } = project.jira;
  const authHeader = btoa(`${userEmail}:${apiToken}`);
  const jql = `project = ${projectKey} AND sprint in openSprints() ORDER BY key ASC`;

  const response = await fetch(
    `${baseUrl}/rest/api/3/search?jql=${encodeURIComponent(jql)}&fields=summary,assignee,status`,
    {
      headers: {
        Authorization: `Basic ${authHeader}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Jira API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  const stories: PipelineStory[] = data.issues.map((issue: any) => ({
    id: issue.id,
    key: issue.key,
    title: issue.fields.summary,
    assignee: {
      name: issue.fields.assignee?.displayName ?? "Unassigned",
      avatarUrl: issue.fields.assignee?.avatarUrls?.["48x48"],
    },
    currentStage: "draft_pr" as const,
  }));

  // ── Link PRs and derive real pipeline stages ──
  const enriched = await Promise.all(
    stories.map(async (story) => {
      const prMatch = await findPrForIssueKey(story.key, project);
      if (!prMatch) return story;

      const currentStage = await getDeploymentStage(prMatch.prNumber, project);
      return {
        ...story,
        prNumber: prMatch.prNumber,
        prUrl: prMatch.prUrl,
        currentStage,
      };
    })
  );

  storiesCache.set(project.id, enriched);
  return enriched;
}
