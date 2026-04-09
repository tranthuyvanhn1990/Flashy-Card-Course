import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { getCardsByDeckIdForClerkUser } from "@/db/queries/cards";
import { getDeckByIdForClerkUserId } from "@/db/queries/decks";
import { StudySession } from "./study-session";

const deskIdSchema = z.string().uuid();

export default async function DeskStudyPage({
  params,
}: {
  params: Promise<{ deskId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { deskId } = await params;
  const parsedDeskId = deskIdSchema.safeParse(deskId);
  if (!parsedDeskId.success) notFound();

  const deck = await getDeckByIdForClerkUserId(userId, parsedDeskId.data);
  if (!deck) notFound();

  const cards = await getCardsByDeckIdForClerkUser({
    clerkUserId: userId,
    deckId: deck.id,
  });
  if (cards.length === 0) notFound();

  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 pt-8">
        <Link
          href={`/desks/${deck.id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to desk
        </Link>
      </div>
      <StudySession
        deskTitle={deck.title}
        cards={cards.map((card) => ({
          id: card.id,
          front: card.front,
          back: card.back,
        }))}
      />
    </div>
  );
}
