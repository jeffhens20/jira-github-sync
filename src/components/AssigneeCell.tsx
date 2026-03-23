/**
 * AssigneeCell
 * 
 * Displays an assignee's avatar (or styled initials fallback)
 * alongside their name. Used within table rows.
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Assignee } from "@/types/pipeline";

interface AssigneeCellProps {
  assignee: Assignee;
}

/** Extract up to 2 initials from a name, e.g. "Maria Chen" → "MC" */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AssigneeCell({ assignee }: AssigneeCellProps) {
  return (
    <div className="flex items-center gap-2.5">
      <Avatar className="h-7 w-7 text-xs">
        {assignee.avatarUrl && (
          <AvatarImage src={assignee.avatarUrl} alt={assignee.name} />
        )}
        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
          {getInitials(assignee.name)}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm text-foreground/80">{assignee.name}</span>
    </div>
  );
}
