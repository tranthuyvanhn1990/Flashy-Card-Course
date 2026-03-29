import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function main() {
  const { db } = await import("./db");
  const { eq } = await import("drizzle-orm");
  const { cards, decks } = await import("./db/schema");

  const [vietDeck] = await db
    .insert(decks)
    .values({
      clerkUserId: "user_dev_example",
      title: "Vietnamese basics",
      description: "English → Vietnamese vocabulary",
    })
    .returning();

  const [historyDeck] = await db
    .insert(decks)
    .values({
      clerkUserId: "user_dev_example",
      title: "British history",
      description: "Key dates and events",
    })
    .returning();

  await db.insert(cards).values([
    { deckId: vietDeck.id, front: "Dog", back: "Con chó", sortOrder: 0 },
    {
      deckId: historyDeck.id,
      front: "When was the battle of Hastings?",
      back: "1066",
      sortOrder: 0,
    },
  ]);
  console.log("Sample decks and cards inserted.");

  const vietCards = await db
    .select()
    .from(cards)
    .where(eq(cards.deckId, vietDeck.id));
  console.log("Vietnamese deck cards:", vietCards);
}

main().catch(console.error);
