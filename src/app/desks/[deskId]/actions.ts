"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  addCardToDeckForClerkUser,
  addCardsToDeckForClerkUser,
  deleteCardForClerkUser,
  updateCardForClerkUser,
} from "@/db/queries/cards";
import {
  deleteDeckForClerkUser,
  getDeckByIdForClerkUserId,
  updateDeckForClerkUser,
} from "@/db/queries/decks";
import {
  FLASHCARDS_CONFIG_ERROR_PREFIX,
  generateFlashcards,
} from "@/lib/ai/generate-flashcards";

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

const generateAiCardsSchema = z.object({
  deckId: z.string().uuid(),
});

const GENERATED_CARD_COUNT = 20;

type GenerateAiCardsInput = z.infer<typeof generateAiCardsSchema>;

export async function generateAiCardsAction(input: GenerateAiCardsInput) {
  const { userId, has } = await auth();
  if (!userId) redirect("/sign-in");

  const parsed = generateAiCardsSchema.parse(input);

  const canGenerateAiCards =
    has({ plan: "pro" }) || has({ feature: "ai_flashcard_generation" });
  if (!canGenerateAiCards) {
    return {
      ok: false as const,
      error:
        "AI flashcard generation is a Pro feature. Upgrade to generate cards." as const,
    };
  }

  const deck = await getDeckByIdForClerkUserId(userId, parsed.deckId);
  if (!deck) {
    return { ok: false as const, error: "Deck not found" as const };
  }

  const hasTitle = deck.title.trim().length > 0;
  const hasDescription =
    typeof deck.description === "string" && deck.description.trim().length > 0;
  if (!hasTitle || !hasDescription) {
    return {
      ok: false as const,
      errorCode: "MISSING_DECK_DETAILS" as const,
      error:
        "Please add both a title and description before generating AI cards." as const,
    };
  }
  const deckDescription = deck.description as string;

  try {
    const generatedCards = await generateFlashcards({
      title: deck.title,
      description: deckDescription,
      cardCount: GENERATED_CARD_COUNT,
    });

    const inserted = await addCardsToDeckForClerkUser({
      clerkUserId: userId,
      deckId: parsed.deckId,
      cardPairs: generatedCards,
    });

    if (!inserted) {
      return { ok: false as const, error: "Deck not found" as const };
    }

    revalidatePath(`/desks/${parsed.deckId}`);

    return { ok: true as const, cardCount: generatedCards.length };
  } catch (err) {
    console.error("generateAiCardsAction:", err);

    if (
      err instanceof Error &&
      err.message.includes(FLASHCARDS_CONFIG_ERROR_PREFIX)
    ) {
      return {
        ok: false as const,
        errorCode: "OPENAI_CONFIG" as const,
        error: err.message
          .replace(FLASHCARDS_CONFIG_ERROR_PREFIX, "")
          .trim(),
      };
    }

    return {
      ok: false as const,
      errorCode: "GENERATION_FAILED" as const,
      error: "Failed to generate cards. Please try again." as const,
    };
  }
}

