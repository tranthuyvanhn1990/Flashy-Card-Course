import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { cards, decks } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { getDeckByIdForClerkUserId } from "@/db/queries/decks";

export type CardPair = { front: string; back: string };

export type Card = InferSelectModel<typeof cards>;

export async function createCardsForDeck(
  deckId: string,
  cardPairs: CardPair[],
): Promise<void> {
  await db.insert(cards).values(
    cardPairs.map((c, i) => ({
      deckId,
      front: c.front,
      back: c.back,
      sortOrder: i,
    })),
  );
}

export async function getCardsByDeckId(deckId: string): Promise<Card[]> {
  return db
    .select()
    .from(cards)
    .where(eq(cards.deckId, deckId))
    .orderBy(desc(cards.updatedAt), desc(cards.createdAt));
}

export async function addCardToDeckForClerkUser(params: {
  clerkUserId: string;
  deckId: string;
  front: string;
  back: string;
}): Promise<Card | null> {
  // Ensure the deck belongs to the user before inserting a card.
  const deck = await getDeckByIdForClerkUserId(
    params.clerkUserId,
    params.deckId,
  );
  if (!deck) return null;

  const [{ nextSortOrder }] = await db
    .select({
      nextSortOrder: sql<number>`COALESCE(MAX(${cards.sortOrder}), -1) + 1`,
    })
    .from(cards)
    .where(eq(cards.deckId, params.deckId));

  const [inserted] = await db
    .insert(cards)
    .values({
      deckId: params.deckId,
      front: params.front,
      back: params.back,
      sortOrder: nextSortOrder ?? 0,
    })
    .returning();

  return inserted ?? null;
}

export async function updateCardForClerkUser(params: {
  clerkUserId: string;
  cardId: string;
  front: string;
  back: string;
}): Promise<{ deckId: string } | null> {
  const [owned] = await db
    .select({ deckId: cards.deckId })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(
      and(
        eq(cards.id, params.cardId),
        eq(decks.clerkUserId, params.clerkUserId),
      ),
    )
    .limit(1);

  if (!owned) return null;

  await db
    .update(cards)
    .set({ front: params.front, back: params.back })
    .where(eq(cards.id, params.cardId));

  return { deckId: owned.deckId };
}

export async function deleteCardForClerkUser(params: {
  clerkUserId: string;
  cardId: string;
}): Promise<{ deckId: string } | null> {
  const [owned] = await db
    .select({ deckId: cards.deckId })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(
      and(
        eq(cards.id, params.cardId),
        eq(decks.clerkUserId, params.clerkUserId),
      ),
    )
    .limit(1);

  if (!owned) return null;

  await db.delete(cards).where(eq(cards.id, params.cardId));

  return { deckId: owned.deckId };
}
