/**
 * Projects Configuration
 *
 * Each project defines the display name for its tab,
 * plus Jira and GitHub credentials/settings.
 * Add or remove entries to control which project tabs appear.
 */

// Global toggle: set to false when ready for live data
export const USE_MOCK_DATA = true;

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
 * Replace placeholder values with real credentials to go live.
 */
export const projects: ProjectConfig[] = [
  {
    id: "payments",
    name: "Payments",
    jira: {
      baseUrl: "https://your-org.atlassian.net",
      projectKey: "PAY",
      apiToken: "your-jira-api-token",
      userEmail: "you@company.com",
    },
    github: {
      owner: "your-org",
      repo: "payments-service",
      token: "ghp_xxxxxxxxxxxx",
      environments: ["development", "qa", "staging"],
    },
  },
  {
    id: "platform",
    name: "Platform",
    jira: {
      baseUrl: "https://your-org.atlassian.net",
      projectKey: "PLAT",
      apiToken: "your-jira-api-token",
      userEmail: "you@company.com",
    },
    github: {
      owner: "your-org",
      repo: "platform-core",
      token: "ghp_xxxxxxxxxxxx",
      environments: ["development", "qa", "staging"],
    },
  },
  {
    id: "mobile",
    name: "Mobile App",
    jira: {
      baseUrl: "https://your-org.atlassian.net",
      projectKey: "MOB",
      apiToken: "your-jira-api-token",
      userEmail: "you@company.com",
    },
    github: {
      owner: "your-org",
      repo: "mobile-app",
      token: "ghp_xxxxxxxxxxxx",
      environments: ["development", "qa", "staging"],
    },
  },
];
