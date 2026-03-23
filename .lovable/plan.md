

## Plan: Environment Variable Support for Project Credentials

### Approach
Update `src/config/projects.ts` to read credentials from `import.meta.env` variables, falling back to the current placeholder strings. Each project gets a prefixed set of env vars.

### Naming Convention
```text
VITE_{PROJECT_ID}_{SERVICE}_{FIELD}

Examples:
VITE_PAYMENTS_JIRA_BASE_URL
VITE_PAYMENTS_JIRA_API_TOKEN
VITE_PAYMENTS_GITHUB_TOKEN
VITE_PLATFORM_GITHUB_REPO
```

### Changes

**`src/config/projects.ts`**
- Add a helper function `env(key: string, fallback: string): string` that reads `import.meta.env[key] ?? fallback`
- Replace each hardcoded placeholder with an `env()` call using the project-specific variable name
- Add a comment block at the top documenting all supported env var names

**`.env.example`** (new file)
- List all supported `VITE_` variables with empty/placeholder values as a reference for developers

### Files
1. `src/config/projects.ts` — add env var loading
2. `.env.example` — new, documents all variables

