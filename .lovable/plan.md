

## Plan: Multi-Project Tabs and Header Cleanup

### 1. Remove header title and subtitle
Remove the "Sprint Pipeline" heading, the Zap icon, and the subtitle line from `Index.tsx`. Keep only the right-side controls (auto-refresh, timestamp, refresh button).

### 2. Create a projects configuration file
**New file: `src/config/projects.ts`**

Define an array of project configs, each containing:
- `id` — unique slug (used as tab value)
- `name` — display name for the tab
- `jira` — `{ baseUrl, projectKey, apiToken, userEmail }`
- `github` — `{ owner, repo, token, environments }`

Provide 2-3 mock projects with placeholder values. The existing single-project config in `integrations.ts` will remain for reference but the app will use the new projects array.

### 3. Generate per-project mock data
**Update: `src/services/mockData.ts`**

Export a `Record<string, PipelineStory[]>` keyed by project id, with different story keys/titles per project so tabs feel distinct.

### 4. Update data fetching to accept a project config
**Update: `src/services/jira.ts`**

Change `fetchJiraStories` to accept a project config parameter so it uses the correct Jira/GitHub credentials per project. In mock mode, return the corresponding mock dataset.

### 5. Add project sub-tabs in Index.tsx
**Update: `src/pages/Index.tsx`**

- Add state for `activeProject` (defaults to first project)
- Render a second row of tabs beneath the Pipeline/Staging tabs for project selection
- Pass the selected project to the query (include project id in `queryKey`)
- Filter stories into pipeline/staging as before

### Files changed
1. `src/config/projects.ts` — new
2. `src/services/mockData.ts` — keyed by project
3. `src/services/jira.ts` — accept project param
4. `src/pages/Index.tsx` — remove header text, add project tabs

