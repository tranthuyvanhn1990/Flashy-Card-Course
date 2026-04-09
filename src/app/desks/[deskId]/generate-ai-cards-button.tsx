"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ComponentProps, useTransition } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { toast } from "sonner";

import { generateAiCardsAction } from "./actions";

type GenerateAiCardsButtonProps = {
  deckId: string;
  canGenerateAiCards: boolean;
  hasRequiredDeckDetails: boolean;
  triggerLabel?: string;
  triggerVariant?: ComponentProps<typeof Button>["variant"];
};

export function GenerateAiCardsButton({
  deckId,
  canGenerateAiCards,
  hasRequiredDeckDetails,
  triggerLabel = "Generate cards with AI",
  triggerVariant = "secondary",
}: GenerateAiCardsButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!canGenerateAiCards) {
    return (
      <Tooltip>
        <TooltipTrigger
          delay={200}
          render={(props) => (
            <Link
              {...props}
              href="/pricing"
              className={cn(buttonVariants({ variant: triggerVariant }))}
            >
              {triggerLabel}
            </Link>
          )}
        />
        <TooltipContent>
          AI generation is a paid feature. Click to view pricing.
        </TooltipContent>
      </Tooltip>
    );
  }

  if (!hasRequiredDeckDetails) {
    return (
      <Tooltip>
        <TooltipTrigger
          delay={200}
          render={(props) => (
            <span {...props} className={cn("inline-flex", props.className)}>
              <Button variant={triggerVariant} disabled>
                {triggerLabel}
              </Button>
            </span>
          )}
        />
        <TooltipContent>
          Add a title and description to this deck first.
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button
      variant={triggerVariant}
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await generateAiCardsAction({ deckId });
          if (!result.ok) {
            toast.error(result.error ?? "Failed to generate cards");
            return;
          }

          toast.success(
            `Generated ${result.cardCount} card${result.cardCount === 1 ? "" : "s"} with AI`,
          );
          router.refresh();
        });
      }}
    >
      {isPending ? "Generating..." : triggerLabel}
    </Button>
  );
}
