/**
 * Sprint Pipeline Dashboard
 *
 * Fetches story data per project and displays it in
 * Pipeline / Staging tabs with a project selector row.
 */

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { RefreshCw, Timer, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PipelineTable } from "@/components/PipelineTable";
import { fetchJiraStories } from "@/services/jira";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { projects } from "@/config/projects";
import { useAutoCycle } from "@/hooks/useAutoCycle";

/** Format seconds as "Xs" or "M:SS" */
function formatCountdown(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function Index() {
  const [intervalSeconds, setIntervalSeconds] = useState(30);
  const [activeProject, setActiveProject] = useState(projects[0].id);

  const selectedProject = projects.find((p) => p.id === activeProject) ?? projects[0];

  const { data: stories, isLoading, isError, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["pipeline-stories", activeProject],
    queryFn: () => fetchJiraStories(selectedProject),
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
    <div className="min-h-screen bg-background px-0 py-6 sm:px-4">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* ── Controls row ───────────────────────── */}
        <header className="flex items-center justify-end gap-4 animate-fade-in px-2 sm:px-0">
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
          <Tabs defaultValue="pipeline" className="space-y-3">
            {/* Pipeline / Staging tabs */}
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

            {/* Project sub-tabs */}
            <div className="flex items-center gap-1 px-1">
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => setActiveProject(proj.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 active:scale-[0.97] ${
                    activeProject === proj.id
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent"
                  }`}
                >
                  {proj.name}
                </button>
              ))}
            </div>

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
