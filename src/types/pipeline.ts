/**
 * Pipeline Types
 * 
 * Core type definitions for the Sprint Pipeline dashboard.
 * These types model the data flowing from Jira (stories/assignees)
 * and GitHub (PR status, deployment environments).
 */

/** Possible stages in the deployment pipeline */
export type PipelineStage =
  | "draft_pr"       // PR created but marked as draft
  | "review_needed"  // PR open and awaiting review
  | "pr_merged"      // PR has been merged into main
  | "deployed_dev"   // Deployed to the dev environment
  | "deployed_qa"    // Deployed to QA for testing
  | "deployed_staging"; // Deployed to staging (pre-production)

/** All pipeline stages in order, used for rendering the icon row */
export const PIPELINE_STAGES: PipelineStage[] = [
  "draft_pr",
  "review_needed",
  "pr_merged",
  "deployed_dev",
  "deployed_qa",
  "deployed_staging",
];

/** Human-readable labels for each stage */
export const STAGE_LABELS: Record<PipelineStage, string> = {
  draft_pr: "Draft PR",
  review_needed: "Review Needed",
  pr_merged: "PR Merged",
  deployed_dev: "Dev",
  deployed_qa: "QA",
  deployed_staging: "Staging",
};

/** A person assigned to a story */
export interface Assignee {
  /** Display name, e.g. "Maria Chen" */
  name: string;
  /** URL to their avatar image (optional — falls back to initials) */
  avatarUrl?: string;
}

/** A single story/ticket with its pipeline progress */
export interface PipelineStory {
  /** Unique identifier — typically the Jira issue key, e.g. "PROJ-142" */
  id: string;
  /** Jira issue key displayed in the UI */
  key: string;
  /** Story title / summary */
  title: string;
  /** Person assigned to this story */
  assignee: Assignee;
  /** 
   * The *current* (highest reached) pipeline stage.
   * All prior stages are considered completed.
   */
  currentStage: PipelineStage;
  /** GitHub PR number, if one exists */
  prNumber?: number;
  /** GitHub PR URL for quick linking */
  prUrl?: string;
}
