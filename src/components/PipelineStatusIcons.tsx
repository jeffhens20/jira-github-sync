/**
 * PipelineStatusIcons
 * 
 * Renders a horizontal row of pipeline stage icons.
 * Each icon "lights up" (lime) when the story has reached or passed
 * that stage, and stays dim (muted) otherwise.
 * 
 * The visual creates a left-to-right progress bar effect.
 */

import {
  GitPullRequestDraft,
  Eye,
  GitMerge,
  Server,
  FlaskConical,
  Rocket,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PIPELINE_STAGES, STAGE_LABELS, type PipelineStage } from "@/types/pipeline";

/** Map each stage to its Lucide icon component */
const STAGE_ICONS: Record<PipelineStage, React.ElementType> = {
  draft_pr: GitPullRequestDraft,
  review_needed: Eye,
  pr_merged: GitMerge,
  deployed_dev: Server,
  deployed_qa: FlaskConical,
  deployed_staging: Rocket,
};

interface PipelineStatusIconsProps {
  /** The highest stage this story has reached */
  currentStage: PipelineStage;
}

export function PipelineStatusIcons({ currentStage }: PipelineStatusIconsProps) {
  // Find the index of the current stage to determine which icons are "lit"
  const currentIndex = PIPELINE_STAGES.indexOf(currentStage);

  return (
    <div className="flex items-center gap-1">
      {PIPELINE_STAGES.map((stage, i) => {
        const Icon = STAGE_ICONS[stage];
        const isReached = i <= currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <Tooltip key={stage}>
            <TooltipTrigger asChild>
              <div
                className={`
                  flex h-8 w-8 items-center justify-center rounded-md
                  transition-all duration-200
                  ${isCurrent
                    ? "bg-primary/15 text-primary"
                    : isReached
                      ? "text-primary/70"
                      : "text-muted-foreground/40"
                  }
                `}
              >
                <Icon size={16} strokeWidth={isCurrent ? 2.5 : 2} />
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="bg-secondary text-secondary-foreground border-border text-xs"
            >
              {STAGE_LABELS[stage]}
              {isCurrent && " (current)"}
            </TooltipContent>
          </Tooltip>
        );
      })}

      {/* Thin connector line underneath to visualize progress */}
      <div className="sr-only">
        Stage: {STAGE_LABELS[currentStage]}
      </div>
    </div>
  );
}
