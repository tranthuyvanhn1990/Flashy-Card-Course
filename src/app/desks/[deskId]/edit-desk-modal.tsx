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

import { updateDeckAction, type UpdateDeckInput } from "./actions";

export function EditDeskModal({
  deckId,
  initialTitle,
  initialDescription,
}: {
  deckId: string;
  initialTitle: string;
  initialDescription: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState(initialTitle);
  const [description, setDescription] = React.useState(initialDescription);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    if (!open) return;
    // Refill fields each time user opens the dialog.
    setTitle(initialTitle);
    setDescription(initialDescription);
    setError(null);
  }, [open, initialTitle, initialDescription]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const input: UpdateDeckInput = {
      deckId,
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
    };

    startTransition(async () => {
      const result = await updateDeckAction(input);

      if (!result.ok) {
        setError(result.error ?? "Failed to update deck");
        return;
      }

      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Edit deck
      </Button>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit deck</DialogTitle>
          <DialogDescription>
            Update the title and description for this desk.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="edit-title">
              Title
            </label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
              required
              maxLength={512}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="edit-description">
              Description
            </label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
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

