/**
 * Mock Data
 *
 * Per-project sample stories with varied pipeline states.
 * Keyed by project id from src/config/projects.ts.
 */

import type { PipelineStory } from "@/types/pipeline";

/** Mock stories keyed by project id */
export const mockStoriesByProject: Record<string, PipelineStory[]> = {
  payments: [
    {
      id: "1",
      key: "PAY-142",
      title: "Add two-factor authentication flow",
      assignee: { name: "Maria Chen", avatarUrl: undefined },
      currentStage: "deployed_staging",
      prNumber: 387,
      prUrl: "https://github.com/your-org/payments-service/pull/387",
    },
    {
      id: "2",
      key: "PAY-143",
      title: "Refactor payment webhook handler",
      assignee: { name: "Liam Okafor" },
      currentStage: "deployed_qa",
      prNumber: 391,
      prUrl: "https://github.com/your-org/payments-service/pull/391",
    },
    {
      id: "3",
      key: "PAY-145",
      title: "Fix timezone offset in scheduling API",
      assignee: { name: "Sara Johansson" },
      currentStage: "pr_merged",
      prNumber: 394,
      prUrl: "https://github.com/your-org/payments-service/pull/394",
    },
    {
      id: "4",
      key: "PAY-147",
      title: "Migrate legacy CSV importer to streaming parser",
      assignee: { name: "Dev Patel" },
      currentStage: "review_needed",
      prNumber: 396,
      prUrl: "https://github.com/your-org/payments-service/pull/396",
    },
    {
      id: "5",
      key: "PAY-148",
      title: "Add rate limiting to public GraphQL endpoint",
      assignee: { name: "Ines Moreau" },
      currentStage: "draft_pr",
      prNumber: 398,
      prUrl: "https://github.com/your-org/payments-service/pull/398",
    },
    {
      id: "6",
      key: "PAY-150",
      title: "Implement org-level permission inheritance",
      assignee: { name: "Maria Chen" },
      currentStage: "deployed_dev",
      prNumber: 401,
      prUrl: "https://github.com/your-org/payments-service/pull/401",
    },
    {
      id: "7",
      key: "PAY-151",
      title: "Dark mode support for email templates",
      assignee: { name: "Tomás Rivera" },
      currentStage: "review_needed",
      prNumber: 403,
      prUrl: "https://github.com/your-org/payments-service/pull/403",
    },
    {
      id: "8",
      key: "PAY-153",
      title: "Optimize image pipeline with WebP fallback",
      assignee: { name: "Liam Okafor" },
      currentStage: "deployed_staging",
      prNumber: 407,
      prUrl: "https://github.com/your-org/payments-service/pull/407",
    },
  ],
  platform: [
    {
      id: "p1",
      key: "PLAT-210",
      title: "Unified logging across microservices",
      assignee: { name: "Anika Sharma" },
      currentStage: "deployed_dev",
      prNumber: 512,
      prUrl: "https://github.com/your-org/platform-core/pull/512",
    },
    {
      id: "p2",
      key: "PLAT-211",
      title: "Add circuit breaker to downstream calls",
      assignee: { name: "Tomás Rivera" },
      currentStage: "review_needed",
      prNumber: 515,
      prUrl: "https://github.com/your-org/platform-core/pull/515",
    },
    {
      id: "p3",
      key: "PLAT-213",
      title: "Database connection pooling improvements",
      assignee: { name: "Liam Okafor" },
      currentStage: "pr_merged",
      prNumber: 519,
      prUrl: "https://github.com/your-org/platform-core/pull/519",
    },
    {
      id: "p4",
      key: "PLAT-215",
      title: "Migrate auth tokens to short-lived JWTs",
      assignee: { name: "Sara Johansson" },
      currentStage: "deployed_staging",
      prNumber: 523,
      prUrl: "https://github.com/your-org/platform-core/pull/523",
    },
    {
      id: "p5",
      key: "PLAT-217",
      title: "Add OpenTelemetry tracing spans",
      assignee: { name: "Dev Patel" },
      currentStage: "draft_pr",
      prNumber: 527,
      prUrl: "https://github.com/your-org/platform-core/pull/527",
    },
  ],
  mobile: [
    {
      id: "m1",
      key: "MOB-88",
      title: "Biometric login for iOS 18",
      assignee: { name: "Ines Moreau" },
      currentStage: "deployed_qa",
      prNumber: 201,
      prUrl: "https://github.com/your-org/mobile-app/pull/201",
    },
    {
      id: "m2",
      key: "MOB-90",
      title: "Offline sync for cached documents",
      assignee: { name: "Anika Sharma" },
      currentStage: "review_needed",
      prNumber: 204,
      prUrl: "https://github.com/your-org/mobile-app/pull/204",
    },
    {
      id: "m3",
      key: "MOB-91",
      title: "Push notification deep-link routing",
      assignee: { name: "Maria Chen" },
      currentStage: "deployed_staging",
      prNumber: 206,
      prUrl: "https://github.com/your-org/mobile-app/pull/206",
    },
    {
      id: "m4",
      key: "MOB-93",
      title: "Reduce cold-start time on Android",
      assignee: { name: "Tomás Rivera" },
      currentStage: "draft_pr",
      prNumber: 209,
      prUrl: "https://github.com/your-org/mobile-app/pull/209",
    },
  ],
};

/** Legacy flat export for backward compatibility */
export const mockStories = mockStoriesByProject.payments;
