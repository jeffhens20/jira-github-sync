

## Plan: Tabs, Drag-and-Drop, and Visual Polish

### 1. Add `@hello-pangea/dnd` for drag-and-drop
Install `@hello-pangea/dnd` (maintained fork of `react-beautiful-dnd`) for row reordering within each tab's table.

### 2. Split stories into two tabs: "Pipeline" and "Staging"
**File: `src/pages/Index.tsx`**
- Use the existing `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` components
- Filter stories into two groups:
  - **Pipeline tab**: stories where `currentStage !== "deployed_staging"`
  - **Staging tab**: stories where `currentStage === "deployed_staging"`
- Show counts in each tab label (e.g. "Pipeline (8)" / "Staging (3)")
- Both tabs share the same filter bar and render `PipelineTable`

### 3. Make rows draggable with reorder persistence
**File: `src/components/PipelineTable.tsx`**
- Wrap `TableBody` in a `DragDropContext` + `Droppable`
- Wrap each `TableRow` in a `Draggable`
- Add a grip handle icon (`GripVertical`) as the first column
- Maintain local `orderedStories` state; update on drag end
- Add subtle drag styles: elevated shadow, slight scale, lime border highlight

### 4. Visual polish with Tailwind animations
- Add subtle `animate-in` fade on table mount
- Add hover glow effect on rows (lime `box-shadow`)
- Smooth transition on tab switch
- Pulse animation on the auto-refresh countdown when < 5s remaining

### Technical details
- **New dependency**: `@hello-pangea/dnd`
- **Files modified**: `src/pages/Index.tsx`, `src/components/PipelineTable.tsx`, `src/index.css` (add keyframes)
- The drag-and-drop reorder is local state only (resets on refresh) — appropriate for a dashboard view

