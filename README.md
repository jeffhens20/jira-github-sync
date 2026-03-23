# Sprint Pipeline Dashboard

A real-time deployment pipeline dashboard that tracks Jira stories through your GitHub CI/CD workflow — from draft PR to staging deployment.

## Quick Start

```bash
# Install dependencies
npm install

# Run with mock data (default)
npm run dev
```

The app launches in **mock mode** by default — no external accounts needed. To connect to live Jira and GitHub data, follow the integration guide below.

---

## How It Works

### PR-to-Jira Linking

The dashboard automatically associates Jira stories with GitHub pull requests by searching for the **Jira issue key** (e.g. `PAY-142`) in:

1. The PR **branch name** (e.g. `feature/PAY-142-add-refunds`)
2. The PR **title** (e.g. `PAY-142: Add refund endpoint`)

If a match is found, the dashboard fetches the PR's status and deployment history to determine the story's pipeline stage.

### Pipeline Stage Detection

Once a PR is linked, its stage is derived from GitHub data:

| Condition | Stage |
|-----------|-------|
| PR is a draft | Draft PR |
| PR is open (not draft) | Review Needed |
| PR is closed but not merged | Review Needed |
| PR is merged, no deployments | PR Merged |
| Merged + deployed to 1st environment | Dev |
| Merged + deployed to 2nd environment | QA |
| Merged + deployed to 3rd environment | Staging |

The three deployment environments are configurable per project via `VITE_{ID}_GITHUB_ENVIRONMENTS`.

### Caching

API results are cached in-memory to reduce redundant calls:

| Data | TTL | Notes |
|------|-----|-------|
| GitHub PR list (per repo) | 5 min | Shared across all stories in the same repo |
| Deployment stage (per PR) | 2 min | Individual PR status + deployments |
| Jira sprint query (per project) | 2 min | Full enriched story list |

On a typical dashboard with 15 stories across 3 projects, this reduces API calls from ~90+ per refresh to a handful every few minutes.

---

## Integrations Setup

The dashboard pulls data from two services per project:

| Service | What it provides |
|---------|-----------------|
| **Jira** | Sprint stories, assignees, issue keys |
| **GitHub** | PR status, merge state, deployment environments |

### 1. Create a `.env` file

Copy the example and fill in your values:

```bash
cp .env.example .env
```

### 2. Get Jira credentials

1. Log in to [Atlassian](https://id.atlassian.com)
2. Go to **Account Settings → Security → API tokens → Create API token**
3. Copy the token — you'll need it for `VITE_*_JIRA_API_TOKEN`

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_{ID}_JIRA_BASE_URL` | Your Atlassian instance URL | `https://acme.atlassian.net` |
| `VITE_{ID}_JIRA_PROJECT_KEY` | The Jira project key | `PAY` |
| `VITE_{ID}_JIRA_API_TOKEN` | API token from step 2 | `ABCdef123...` |
| `VITE_{ID}_JIRA_USER_EMAIL` | Email tied to the API token | `dev@acme.com` |

### 3. Get GitHub credentials

1. Go to [GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens](https://github.com/settings/tokens?type=beta)
2. Create a new token with these **repository permissions**:
   - **Pull requests** — Read
   - **Deployments** — Read
   - **Environments** — Read
3. Scope the token to the specific repositories you need

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_{ID}_GITHUB_OWNER` | Repository owner (org or user) | `acme-corp` |
| `VITE_{ID}_GITHUB_REPO` | Repository name | `payments-service` |
| `VITE_{ID}_GITHUB_TOKEN` | Fine-grained PAT from step 2 | `github_pat_...` |
| `VITE_{ID}_GITHUB_ENVIRONMENTS` | Comma-separated environment names | `development,qa,staging` |

### 4. Switch to live data

In `src/config/projects.ts`, change:

```ts
export const USE_MOCK_DATA = false;
```

---

## Environment Variable Naming

Each project uses a unique `{ID}` prefix derived from its `id` field in `src/config/projects.ts` (uppercased):

| Project ID | Prefix | Example variable |
|-----------|--------|-----------------|
| `payments` | `VITE_PAYMENTS_` | `VITE_PAYMENTS_GITHUB_TOKEN` |
| `platform` | `VITE_PLATFORM_` | `VITE_PLATFORM_JIRA_API_TOKEN` |
| `mobile` | `VITE_MOBILE_` | `VITE_MOBILE_GITHUB_REPO` |

All variables are optional — missing values fall back to placeholder strings.

---

## Adding a New Project

1. Open `src/config/projects.ts`
2. Add a new entry to the `projects` array:

```ts
{
  id: "billing",
  name: "Billing",
  jira: {
    baseUrl: env("VITE_BILLING_JIRA_BASE_URL", "https://your-org.atlassian.net"),
    projectKey: env("VITE_BILLING_JIRA_PROJECT_KEY", "BILL"),
    apiToken: env("VITE_BILLING_JIRA_API_TOKEN", "your-jira-api-token"),
    userEmail: env("VITE_BILLING_JIRA_USER_EMAIL", "you@company.com"),
  },
  github: {
    owner: env("VITE_BILLING_GITHUB_OWNER", "your-org"),
    repo: env("VITE_BILLING_GITHUB_REPO", "billing-service"),
    token: env("VITE_BILLING_GITHUB_TOKEN", "ghp_xxxxxxxxxxxx"),
    environments: envList("VITE_BILLING_GITHUB_ENVIRONMENTS", ["development", "qa", "staging"]),
  },
},
```

3. Add corresponding `VITE_BILLING_*` variables to your `.env` file
4. If using mock data, add a matching entry in `src/services/mockData.ts`

---

## Pipeline Stages

Stories progress through these stages left-to-right:

```
Draft PR → Review Needed → PR Merged → Dev → QA → Staging
```

The dashboard auto-detects each story's current stage by checking GitHub PR status and deployment history against the configured environments.

---

## Dashboard Features

- **Project tabs** — switch between multiple Jira/GitHub project pairs
- **Pipeline / Staging views** — separate tabs for in-progress and staged stories
- **Auto-refresh** — configurable polling interval (default 15 min)
- **Auto-cycle** — automatically rotate through project tabs
- **Drag-and-drop** — reorder rows within each view
- **Search & filter** — filter by assignee, pipeline stage, or free text

---

## Architecture

```
src/
├── config/
│   └── projects.ts          # Project configs, env var loading, USE_MOCK_DATA toggle
├── services/
│   ├── cache.ts              # Generic in-memory TTL cache
│   ├── jira.ts               # Jira API — fetches sprint stories, enriches with PR data
│   ├── github.ts             # GitHub API — PR status and deployment stage detection
│   ├── githubSearch.ts       # GitHub PR search — links PRs to Jira keys
│   └── mockData.ts           # Mock data for development
├── types/
│   └── pipeline.ts           # PipelineStage, PipelineStory, Assignee types
└── components/
    ├── PipelineTable.tsx      # Main table with drag-and-drop
    ├── PipelineStatusIcons.tsx # Stage indicator icons
    └── AssigneeCell.tsx       # Avatar + name cell
```

## Tech Stack

- **React** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui**
- **TanStack Query** — data fetching and cache management
- **@hello-pangea/dnd** — drag-and-drop
- **Recharts** — charts (if applicable)
