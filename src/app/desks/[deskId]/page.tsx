import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { getDeckByIdForClerkUserId } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import { AddCardModal } from "./add-card-modal";
import { EditCardModal } from "./edit-card-modal";
import { DeleteCardButton } from "./delete-card-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EditDeskModal } from "./edit-desk-modal";

const deskIdSchema = z.string().uuid();

function formatDeckUpdatedAt(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export const metadata: Metadata = {
  title: "Deck",
  description: "Study your flashcards",
};

export default async function DeskPage({
  params,
}: {
  params: Promise<{ deskId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { deskId } = await params;
  const parsedDeskId = deskIdSchema.safeParse(deskId);
  if (!parsedDeskId.success) notFound();

  const deck = await getDeckByIdForClerkUserId(userId, parsedDeskId.data);
  if (!deck) notFound();

  const deckCards = await getCardsByDeckId(deck.id);
  const updatedAtDisplay = formatDeckUpdatedAt(
    deck.updatedAt instanceof Date ? deck.updatedAt : new Date(deck.updatedAt),
  );

  return (
    <div className="flex flex-1 flex-col gap-8 bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to dashboard
        </Link>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {deck.title}
            </h1>

            {deck.description ? (
              <p className="mt-2 text-muted-foreground">{deck.description}</p>
            ) : null}

            <div className="mt-4 space-y-1 text-sm text-muted-foreground">
              <p>Last updated {updatedAtDisplay}</p>
              <p>{deckCards.length} cards</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <EditDeskModal
              deckId={deck.id}
              initialTitle={deck.title}
              initialDescription={deck.description ?? ""}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Cards</h2>
          <AddCardModal deckId={deck.id} />
        </div>

        {deckCards.length === 0 ? (
          <div className="mx-auto w-full max-w-md">
            <Card>
              <CardHeader className="items-center text-center">
                <CardTitle className="text-xl">No cards yet</CardTitle>
                <CardDescription>
                  Add cards to this deck in the database to see them here.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        ) : (
          <ul className="grid list-none gap-4 sm:grid-cols-2">
            {deckCards.map((card) => (
              <li key={card.id} className="h-full">
                <Card className="h-full">
                  <CardContent className="flex flex-col gap-4">
                    <div className="rounded-lg bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Front</p>
                      <p className="text-sm font-medium">{card.front}</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Back</p>
                      <p className="text-sm font-medium">{card.back}</p>
                    </div>
                    <div className="flex justify-end gap-2">
                    <DeleteCardButton
                        cardId={card.id}
                        cardFrontPreview={card.front}
                      />
                      <EditCardModal
                        cardId={card.id}
                        initialFront={card.front}
                        initialBack={card.back}
                      />
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

