

## Plan: Consolidate integrations.ts into projects.ts

### 1. Move `USE_MOCK_DATA` into `projects.ts`
Add the `USE_MOCK_DATA` toggle at the top of `src/config/projects.ts` with its existing comment.

### 2. Delete `integrations.ts`
Remove `src/config/integrations.ts` entirely. The single-project constants (`JIRA_BASE_URL`, `GITHUB_OWNER`, etc.) are unused — each project in the array carries its own credentials.

### 3. Update `github.ts` imports
`src/services/github.ts` imports `USE_MOCK_DATA`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_TOKEN`, and `GITHUB_ENVIRONMENTS` from `integrations.ts`. Refactor it to:
- Import `USE_MOCK_DATA` from `@/config/projects`
- Accept a `ProjectConfig` parameter (like `jira.ts` already does) instead of using global constants
- Read `owner`, `repo`, `token`, and `environments` from the project config

### 4. Update `jira.ts` import
Change the `USE_MOCK_DATA` import from `@/config/integrations` to `@/config/projects`.

### Files changed
1. `src/config/projects.ts` — add `USE_MOCK_DATA`
2. `src/config/integrations.ts` — delete
3. `src/services/github.ts` — import from projects, accept project param
4. `src/services/jira.ts` — update import path

