"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createDeckForUser, getDecksByClerkUserId } from "@/db/queries/decks";

const createDeckSchema = z.object({
  title: z.string().min(1).max(512),
  description: z.string().max(5000).optional(),
});

export type CreateDeskInput = z.infer<typeof createDeckSchema>;

export async function createDeckAction(input: CreateDeskInput) {
  const { userId, has } = await auth();
  if (!userId) {
    // Keep consistent behavior with other server actions.
    // (Client will generally not reach here without auth, but this is a safety net.)
    return { ok: false as const, error: "Unauthorized" as const };
  }

  const parsed = createDeckSchema.parse(input);

  const hasFreeDeckLimit = has({ feature: "3_desk_limit" });
  if (hasFreeDeckLimit) {
    const existingDecks = await getDecksByClerkUserId(userId);
    if (existingDecks.length >= 3) {
      return {
        ok: false as const,
        error:
          "You've reached the 3-deck limit on the Free plan. Upgrade to create more." as const,
      };
    }
  }

  try {
    const deck = await createDeckForUser({
      clerkUserId: userId,
      title: parsed.title.trim(),
      description:
        typeof parsed.description === "string" && parsed.description.trim() !== ""
          ? parsed.description.trim()
          : null,
    });

    revalidatePath("/dashboard");
    revalidatePath(`/desks/${deck.id}`);

    return { ok: true as const, deckId: deck.id };
  } catch {
    return { ok: false as const, error: "Failed to create desk" as const };
  }
}

