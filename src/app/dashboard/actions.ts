"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createDeckForUser } from "@/db/queries/decks";

const createDeckSchema = z.object({
  title: z.string().min(1).max(512),
  description: z.string().max(5000).optional(),
});

export type CreateDeskInput = z.infer<typeof createDeckSchema>;

export async function createDeckAction(input: CreateDeskInput) {
  const { userId } = await auth();
  if (!userId) {
    // Keep consistent behavior with other server actions.
    // (Client will generally not reach here without auth, but this is a safety net.)
    return { ok: false as const, error: "Unauthorized" as const };
  }

  const parsed = createDeckSchema.parse(input);

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

