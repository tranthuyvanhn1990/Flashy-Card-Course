import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cards, decks } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

export type Deck = InferSelectModel<typeof decks>;

export async function getDecksByClerkUserId(
  clerkUserId: string,
): Promise<Deck[]> {
  return db
    .select()
    .from(decks)
    .where(eq(decks.clerkUserId, clerkUserId))
    .orderBy(desc(decks.updatedAt));
}

export async function getDeckByClerkUserIdAndTitle(
  clerkUserId: string,
  title: string,
): Promise<Deck | null> {
  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.clerkUserId, clerkUserId), eq(decks.title, title)))
    .limit(1);

  return deck ?? null;
}

export async function getDeckByIdForClerkUserId(
  clerkUserId: string,
  deckId: string,
): Promise<Deck | null> {
  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.clerkUserId, clerkUserId), eq(decks.id, deckId)))
    .limit(1);

  return deck ?? null;
}

export async function createDeckForUser(params: {
  clerkUserId: string;
  title: string;
  description?: string | null;
}): Promise<Deck> {
  const [deck] = await db
    .insert(decks)
    .values({
      clerkUserId: params.clerkUserId,
      title: params.title,
      description: params.description ?? null,
    })
    .returning();

  // Drizzle `returning()` should always return exactly one row for a single-row insert.
  if (!deck) {
    throw new Error("Failed to create deck");
  }

  return deck;
}

export async function updateDeckForClerkUser(params: {
  clerkUserId: string;
  deckId: string;
  title: string;
  description?: string | null;
}): Promise<Deck | null> {
  const [updated] = await db
    .update(decks)
    .set({
      title: params.title,
      description: params.description ?? null,
    })
    .where(and(eq(decks.clerkUserId, params.clerkUserId), eq(decks.id, params.deckId)))
    .returning();

  return updated ?? null;
}

export async function deleteDeckForClerkUser(params: {
  clerkUserId: string;
  deckId: string;
}): Promise<{ id: string } | null> {
  const [owned] = await db
    .select({ id: decks.id })
    .from(decks)
    .where(
      and(eq(decks.clerkUserId, params.clerkUserId), eq(decks.id, params.deckId)),
    )
    .limit(1);

  if (!owned) return null;

  await db.delete(cards).where(eq(cards.deckId, owned.id));

  const [deleted] = await db
    .delete(decks)
    .where(
      and(eq(decks.clerkUserId, params.clerkUserId), eq(decks.id, params.deckId)),
    )
    .returning({ id: decks.id });

  return deleted ?? null;
}

