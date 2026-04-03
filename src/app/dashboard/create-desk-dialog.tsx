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

import { toast } from "sonner";

import { createDeckAction, type CreateDeskInput } from "./actions";

export function CreateDeskDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    if (!open) return;
    setTitle("");
    setDescription("");
    setError(null);
  }, [open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const input: CreateDeskInput = {
      title,
      description: description || undefined,
    };

    startTransition(async () => {
      const result = await createDeckAction(input);
      if (!result.ok) {
        setError(result.error ?? "Failed to create desk");
        return;
      }

      setOpen(false);
      toast.success("Desk created");
      router.push(`/desks/${result.deckId}`);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Create new desk
      </Button>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new desk</DialogTitle>
          <DialogDescription>
            Create a flashcard deck to start studying.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="desk-title">
              Title
            </label>
            <Input
              id="desk-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
              required
              maxLength={512}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="desk-description">
              Description (optional)
            </label>
            <Textarea
              id="desk-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              maxLength={5000}
              rows={4}
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

