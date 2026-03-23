/**
 * Jira API Service
 *
 * Fetches stories/issues from Jira's REST API.
 * Accepts a project config to target the correct Jira instance.
 * Returns mock data when USE_MOCK_DATA is true.
 */

import { USE_MOCK_DATA } from "@/config/projects";
import { mockStoriesByProject } from "@/services/mockData";
import { findPrForIssueKey } from "@/services/githubSearch";
import { getDeploymentStage } from "@/services/github";
import type { ProjectConfig } from "@/config/projects";
import type { PipelineStory } from "@/types/pipeline";

/**
 * Fetch current sprint stories from Jira for a given project.
 *
 * @param project — project config with Jira credentials
 */
export async function fetchJiraStories(project: ProjectConfig): Promise<PipelineStory[]> {
  // ── Mock mode ──────────────────────────────
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 600));
    return mockStoriesByProject[project.id] ?? [];
  }

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

  return enriched;
}
