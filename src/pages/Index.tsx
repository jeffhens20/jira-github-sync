/**
 * Sprint Pipeline Dashboard
 * 
 * Main page that fetches story data on load and displays
 * the pipeline table. Includes a header with last-refreshed
 * timestamp and manual refresh button.
 */

import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Zap, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { PipelineTable } from "@/components/PipelineTable";
import { fetchJiraStories } from "@/services/jira";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

export default function Index() {
  const { data: stories, isLoading, isError, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["pipeline-stories"],
    queryFn: fetchJiraStories,
  });

  // Auto-refresh countdown (30s interval)
  const { enabled: autoRefreshOn, setEnabled: setAutoRefresh, secondsLeft, resetCountdown } =
    useAutoRefresh({
      intervalSeconds: 30,
      onRefresh: () => refetch(),
    });

  // Manual refresh resets the countdown too
  const handleManualRefresh = () => {
    refetch();
    resetCountdown();
  };

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* ── Header ─────────────────────────────── */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Zap className="h-5 w-5 text-primary" fill="currentColor" />
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Sprint Pipeline
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Story progress across PR &amp; deployment stages
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Auto-refresh toggle with countdown */}
            <div className="flex items-center gap-2">
              <Timer className="h-3.5 w-3.5 text-muted-foreground" />
              <Switch
                checked={autoRefreshOn}
                onCheckedChange={setAutoRefresh}
                className="data-[state=checked]:bg-primary"
              />
              <span className="text-xs text-muted-foreground tabular-nums w-8">
                {autoRefreshOn ? `${secondsLeft}s` : "off"}
              </span>
            </div>

            {/* Separator dot */}
            <div className="h-4 w-px bg-border" />

            {lastUpdated && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {lastUpdated}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              className="gap-1.5 border-border bg-secondary text-foreground hover:bg-primary/10 hover:text-primary active:scale-[0.97] transition-all duration-150"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        </header>

        {/* ── Content ────────────────────────────── */}
        {isLoading ? (
          <div className="space-y-3">
            {/* Skeleton rows while loading */}
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg bg-secondary" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive">
              Failed to load stories: {(error as Error).message}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-3 border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              Retry
            </Button>
          </div>
        ) : (
          <PipelineTable stories={stories ?? []} />
        )}
      </div>
    </div>
  );
}
