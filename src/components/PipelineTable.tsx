/**
 * PipelineTable
 * 
 * The main data table showing sprint stories and their
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
  const [orderedIds, setOrderedIds] = useState<string[]>([]);

  // Sync order when stories change (new data from API)
  useEffect(() => {
    setOrderedIds(stories.map((s) => s.id));
  }, [stories]);

  // Build a lookup map for quick access
  const storyMap = useMemo(
    () => new Map(stories.map((s) => [s.id, s])),
    [stories]
  );

  // Extract unique assignee names for the filter dropdown
  const assigneeNames = useMemo(
    () => [...new Set(stories.map((s) => s.assignee.name))].sort(),
    [stories]
  );

  // Apply filters while preserving manual order
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

  /** Reorder rows on drag end */
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;

    // Reorder the filtered list, then map back to full orderedIds
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-[40px]" />
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
            <Droppable droppableId="pipeline-table">
              {(provided) => (
                <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                  {filteredStories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        No stories match your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStories.map((story, index) => (
                      <Draggable key={story.id} draggableId={story.id} index={index}>
                        {(provided, snapshot) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`
                              border-border transition-all duration-200 group
                              animate-row-enter
                              hover:bg-primary/[0.04] hover:shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.15),0_0_12px_-4px_hsl(var(--primary)/0.2)]
                              ${snapshot.isDragging
                                ? "bg-secondary shadow-[0_8px_24px_-6px_hsl(var(--primary)/0.3),inset_0_0_0_1px_hsl(var(--primary)/0.3)] scale-[1.01] z-50"
                                : ""}
                            `}
                            style={{
                              ...provided.draggableProps.style,
                              animationDelay: `${index * 40}ms`,
                            }}
                          >
                            {/* Drag handle */}
                            <TableCell className="w-[40px] px-2">
                              <div
                                {...provided.dragHandleProps}
                                className="flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                              >
                                <GripVertical className="h-4 w-4" />
                              </div>
                            </TableCell>

                            {/* Story key */}
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
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </Table>
        </DragDropContext>
      </div>

      {/* Row count */}
      <p className="text-xs text-muted-foreground tabular-nums">
        {filteredStories.length} of {stories.length} stories
      </p>
    </div>
  );
}
