/**
 * Jira API Service
 * 
 * Fetches stories/issues from Jira's REST API.
 * Currently returns mock data when USE_MOCK_DATA is true.
 * 
 * To enable live data:
 * 1. Set your credentials in src/config/integrations.ts
 * 2. Set USE_MOCK_DATA to false
 * 3. Adjust the JQL query below to match your workflow
 */

import {
  USE_MOCK_DATA,
  JIRA_BASE_URL,
  JIRA_PROJECT_KEY,
  JIRA_API_TOKEN,
  JIRA_USER_EMAIL,
} from "@/config/integrations";
import { mockStories } from "@/services/mockData";
import type { PipelineStory } from "@/types/pipeline";

/**
 * Fetch current sprint stories from Jira.
 * 
 * When USE_MOCK_DATA is true, returns the mock dataset.
 * When false, calls the Jira REST API v3 search endpoint
 * with a JQL query scoped to the active sprint.
 */
export async function fetchJiraStories(): Promise<PipelineStory[]> {
  // ── Mock mode ──────────────────────────────
  if (USE_MOCK_DATA) {
    // Simulate network delay for realistic UX
    await new Promise((r) => setTimeout(r, 600));
    return mockStories;
  }

  // ── Live API call ──────────────────────────
  // Build Basic Auth header: base64(email:token)
  const authHeader = btoa(`${JIRA_USER_EMAIL}:${JIRA_API_TOKEN}`);

  // JQL: fetch issues in the current sprint, ordered by key
  const jql = `project = ${JIRA_PROJECT_KEY} AND sprint in openSprints() ORDER BY key ASC`;

  const response = await fetch(
    `${JIRA_BASE_URL}/rest/api/3/search?jql=${encodeURIComponent(jql)}&fields=summary,assignee,status`,
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

  // Map Jira issues to our PipelineStory shape.
  // NOTE: currentStage will be enriched by GitHub deployment data separately.
  return data.issues.map((issue: any) => ({
    id: issue.id,
    key: issue.key,
    title: issue.fields.summary,
    assignee: {
      name: issue.fields.assignee?.displayName ?? "Unassigned",
      avatarUrl: issue.fields.assignee?.avatarUrls?.["48x48"],
    },
    currentStage: "draft_pr" as const, // default — overridden by GitHub data
  }));
}
