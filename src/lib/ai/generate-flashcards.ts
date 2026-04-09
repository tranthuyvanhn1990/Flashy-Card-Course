import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";

/** Prefix for errors we surface to the client (safe, no secrets). */
export const FLASHCARDS_CONFIG_ERROR_PREFIX = "[flashcards-config]";

const OPENAI_FLASHCARD_MODEL = "gpt-4o-mini" as const;

function getOpenAiLanguageModel() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      `${FLASHCARDS_CONFIG_ERROR_PREFIX} Set OPENAI_API_KEY in .env.local (OpenAI API key).`,
    );
  }
  const openai = createOpenAI({ apiKey });
  return openai(OPENAI_FLASHCARD_MODEL);
}

const generatedCardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1),
});

export type GeneratedCard = z.infer<typeof generatedCardSchema>;

type GenerateFlashcardsInput = {
  title: string;
  description: string;
  cardCount?: number;
};

export async function generateFlashcards({
  title,
  description,
  cardCount = 20,
}: GenerateFlashcardsInput): Promise<GeneratedCard[]> {
  const safeCardCount = Math.max(1, Math.min(cardCount, 50));

  // Do not require an exact array length in the schema: models often return
  // N-1 / N+1 items with structured output, which hard-fails validation.
  const flashcardOutputSchema = z.object({
    cards: z.array(generatedCardSchema).min(1).max(60),
  });

  const { output } = await generateText({
    model: getOpenAiLanguageModel(),
    output: Output.object({
      schema: flashcardOutputSchema,
    }),
    prompt: [
      `Generate about ${safeCardCount} study flashcards (aim for ${safeCardCount}, a few more or fewer is acceptable).`,
      `Deck title: ${title}`,
      `Deck description: ${description}`,
      "Requirements:",
      "- Infer the deck intent from title/description, but do not assume a subject that is not clearly indicated.",
      "- Keep cards aligned to the deck's stated scope and learner intent.",
      "- If and only if the deck is clearly language-learning or translation-focused (for example: English <-> Vietnamese):",
      "  - `front` must be only the source word/phrase/sentence.",
      "  - `back` must be only the direct translation.",
      "  - Do not add explanations, definitions, grammar notes, or extra context.",
      "  - Do not use labels like 'Translation:' or surrounding quotes unless they are part of the phrase itself.",
      "- Otherwise, create concise, factual study cards with clear prompts and direct answers.",
      "- Each card must have `front` as the prompt/question and `back` as the answer.",
      "- Avoid duplicates.",
      "- Avoid assumptions or inferred details that are not supported by the deck context.",
      "- Return only content that fits the required structured output.",
    ].join("\n"),
  });

  return output.cards.slice(0, safeCardCount);
}
