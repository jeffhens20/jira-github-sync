/**
 * Sprint Pipeline Dashboard
 * 
 * Main page that fetches story data and displays it in
 * two tabs: Pipeline (active) and Staging (completed).
 * Includes auto-refresh with configurable intervals.
 */

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { RefreshCw, Zap, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PipelineTable } from "@/components/PipelineTable";
import { fetchJiraStories } from "@/services/jira";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

/** Format seconds as "Xs" or "M:SS" for longer intervals */
function formatCountdown(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function Index() {
  const [intervalSeconds, setIntervalSeconds] = useState(30);

  const { data: stories, isLoading, isError, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["pipeline-stories"],
    queryFn: fetchJiraStories,
  });

  const { enabled: autoRefreshOn, setEnabled: setAutoRefresh, secondsLeft, resetCountdown } =
    useAutoRefresh({
      intervalSeconds,
      onRefresh: () => refetch(),
    });

  const handleManualRefresh = () => {
    refetch();
    resetCountdown();
  };

  // Split stories into pipeline (active) and staging
  const pipelineStories = useMemo(
    () => (stories ?? []).filter((s) => s.currentStage !== "deployed_staging"),
    [stories]
  );
  const stagingStories = useMemo(
    () => (stories ?? []).filter((s) => s.currentStage === "deployed_staging"),
    [stories]
  );

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  return (
    <div className="min-h-screen bg-background px-0 py-8 sm:px-4">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* ── Header ─────────────────────────────── */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-fade-in">
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
              <Select
                value={String(intervalSeconds)}
                onValueChange={(v) => setIntervalSeconds(Number(v))}
              >
                <SelectTrigger className="h-7 w-[80px] bg-secondary border-border text-xs tabular-nums px-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-secondary border-border">
                  <SelectItem value="30">30s</SelectItem>
                  <SelectItem value="300">5 min</SelectItem>
                  <SelectItem value="600">10 min</SelectItem>
                  <SelectItem value="1200">20 min</SelectItem>
                </SelectContent>
              </Select>
              <span
                className={`text-xs text-muted-foreground tabular-nums w-12 transition-opacity ${
                  autoRefreshOn && secondsLeft <= 5 ? "animate-pulse-lime text-primary" : ""
                }`}
              >
                {autoRefreshOn ? formatCountdown(secondsLeft) : "off"}
              </span>
            </div>

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
          <Tabs defaultValue="pipeline" className="space-y-4">
            <TabsList className="bg-secondary border border-border">
              <TabsTrigger
                value="pipeline"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm"
              >
                Pipeline ({pipelineStories.length})
              </TabsTrigger>
              <TabsTrigger
                value="staging"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm"
              >
                Staging ({stagingStories.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pipeline" className="mt-0">
              <PipelineTable stories={pipelineStories} />
            </TabsContent>

            <TabsContent value="staging" className="mt-0">
              <PipelineTable stories={stagingStories} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
