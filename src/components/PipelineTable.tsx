/**
 * PipelineTable
 * 
 * Stacked-card layout showing sprint stories and their
 * deployment pipeline progress. Supports filtering, search,
 * and drag-and-drop row reordering.
 */

import { useState, useMemo, useEffect } from "react";
import { Search, Filter, GripVertical } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
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
import { PIPELINE_STAGES, STAGE_LABELS, type PipelineStory } from "@/types/pipeline";

interface PipelineTableProps {
  stories: PipelineStory[];
}

export function PipelineTable({ stories }: PipelineTableProps) {
  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [orderedIds, setOrderedIds] = useState<string[]>([]);

  // Sync order when stories change (new data from API)
  useEffect(() => {
    setOrderedIds(stories.map((s) => s.id));
  }, [stories]);

  const storyMap = useMemo(
    () => new Map(stories.map((s) => [s.id, s])),
    [stories]
  );

  const assigneeNames = useMemo(
    () => [...new Set(stories.map((s) => s.assignee.name))].sort(),
    [stories]
  );

  const filteredStories = useMemo(() => {
    return orderedIds
      .map((id) => storyMap.get(id))
      .filter((story): story is PipelineStory => {
        if (!story) return false;
        const q = search.toLowerCase();
        if (q && !story.key.toLowerCase().includes(q) && !story.title.toLowerCase().includes(q)) {
          return false;
        }
        if (assigneeFilter !== "all" && story.assignee.name !== assigneeFilter) {
          return false;
        }
        if (stageFilter !== "all" && story.currentStage !== stageFilter) {
          return false;
        }
        return true;
      });
  }, [orderedIds, storyMap, search, assigneeFilter, stageFilter]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;

    const draggedId = filteredStories[from].id;
    const targetId = filteredStories[to].id;

    setOrderedIds((prev) => {
      const next = [...prev];
      const fromIdx = next.indexOf(draggedId);
      const toIdx = next.indexOf(targetId);
      next.splice(fromIdx, 1);
      next.splice(toIdx, 0, draggedId);
      return next;
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Filter bar ───────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search stories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground h-9"
          />
        </div>

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

      {/* ── Stacked card rows ───────────────────── */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="pipeline-table">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-col gap-2"
            >
              {filteredStories.length === 0 ? (
                <div className="rounded-xl bg-secondary/50 border border-border py-16 text-center text-muted-foreground">
                  No stories match your filters.
                </div>
              ) : (
                filteredStories.map((story, index) => (
                  <Draggable key={story.id} draggableId={story.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`
                          group flex items-center gap-3 sm:gap-4
                          rounded-xl border border-border bg-card
                          px-3 py-3 sm:px-5 sm:py-3.5
                          transition-colors duration-200
                          hover:bg-primary/[0.04]
                          hover:shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.15),0_0_16px_-4px_hsl(var(--primary)/0.2)]
                          ${snapshot.isDragging
                            ? "bg-secondary shadow-[0_8px_24px_-6px_hsl(var(--primary)/0.3),inset_0_0_0_1px_hsl(var(--primary)/0.3)] scale-[1.01] z-50"
                            : ""}
                        `}
                        style={provided.draggableProps.style}
                      >
                        {/* Drag handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors"
                        >
                          <GripVertical className="h-4 w-4" />
                        </div>

                        {/* Story key */}
                        <span className="flex-shrink-0 w-[90px] font-mono text-xs text-muted-foreground group-hover:text-primary transition-colors duration-150">
                          {story.key}
                        </span>

                        {/* Story title */}
                        <span className="flex-1 min-w-0 font-medium text-sm text-foreground/90 truncate">
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
                        </span>

                        {/* Assignee */}
                        <div className="flex-shrink-0 w-[140px] hidden sm:block">
                          <AssigneeCell assignee={story.assignee} />
                        </div>

                        {/* Pipeline status icons */}
                        <div className="flex-shrink-0">
                          <PipelineStatusIcons currentStage={story.currentStage} />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Row count */}
      <p className="text-xs text-muted-foreground tabular-nums">
        {filteredStories.length} of {stories.length} stories
      </p>
    </div>
  );
}
