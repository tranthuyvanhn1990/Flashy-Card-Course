"use client";
import { buttonVariants } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DeckStudyFooterProps = {
  deckId: string;
};

export function DeckStudyFooter({ deckId: _deckId }: DeckStudyFooterProps) {
  return (
    <CardFooter className="flex flex-col items-stretch gap-3 border-t bg-muted/30">
      <p className="text-sm text-muted-foreground">Ready to study</p>
      {/* The whole deck card is already a link; render this as non-interactive UI. */}
      <div
        className={cn(
          buttonVariants({ variant: "default", size: "default" }),
          "w-full select-none justify-center",
        )}
        data-deck-id={_deckId}
        aria-hidden="true"
      >
        Study
      </div>
    </CardFooter>
  );
}
