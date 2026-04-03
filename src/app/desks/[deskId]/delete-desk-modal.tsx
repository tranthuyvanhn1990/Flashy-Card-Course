"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { deleteDeckAction, type DeleteDeckInput } from "./actions";

export function DeleteDeskModal({
  deckId,
  deckTitle,
  cardCount,
}: {
  deckId: string;
  deckTitle: string;
  cardCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const cardsPhrase =
    cardCount === 0
      ? "no cards"
      : cardCount === 1
        ? "1 card"
        : `${cardCount} cards`;

  function onConfirm() {
    setError(null);
    const input: DeleteDeckInput = { deckId };

    startTransition(async () => {
      const result = await deleteDeckAction(input);

      if (!result.ok) {
        setError(result.error ?? "Failed to delete desk");
        return;
      }

      setOpen(false);
      toast.success("Desk deleted");
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setError(null);
      }}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2Icon className="size-4 shrink-0" />
        Delete desk
      </Button>

      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Delete this desk?</DialogTitle>
          <DialogDescription>
            This cannot be undone. “{deckTitle}” and all of its flashcards (
            {cardsPhrase}) will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? "Deleting…" : "Delete desk"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
