"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  addCardToDeckForClerkUser,
  deleteCardForClerkUser,
  updateCardForClerkUser,
} from "@/db/queries/cards";
import {
  deleteDeckForClerkUser,
  updateDeckForClerkUser,
} from "@/db/queries/decks";

const addCardSchema = z.object({
  deckId: z.string().uuid(),
  front: z.string().min(1).max(5000),
  back: z.string().min(1).max(5000),
});

export type AddCardInput = z.infer<typeof addCardSchema>;

export async function addCardAction(input: AddCardInput) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const parsed = addCardSchema.parse(input);

  const inserted = await addCardToDeckForClerkUser({
    clerkUserId: userId,
    deckId: parsed.deckId,
    front: parsed.front,
    back: parsed.back,
  });

  if (!inserted) {
    return { ok: false, error: "Deck not found" as const };
  }

  revalidatePath(`/desks/${parsed.deckId}`);

  return { ok: true as const };
}

const updateCardSchema = z.object({
  cardId: z.string().uuid(),
  front: z.string().min(1).max(5000),
  back: z.string().min(1).max(5000),
});

export type UpdateCardInput = z.infer<typeof updateCardSchema>;

export async function updateCardAction(input: UpdateCardInput) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const parsed = updateCardSchema.parse(input);

  const updated = await updateCardForClerkUser({
    clerkUserId: userId,
    cardId: parsed.cardId,
    front: parsed.front,
    back: parsed.back,
  });

  if (!updated) {
    return { ok: false, error: "Card not found" as const };
  }

  revalidatePath(`/desks/${updated.deckId}`);

  return { ok: true as const };
}

const deleteCardSchema = z.object({
  cardId: z.string().uuid(),
});

export type DeleteCardInput = z.infer<typeof deleteCardSchema>;

export async function deleteCardAction(input: DeleteCardInput) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const parsed = deleteCardSchema.parse(input);

  const deleted = await deleteCardForClerkUser({
    clerkUserId: userId,
    cardId: parsed.cardId,
  });

  if (!deleted) {
    return { ok: false, error: "Card not found" as const };
  }

  revalidatePath(`/desks/${deleted.deckId}`);

  return { ok: true as const };
}

const updateDeckSchema = z.object({
  deckId: z.string().uuid(),
  title: z.string().min(1).max(512),
  description: z.string().max(5000).nullable(),
});

export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

export async function updateDeckAction(input: UpdateDeckInput) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const parsed = updateDeckSchema.parse(input);

  const updated = await updateDeckForClerkUser({
    clerkUserId: userId,
    deckId: parsed.deckId,
    title: parsed.title,
    description: parsed.description,
  });

  if (!updated) {
    return { ok: false, error: "Deck not found" as const };
  }

  revalidatePath(`/desks/${parsed.deckId}`);
  revalidatePath("/dashboard");

  return { ok: true as const };
}

const deleteDeckSchema = z.object({
  deckId: z.string().uuid(),
});

export type DeleteDeckInput = z.infer<typeof deleteDeckSchema>;

export async function deleteDeckAction(input: DeleteDeckInput) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const parsed = deleteDeckSchema.parse(input);

  const deleted = await deleteDeckForClerkUser({
    clerkUserId: userId,
    deckId: parsed.deckId,
  });

  if (!deleted) {
    return { ok: false, error: "Deck not found" as const };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/desks/${parsed.deckId}`);

  return { ok: true as const };
}

export async function updateDeckFromFormAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const rawDeckId = formData.get("deckId");
  const rawTitle = formData.get("title");
  const rawDescription = formData.get("description");

  if (typeof rawDeckId !== "string" || typeof rawTitle !== "string") {
    redirect("/dashboard");
  }

  const description =
    typeof rawDescription === "string" && rawDescription.trim() !== ""
      ? rawDescription
      : null;

  const parsed = updateDeckSchema.parse({
    deckId: rawDeckId,
    title: rawTitle,
    description,
  });

  const updated = await updateDeckForClerkUser({
    clerkUserId: userId,
    deckId: parsed.deckId,
    title: parsed.title,
    description: parsed.description,
  });

  if (!updated) {
    redirect("/dashboard");
  }

  revalidatePath(`/desks/${parsed.deckId}`);
  revalidatePath("/dashboard");
  redirect(`/desks/${parsed.deckId}`);
}

