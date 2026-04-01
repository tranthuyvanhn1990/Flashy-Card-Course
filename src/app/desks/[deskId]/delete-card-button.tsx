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

import { deleteCardAction, type DeleteCardInput } from "./actions";

export function DeleteCardButton({
  cardId,
  cardFrontPreview,
}: {
  cardId: string;
  cardFrontPreview: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const preview =
    cardFrontPreview.length > 80
      ? `${cardFrontPreview.slice(0, 80)}…`
      : cardFrontPreview;

  function onConfirm() {
    setError(null);
    const input: DeleteCardInput = { cardId };

    startTransition(async () => {
      const result = await deleteCardAction(input);

      if (!result.ok) {
        setError(result.error ?? "Failed to delete card");
        return;
      }

      setOpen(false);
      toast.success("Card deleted");
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
        size="icon-sm"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        aria-label="Delete card"
        onClick={() => setOpen(true)}
      >
        <Trash2Icon />
      </Button>

      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Delete this card?</DialogTitle>
          <DialogDescription>
            This cannot be undone. The card starting with “{preview}” will be
            removed from the deck.
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
            {isPending ? "Deleting…" : "Delete card"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
