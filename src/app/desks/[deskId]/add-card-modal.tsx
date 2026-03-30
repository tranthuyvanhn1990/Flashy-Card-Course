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

import { addCardAction, type AddCardInput } from "./actions";

export function AddCardModal({ deckId }: { deckId: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [front, setFront] = React.useState("");
  const [back, setBack] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const input: AddCardInput = {
      deckId,
      front,
      back,
    };

    startTransition(async () => {
      const result = await addCardAction(input);

      if (!result.ok) {
        setError(result.error ?? "Failed to add card");
        return;
      }

      setOpen(false);
      setFront("");
      setBack("");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Add card
      </Button>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add card</DialogTitle>
          <DialogDescription>
            Add a new flashcard to this deck.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="front">
              Front
            </label>
            <Input
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              disabled={isPending}
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="back">
              Back
            </label>
            <Textarea
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              disabled={isPending}
              required
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

