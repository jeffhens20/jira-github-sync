

## Sprint Pipeline Dashboard

A sleek, dark-themed (black + lime) table/list view showing Jira stories with their GitHub deployment pipeline status.

### Page Layout
- **Header**: App title "Sprint Pipeline" with a lime accent, last-refreshed timestamp, and a manual refresh button
- **Filter bar**: Filter by assignee, status, or search by story name
- **Main table** with columns:
  - **Story** — Jira story key + name (e.g. `PROJ-123 Add user auth`)
  - **Assignee** — Avatar + name
  - **Pipeline Status** — A row of status icons showing progression:
    - ⚪ Draft PR (gray/dim)
    - 🟡 Review Needed (yellow/lime outline)
    - 🟢 PR Merged (solid lime)
    - 🚀 Dev (lime)
    - 🧪 QA (lime)
    - 🏁 Staging (bright lime)
  - Each icon lights up (lime) when that stage is reached, stays dim otherwise — creating a visual progress pipeline per row

### Design System
- **Background**: Near-black (`#0a0a0a`)
- **Cards/rows**: Slightly lighter dark (`#141414`) with subtle lime border on hover
- **Primary accent**: Lime green (`#84cc16` / `#a3e635`)
- **Text**: White/gray hierarchy
- **Icons**: Lucide icons for each pipeline stage (e.g. `GitPullRequestDraft`, `Eye`, `GitMerge`, `Server`, `FlaskConical`, `Rocket`)

### Data & Config
- **Mock data**: Realistic sample stories with varied pipeline states, used by default
- **Config file** (`src/config/integrations.ts`): Clearly commented variables for Jira base URL, project key, GitHub owner/repo, and API tokens — all placeholder values with instructions
- **API service files** (`src/services/jira.ts`, `src/services/github.ts`): Fully commented functions for fetching data from Jira and GitHub APIs, currently returning mock data with a toggle to switch to real APIs
- **Types file** (`src/types/pipeline.ts`): TypeScript interfaces for stories, assignees, and deployment status

### Files to Create
1. `src/config/integrations.ts` — Integration config with commented placeholders
2. `src/types/pipeline.ts` — Type definitions
3. `src/services/jira.ts` — Jira API service (mock fallback)
4. `src/services/github.ts` — GitHub API service (mock fallback)
5. `src/services/mockData.ts` — Realistic mock dataset
6. `src/components/PipelineTable.tsx` — Main table component
7. `src/components/PipelineStatusIcons.tsx` — Status icon row component
8. `src/components/AssigneeCell.tsx` — Assignee avatar + name
9. `src/pages/Index.tsx` — Dashboard page with data fetching

