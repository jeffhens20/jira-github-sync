

## Plan: Fix Drag-and-Drop Row Jumping

### Root Causes
1. **`animate-row-enter` replays after drop** — The entrance animation re-triggers on every row when state updates after a drag, causing all rows to fade/slide in again.
2. **`transition-all` conflicts with dnd transforms** — The library sets inline `transform` styles during drag; `transition-all duration-200` smooths those changes incorrectly, causing visual jumps.
3. **Global dnd transition rule in `index.css`** — The `[data-rbd-draggable-context-id]` rule adds transitions that conflict with the library's positioning.

### Fixes

**`src/components/PipelineTable.tsx`**
- Remove `animate-row-enter` from draggable rows (or only apply it on initial mount via a ref flag)
- Replace `transition-all duration-200` with specific transitions that exclude `transform`: `transition-colors duration-200, transition-shadow duration-200`
- Remove the `animationDelay` style

**`src/index.css`**
- Remove the `[data-rbd-draggable-context-id]` transition rule — let the library handle its own positioning

### Files changed
1. `src/components/PipelineTable.tsx` — fix animation/transition classes
2. `src/index.css` — remove conflicting dnd transition rule

