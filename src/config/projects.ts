/**
 * Projects Configuration
 *
 * Each project defines the display name for its tab,
 * plus Jira and GitHub credentials/settings.
 * Add or remove entries to control which project tabs appear.
 *
 * Supported environment variables (all optional, fall back to placeholders):
 *
 *   VITE_{ID}_JIRA_BASE_URL
 *   VITE_{ID}_JIRA_PROJECT_KEY
 *   VITE_{ID}_JIRA_API_TOKEN
 *   VITE_{ID}_JIRA_USER_EMAIL
 *   VITE_{ID}_GITHUB_OWNER
 *   VITE_{ID}_GITHUB_REPO
 *   VITE_{ID}_GITHUB_TOKEN
 *   VITE_{ID}_GITHUB_ENVIRONMENTS   (comma-separated)
 *
 * where {ID} is the uppercase project id (PAYMENTS, PLATFORM, MOBILE).
 */

// Global toggle: set to false when ready for live data
export const USE_MOCK_DATA = true;

/** Read a VITE_ env var with a fallback */
function env(key: string, fallback: string): string {
  return (import.meta.env[key] as string | undefined) ?? fallback;
}

function envList(key: string, fallback: string[]): string[] {
  const raw = import.meta.env[key] as string | undefined;
  return raw ? raw.split(",").map((s) => s.trim()) : fallback;
}

export interface ProjectConfig {
  /** Unique slug used as tab value and query key */
  id: string;
  /** Display name shown on the project tab */
  name: string;
  /** Jira integration settings */
  jira: {
    baseUrl: string;
    projectKey: string;
    apiToken: string;
    userEmail: string;
  };
  /** GitHub integration settings */
  github: {
    owner: string;
    repo: string;
    token: string;
    /** Ordered environment names for deployment tracking */
    environments: string[];
  };
}

/**
 * List of projects shown as tabs in the dashboard.
 * Credentials are loaded from VITE_ env vars when available.
 */
export const projects: ProjectConfig[] = [
  {
    id: "payments",
    name: "Payments",
    jira: {
      baseUrl: env("VITE_PAYMENTS_JIRA_BASE_URL", "https://your-org.atlassian.net"),
      projectKey: env("VITE_PAYMENTS_JIRA_PROJECT_KEY", "PAY"),
      apiToken: env("VITE_PAYMENTS_JIRA_API_TOKEN", "your-jira-api-token"),
      userEmail: env("VITE_PAYMENTS_JIRA_USER_EMAIL", "you@company.com"),
    },
    github: {
      owner: env("VITE_PAYMENTS_GITHUB_OWNER", "your-org"),
      repo: env("VITE_PAYMENTS_GITHUB_REPO", "payments-service"),
      token: env("VITE_PAYMENTS_GITHUB_TOKEN", "ghp_xxxxxxxxxxxx"),
      environments: envList("VITE_PAYMENTS_GITHUB_ENVIRONMENTS", ["development", "qa", "staging"]),
    },
  },
  {
    id: "platform",
    name: "Platform",
    jira: {
      baseUrl: env("VITE_PLATFORM_JIRA_BASE_URL", "https://your-org.atlassian.net"),
      projectKey: env("VITE_PLATFORM_JIRA_PROJECT_KEY", "PLAT"),
      apiToken: env("VITE_PLATFORM_JIRA_API_TOKEN", "your-jira-api-token"),
      userEmail: env("VITE_PLATFORM_JIRA_USER_EMAIL", "you@company.com"),
    },
    github: {
      owner: env("VITE_PLATFORM_GITHUB_OWNER", "your-org"),
      repo: env("VITE_PLATFORM_GITHUB_REPO", "platform-core"),
      token: env("VITE_PLATFORM_GITHUB_TOKEN", "ghp_xxxxxxxxxxxx"),
      environments: envList("VITE_PLATFORM_GITHUB_ENVIRONMENTS", ["development", "qa", "staging"]),
    },
  },
  {
    id: "mobile",
    name: "Mobile App",
    jira: {
      baseUrl: env("VITE_MOBILE_JIRA_BASE_URL", "https://your-org.atlassian.net"),
      projectKey: env("VITE_MOBILE_JIRA_PROJECT_KEY", "MOB"),
      apiToken: env("VITE_MOBILE_JIRA_API_TOKEN", "your-jira-api-token"),
      userEmail: env("VITE_MOBILE_JIRA_USER_EMAIL", "you@company.com"),
    },
    github: {
      owner: env("VITE_MOBILE_GITHUB_OWNER", "your-org"),
      repo: env("VITE_MOBILE_GITHUB_REPO", "mobile-app"),
      token: env("VITE_MOBILE_GITHUB_TOKEN", "ghp_xxxxxxxxxxxx"),
      environments: envList("VITE_MOBILE_GITHUB_ENVIRONMENTS", ["development", "qa", "staging"]),
    },
  },
];
