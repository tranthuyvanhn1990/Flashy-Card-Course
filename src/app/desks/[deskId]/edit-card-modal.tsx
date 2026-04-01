"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { updateCardAction, type UpdateCardInput } from "./actions";

export function EditCardModal({
  cardId,
  initialFront,
  initialBack,
}: {
  cardId: string;
  initialFront: string;
  initialBack: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [front, setFront] = React.useState(initialFront);
  const [back, setBack] = React.useState(initialBack);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    if (!open) return;
    setFront(initialFront);
    setBack(initialBack);
    setError(null);
  }, [open, initialFront, initialBack]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const input: UpdateCardInput = {
      cardId,
      front: front.trim(),
      back: back.trim(),
    };

    startTransition(async () => {
      const result = await updateCardAction(input);

      if (!result.ok) {
        setError(result.error ?? "Failed to update card");
        return;
      }

      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Edit card
      </Button>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit card</DialogTitle>
          <DialogDescription>
            Update the front and back of this flashcard.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor={`edit-front-${cardId}`}>
              Front
            </label>
            <Input
              id={`edit-front-${cardId}`}
              value={front}
              onChange={(e) => setFront(e.target.value)}
              disabled={isPending}
              required
              maxLength={5000}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor={`edit-back-${cardId}`}>
              Back
            </label>
            <Textarea
              id={`edit-back-${cardId}`}
              value={back}
              onChange={(e) => setBack(e.target.value)}
              disabled={isPending}
              required
              maxLength={5000}
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
