/**
 * PipelineTable
 * 
 * The main data table showing all sprint stories and their
 * deployment pipeline progress. Supports filtering by search
 * query, assignee, and pipeline stage.
 */

import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PipelineStatusIcons } from "@/components/PipelineStatusIcons";
import { AssigneeCell } from "@/components/AssigneeCell";
import { PIPELINE_STAGES, STAGE_LABELS, type PipelineStage, type PipelineStory } from "@/types/pipeline";

interface PipelineTableProps {
  stories: PipelineStory[];
}

export function PipelineTable({ stories }: PipelineTableProps) {
  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");

  // Extract unique assignee names for the filter dropdown
  const assigneeNames = useMemo(
    () => [...new Set(stories.map((s) => s.assignee.name))].sort(),
    [stories]
  );

  // Apply filters
  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      // Text search: match on story key or title
      const q = search.toLowerCase();
      if (q && !story.key.toLowerCase().includes(q) && !story.title.toLowerCase().includes(q)) {
        return false;
      }
      // Assignee filter
      if (assigneeFilter !== "all" && story.assignee.name !== assigneeFilter) {
        return false;
      }
      // Stage filter
      if (stageFilter !== "all" && story.currentStage !== stageFilter) {
        return false;
      }
      return true;
    });
  }, [stories, search, assigneeFilter, stageFilter]);

  return (
    <div className="space-y-4">
      {/* ── Filter bar ───────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search stories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground h-9"
          />
        </div>

        {/* Assignee filter */}
        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-secondary border-border h-9 text-sm">
            <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent className="bg-secondary border-border">
            <SelectItem value="all">All assignees</SelectItem>
            {assigneeNames.map((name) => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Stage filter */}
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-secondary border-border h-9 text-sm">
            <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent className="bg-secondary border-border">
            <SelectItem value="all">All stages</SelectItem>
            {PIPELINE_STAGES.map((stage) => (
              <SelectItem key={stage} value={stage}>{STAGE_LABELS[stage]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Data table ───────────────────────────── */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium text-xs uppercase tracking-wider w-[120px]">
                Key
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs uppercase tracking-wider">
                Story
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs uppercase tracking-wider w-[180px]">
                Assignee
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs uppercase tracking-wider w-[260px]">
                Pipeline
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  No stories match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredStories.map((story) => (
                <TableRow
                  key={story.id}
                  className="border-border transition-colors duration-150 hover:bg-primary/[0.03] group"
                >
                  {/* Story key — lime accent on hover */}
                  <TableCell className="font-mono text-xs text-muted-foreground group-hover:text-primary transition-colors duration-150">
                    {story.key}
                  </TableCell>

                  {/* Story title */}
                  <TableCell className="font-medium text-sm text-foreground/90">
                    {story.prUrl ? (
                      <a
                        href={story.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors duration-150 hover:underline underline-offset-2"
                      >
                        {story.title}
                      </a>
                    ) : (
                      story.title
                    )}
                  </TableCell>

                  {/* Assignee */}
                  <TableCell>
                    <AssigneeCell assignee={story.assignee} />
                  </TableCell>

                  {/* Pipeline status icons */}
                  <TableCell>
                    <PipelineStatusIcons currentStage={story.currentStage} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Row count */}
      <p className="text-xs text-muted-foreground tabular-nums">
        {filteredStories.length} of {stories.length} stories
      </p>
    </div>
  );
}
