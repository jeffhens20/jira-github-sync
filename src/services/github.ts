/**
 * GitHub API Service
 *
 * Fetches PR status and deployment environment data from GitHub.
 * Currently a placeholder — pipeline status comes from mock data.
 */

import { USE_MOCK_DATA } from "@/config/projects";
import type { ProjectConfig } from "@/config/projects";
import type { PipelineStage } from "@/types/pipeline";

/**
 * Determine the highest deployment stage a given PR/commit has reached.
 *
 * @param prNumber - The pull request number
 * @param project - The project config with GitHub credentials
 * @returns The highest pipeline stage reached
 */
export async function getDeploymentStage(
  prNumber: number,
  project: ProjectConfig
): Promise<PipelineStage> {
  if (USE_MOCK_DATA) {
    return "draft_pr";
  }

  const { owner, repo, token, environments } = project.github;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const prRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
    { headers }
  );

  if (!prRes.ok) {
    console.error(`GitHub PR fetch failed: ${prRes.status}`);
    return "draft_pr";
  }

  const pr = await prRes.json();

  if (pr.draft) return "draft_pr";
  if (pr.state === "open") return "review_needed";
  if (!pr.merged) return "review_needed";

  const deploymentsRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/deployments?sha=${pr.merge_commit_sha}&per_page=100`,
    { headers }
  );

  if (!deploymentsRes.ok) return "pr_merged";

  const deployments = await deploymentsRes.json();
  const envNames = deployments.map((d: any) => d.environment);

  if (envNames.includes(environments[2])) return "deployed_staging";
  if (envNames.includes(environments[1])) return "deployed_qa";
  if (envNames.includes(environments[0])) return "deployed_dev";

  return "pr_merged";
}
