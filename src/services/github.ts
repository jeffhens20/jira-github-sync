/**
 * GitHub API Service
 * 
 * Fetches PR status and deployment environment data from GitHub.
 * Currently a placeholder — pipeline status comes from mock data.
 * 
 * To enable live data:
 * 1. Set your GitHub credentials in src/config/integrations.ts
 * 2. Set USE_MOCK_DATA to false
 * 3. This service uses the GitHub Deployments API to determine
 *    which environment a commit/PR has reached.
 * 
 * GitHub Deployments API docs:
 * https://docs.github.com/en/rest/deployments/deployments
 */

import {
  USE_MOCK_DATA,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_TOKEN,
  GITHUB_ENVIRONMENTS,
} from "@/config/integrations";
import type { PipelineStage } from "@/types/pipeline";

/**
 * Determine the highest deployment stage a given PR/commit has reached.
 * 
 * Queries the GitHub Deployments API for the repo, filters by
 * the commit SHA associated with the PR, and checks which
 * environment has a successful deployment.
 * 
 * @param prNumber - The pull request number
 * @returns The highest pipeline stage reached
 */
export async function getDeploymentStage(
  prNumber: number
): Promise<PipelineStage> {
  if (USE_MOCK_DATA) {
    return "draft_pr"; // mock data already has stages set
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  // Step 1: Get the PR to find the head SHA and merge status
  const prRes = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls/${prNumber}`,
    { headers }
  );

  if (!prRes.ok) {
    console.error(`GitHub PR fetch failed: ${prRes.status}`);
    return "draft_pr";
  }

  const pr = await prRes.json();

  // Check PR state first
  if (pr.draft) return "draft_pr";
  if (pr.state === "open") return "review_needed";

  // PR is merged — now check deployments
  if (!pr.merged) return "review_needed";

  // Step 2: Fetch deployments for this repo, check environments
  const deploymentsRes = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/deployments?sha=${pr.merge_commit_sha}&per_page=100`,
    { headers }
  );

  if (!deploymentsRes.ok) return "pr_merged";

  const deployments = await deploymentsRes.json();

  // Determine highest environment reached
  const envNames = deployments.map((d: any) => d.environment);

  if (envNames.includes(GITHUB_ENVIRONMENTS.staging)) return "deployed_staging";
  if (envNames.includes(GITHUB_ENVIRONMENTS.qa)) return "deployed_qa";
  if (envNames.includes(GITHUB_ENVIRONMENTS.dev)) return "deployed_dev";

  return "pr_merged";
}
