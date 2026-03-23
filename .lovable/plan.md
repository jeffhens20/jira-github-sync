

## Plan: Add In-Memory Caching to GitHub and Jira Services

### Problem
Every refresh fetches the full PR list from GitHub (200 PRs across two requests) **per story**, plus individual PR detail and deployment calls. With 15 stories across 3 projects, that's potentially 90+ API calls per refresh — wasteful when most data hasn't changed.

### Approach
Add a lightweight in-memory cache module. Each service caches its results with a TTL so subsequent refreshes reuse cached data unless expired.

### Changes

**New file: `src/services/cache.ts`**
- Export a `createCache<T>(ttlMs: number)` factory that returns `{ get(key), set(key, value), invalidate(key), clear() }`
- Uses a `Map<string, { data: T; expiresAt: number }>` internally
- Simple, no dependencies

**Update: `src/services/githubSearch.ts`**
- Cache the full PR list fetch per repo (`{owner}/{repo}`) with a 5-minute TTL
- On subsequent calls for the same repo, search the cached PR list instead of re-fetching
- This collapses N×2 GitHub list requests (one per story) down to 2 requests per repo per 5 minutes

**Update: `src/services/github.ts`**
- Cache `getDeploymentStage` results per `{owner}/{repo}/{prNumber}` with a 2-minute TTL
- PR metadata and deployments don't change frequently, so short TTL is safe

**Update: `src/services/jira.ts`**
- Cache the Jira sprint query per project with a 2-minute TTL
- Only re-fetch from Jira when the cache expires; PR enrichment still runs (using its own cache)

### API call reduction
Before: ~6 calls per story per refresh (2 PR list + 1 PR detail + 1 deployments + Jira)
After: 2 PR list calls per repo per 5 min + 1 PR detail per story per 2 min + 1 Jira call per project per 2 min

### Files
1. `src/services/cache.ts` — new, generic TTL cache
2. `src/services/githubSearch.ts` — cache PR list per repo
3. `src/services/github.ts` — cache deployment stage per PR
4. `src/services/jira.ts` — cache Jira sprint query per project

