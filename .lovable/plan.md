

## Plan: PR-to-Jira Linking and Live Pipeline Status

### How it works
After fetching stories from Jira, search GitHub PRs whose branch name or title contains the Jira issue key (e.g. `PAY-142`). If a matching PR is found, call `getDeploymentStage` to determine the real pipeline stage.

### Changes

**New file: `src/services/githubSearch.ts`**
- Export `findPrForIssueKey(issueKey: string, project: ProjectConfig)` that calls `GET /repos/{owner}/{repo}/pulls?state=all&per_page=100` and finds the first PR whose `head.ref` (branch name) or `title` contains the issue key
- Returns `{ prNumber, prUrl, sha } | null`

**Update: `src/services/jira.ts`**
- After mapping Jira issues to `PipelineStory[]`, run all stories through PR linking in parallel:
  - For each story, call `findPrForIssueKey(story.key, project)`
  - If a PR is found, call `getDeploymentStage(prNumber, project)` to get the real stage
  - Populate `prNumber`, `prUrl`, and `currentStage` on the story
  - If no PR found, set `currentStage` to `"draft_pr"` (no PR yet)
- Wrap in `Promise.all` for parallel execution

**Update: `src/services/github.ts`**
- No structural changes needed — `getDeploymentStage` already accepts `(prNumber, project)` and works correctly

### Files
1. `src/services/githubSearch.ts` — new, PR search by issue key
2. `src/services/jira.ts` — integrate PR linking + deployment stage lookup

