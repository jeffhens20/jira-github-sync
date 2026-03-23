/**
 * Integration Configuration
 * 
 * This file holds all configuration variables needed to connect
 * the dashboard to Jira and GitHub APIs.
 * 
 * HOW TO USE:
 * 1. Replace the placeholder values below with your real credentials.
 * 2. Set USE_MOCK_DATA to `false` to switch from mock data to live APIs.
 * 3. For production, move sensitive tokens to environment variables
 *    and reference them via import.meta.env.VITE_*.
 * 
 * SECURITY NOTE:
 * Never commit real API tokens to version control. Use .env files
 * or a secrets manager for anything beyond local development.
 */

// ──────────────────────────────────────────────
// Global toggle: set to false when ready for live data
// ──────────────────────────────────────────────
export const USE_MOCK_DATA = true;

// ──────────────────────────────────────────────
// Jira Configuration
// ──────────────────────────────────────────────

/** Base URL of your Jira instance (Cloud or Server) */
export const JIRA_BASE_URL = import.meta.env.VITE_JIRA_BASE_URL
  ?? "https://your-org.atlassian.net";

/** The Jira project key to query stories from */
export const JIRA_PROJECT_KEY = import.meta.env.VITE_JIRA_PROJECT_KEY
  ?? "PROJ";

/**
 * Jira API token for authentication.
 * For Jira Cloud: generate at https://id.atlassian.net/manage-profile/security/api-tokens
 * Used with Basic Auth: base64(email:token)
 */
export const JIRA_API_TOKEN = import.meta.env.VITE_JIRA_API_TOKEN
  ?? "";

/** Email address associated with the Jira API token */
export const JIRA_USER_EMAIL = import.meta.env.VITE_JIRA_USER_EMAIL
  ?? "";

// ──────────────────────────────────────────────
// GitHub Configuration
// ──────────────────────────────────────────────

/** GitHub repository owner (user or organization) */
export const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER
  ?? "your-org";

/** GitHub repository name */
export const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO
  ?? "your-repo";

/**
 * GitHub Personal Access Token (classic or fine-grained).
 * Needs scopes: repo, read:org (for deployment status)
 * Generate at: https://github.com/settings/tokens
 */
export const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN
  ?? "";

/**
 * GitHub environment names that map to our pipeline stages.
 * Adjust these to match your actual GitHub environment names.
 */
export const GITHUB_ENVIRONMENTS = {
  dev: "development",
  qa: "qa",
  staging: "staging",
} as const;
