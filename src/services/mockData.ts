/**
 * Mock Data
 * 
 * Realistic sample stories with varied pipeline states.
 * Used when USE_MOCK_DATA is true (the default).
 */

import type { PipelineStory } from "@/types/pipeline";

export const mockStories: PipelineStory[] = [
  {
    id: "1",
    key: "PROJ-142",
    title: "Add two-factor authentication flow",
    assignee: { name: "Maria Chen", avatarUrl: undefined },
    currentStage: "deployed_staging",
    prNumber: 387,
    prUrl: "https://github.com/your-org/your-repo/pull/387",
  },
  {
    id: "2",
    key: "PROJ-143",
    title: "Refactor payment webhook handler",
    assignee: { name: "Liam Okafor" },
    currentStage: "deployed_qa",
    prNumber: 391,
    prUrl: "https://github.com/your-org/your-repo/pull/391",
  },
  {
    id: "3",
    key: "PROJ-145",
    title: "Fix timezone offset in scheduling API",
    assignee: { name: "Sara Johansson" },
    currentStage: "pr_merged",
    prNumber: 394,
    prUrl: "https://github.com/your-org/your-repo/pull/394",
  },
  {
    id: "4",
    key: "PROJ-147",
    title: "Migrate legacy CSV importer to streaming parser",
    assignee: { name: "Dev Patel" },
    currentStage: "review_needed",
    prNumber: 396,
    prUrl: "https://github.com/your-org/your-repo/pull/396",
  },
  {
    id: "5",
    key: "PROJ-148",
    title: "Add rate limiting to public GraphQL endpoint",
    assignee: { name: "Ines Moreau" },
    currentStage: "draft_pr",
    prNumber: 398,
    prUrl: "https://github.com/your-org/your-repo/pull/398",
  },
  {
    id: "6",
    key: "PROJ-150",
    title: "Implement org-level permission inheritance",
    assignee: { name: "Maria Chen" },
    currentStage: "deployed_dev",
    prNumber: 401,
    prUrl: "https://github.com/your-org/your-repo/pull/401",
  },
  {
    id: "7",
    key: "PROJ-151",
    title: "Dark mode support for email templates",
    assignee: { name: "Tomás Rivera" },
    currentStage: "review_needed",
    prNumber: 403,
    prUrl: "https://github.com/your-org/your-repo/pull/403",
  },
  {
    id: "8",
    key: "PROJ-153",
    title: "Optimize image pipeline with WebP fallback",
    assignee: { name: "Liam Okafor" },
    currentStage: "deployed_staging",
    prNumber: 407,
    prUrl: "https://github.com/your-org/your-repo/pull/407",
  },
];
