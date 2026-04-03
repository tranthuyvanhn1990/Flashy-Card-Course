"use client";

import Link from "next/link";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const studyControlClassName =
  "inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium whitespace-nowrap transition-all hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

export function DeskStudyButton({
  deskId,
  hasCards,
}: {
  deskId: string;
  hasCards: boolean;
}) {
  if (hasCards) {
    return (
      <Link href={`/desks/${deskId}/study`} className={studyControlClassName}>
        Study
      </Link>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        delay={200}
        className="inline-flex rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        render={<span className="inline-flex" />}
      >
        <span
          className={`${studyControlClassName} cursor-not-allowed opacity-50 hover:bg-background`}
          aria-disabled="true"
        >
          Study
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        You have to create cards first
      </TooltipContent>
    </Tooltip>
  );
}
