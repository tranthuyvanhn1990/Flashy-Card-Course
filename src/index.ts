import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const CLERK_USER_ID = "user_3BcmnuBDOX0p5VGJKUYDQwOPckc";

const VIET_DECK_TITLE = "English → Vietnamese vocabulary";
const HISTORY_DECK_TITLE = "British history Q&A";

const vietnameseCards: { front: string; back: string }[] = [
  { front: "Hello", back: "Xin chào" },
  { front: "Thank you", back: "Cảm ơn" },
  { front: "Goodbye", back: "Tạm biệt" },
  { front: "Yes", back: "Vâng / Có" },
  { front: "No", back: "Không" },
  { front: "Water", back: "Nước" },
  { front: "Food", back: "Thức ăn" },
  { front: "House", back: "Ngôi nhà" },
  { front: "Friend", back: "Bạn / Bạn bè" },
  { front: "Book", back: "Quyển sách" },
  { front: "Love", back: "Tình yêu" },
  { front: "Beautiful", back: "Đẹp" },
  { front: "Today", back: "Hôm nay" },
  { front: "Tomorrow", back: "Ngày mai" },
  { front: "Family", back: "Gia đình" },
];

const britishHistoryCards: { front: string; back: string }[] = [
  {
    front: "In what year was the Battle of Hastings?",
    back: "1066",
  },
  {
    front: "Who was compelled to seal Magna Carta in 1215?",
    back: "King John",
  },
  {
    front: "Which English king had six wives?",
    back: "Henry VIII",
  },
  {
    front: "In what year did the English Civil War begin?",
    back: "1642",
  },
  {
    front: "Who is often regarded as the first Prime Minister of Great Britain?",
    back: "Robert Walpole",
  },
  {
    front: "In what year did the Acts of Union unite the Kingdom of England and the Kingdom of Scotland?",
    back: "1707",
  },
  {
    front: "In what year was the Battle of Waterloo?",
    back: "1815",
  },
  {
    front: "Which monarch became empress of India in 1876?",
    back: "Queen Victoria",
  },
  {
    front: "In what year did women in the UK gain the vote on equal terms with men (equal franchise)?",
    back: "1928",
  },
  {
    front: "Who led the Parliamentarian forces to victory in the English Civil War and later ruled as Lord Protector?",
    back: "Oliver Cromwell",
  },
  {
    front: "In what year did the Great Fire of London occur?",
    back: "1666",
  },
  {
    front: "Which royal house emerged victorious from the Wars of the Roses?",
    back: "The Tudors (Henry VII)",
  },
  {
    front: "Who ordered the Domesday survey of England?",
    back: "William the Conqueror",
  },
  {
    front: "In what year was the Magna Carta sealed at Runnymede?",
    back: "1215",
  },
  {
    front: "Which Stuart king was executed in 1649?",
    back: "Charles I",
  },
];

async function main() {
  const { db } = await import("./db");
  const { and, eq } = await import("drizzle-orm");
  const { cards, decks } = await import("./db/schema");

  const [existingViet] = await db
    .select()
    .from(decks)
    .where(
      and(
        eq(decks.clerkUserId, CLERK_USER_ID),
        eq(decks.title, VIET_DECK_TITLE),
      ),
    )
    .limit(1);

  const [existingHistory] = await db
    .select()
    .from(decks)
    .where(
      and(
        eq(decks.clerkUserId, CLERK_USER_ID),
        eq(decks.title, HISTORY_DECK_TITLE),
      ),
    )
    .limit(1);

  if (existingViet && existingHistory) {
    console.log(
      "Both example decks already exist for this user; skipping insert.",
    );
    return;
  }

  let vietDeckId = existingViet?.id;
  if (!vietDeckId) {
    const [vietDeck] = await db
      .insert(decks)
      .values({
        clerkUserId: CLERK_USER_ID,
        title: VIET_DECK_TITLE,
        description: "Common English words with Vietnamese translations.",
      })
      .returning();
    vietDeckId = vietDeck.id;
    await db.insert(cards).values(
      vietnameseCards.map((c, i) => ({
        deckId: vietDeckId!,
        front: c.front,
        back: c.back,
        sortOrder: i,
      })),
    );
    console.log(`Inserted deck "${VIET_DECK_TITLE}" with ${vietnameseCards.length} cards.`);
  }

  let historyDeckId = existingHistory?.id;
  if (!historyDeckId) {
    const [historyDeck] = await db
      .insert(decks)
      .values({
        clerkUserId: CLERK_USER_ID,
        title: HISTORY_DECK_TITLE,
        description: "British history questions and concise answers.",
      })
      .returning();
    historyDeckId = historyDeck.id;
    await db.insert(cards).values(
      britishHistoryCards.map((c, i) => ({
        deckId: historyDeckId!,
        front: c.front,
        back: c.back,
        sortOrder: i,
      })),
    );
    console.log(
      `Inserted deck "${HISTORY_DECK_TITLE}" with ${britishHistoryCards.length} cards.`,
    );
  }
}

main().catch(console.error);
