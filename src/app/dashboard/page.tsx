import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DeckStudyFooter } from "@/components/deck-study-footer";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDecksByClerkUserId } from "@/db/queries/decks";
import { CreateDeskDialog } from "@/app/dashboard/create-desk-dialog";

function formatDeckUpdatedAt(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your decks and study progress",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const userDecks = await getDecksByClerkUserId(userId);

  return (
    <div className="flex flex-1 flex-col gap-8 bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 text-muted-foreground">
              Your flashcard decks for this account.
            </p>
          </div>

          <CreateDeskDialog />
        </div>
      </div>

      {userDecks.length === 0 ? (
        <div className="mx-auto w-full max-w-md">
          <Card>
            <CardHeader className="items-center text-center">
              <CardTitle className="text-xl">No decks yet</CardTitle>
              <CardDescription>
                Create a deck or add rows in the database to see them listed
                here.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      ) : (
        <ul className="mx-auto grid w-full max-w-3xl list-none gap-4 sm:grid-cols-2">
          {userDecks.map((deck) => (
            <li key={deck.id} className="h-full">
              <Link href={`/desks/${deck.id}`} className="block h-full">
                <Card className="flex h-full flex-col">
                  <CardHeader className="flex-1">
                    <CardTitle className="text-lg leading-snug">
                      {deck.title}
                    </CardTitle>
                  </CardHeader>
                  <div className="flex flex-col flex-1 justify-between px-6 pb-4 pt-2">
                    <p className="text-xs text-muted-foreground">
                      Last updated{" "}
                      {formatDeckUpdatedAt(
                        deck.updatedAt instanceof Date
                          ? deck.updatedAt
                          : new Date(deck.updatedAt),
                      )}
                    </p>
                  </div>
                  <DeckStudyFooter deckId={deck.id} />
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
