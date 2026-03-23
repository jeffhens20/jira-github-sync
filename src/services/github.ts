/**
 * GitHub API Service
 *
 * Fetches PR status and deployment environment data from GitHub.
 * Results are cached per PR for 2 minutes to reduce API calls.
 */

import { USE_MOCK_DATA } from "@/config/projects";
import type { ProjectConfig } from "@/config/projects";
import type { PipelineStage } from "@/types/pipeline";
import { createCache } from "@/services/cache";

/** Cache deployment stage per PR for 2 minutes */
const stageCache = createCache<PipelineStage>(2 * 60 * 1000);

/**
 * Determine the highest deployment stage a given PR/commit has reached.
 */
export async function getDeploymentStage(
  prNumber: number,
  project: ProjectConfig
): Promise<PipelineStage> {
  if (USE_MOCK_DATA) {
    return "draft_pr";
  }

  const { owner, repo, token, environments } = project.github;
  const cacheKey = `${owner}/${repo}/${prNumber}`;

  const cached = stageCache.get(cacheKey);
  if (cached) return cached;

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

  let stage: PipelineStage;

  if (pr.draft) {
    stage = "draft_pr";
  } else if (pr.state === "open") {
    stage = "review_needed";
  } else if (!pr.merged) {
    stage = "review_needed";
  } else {
    const deploymentsRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/deployments?sha=${pr.merge_commit_sha}&per_page=100`,
      { headers }
    );

    if (!deploymentsRes.ok) {
      stage = "pr_merged";
    } else {
      const deployments = await deploymentsRes.json();
      const envNames = deployments.map((d: any) => d.environment);

      if (envNames.includes(environments[2])) stage = "deployed_staging";
      else if (envNames.includes(environments[1])) stage = "deployed_qa";
      else if (envNames.includes(environments[0])) stage = "deployed_dev";
      else stage = "pr_merged";
    }
  }

  stageCache.set(cacheKey, stage);
  return stage;
}
