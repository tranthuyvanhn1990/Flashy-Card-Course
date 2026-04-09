import { generateText, Output } from "ai";
import { z } from "zod";

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

  const flashcardOutputSchema = z.object({
    cards: z.array(generatedCardSchema).refine(
      (value) => value.length === safeCardCount,
      `Must return exactly ${safeCardCount} cards`,
    ),
  });

  const { output } = await generateText({
    model: "openai/gpt-5-mini",
    output: Output.object({
      schema: flashcardOutputSchema,
    }),
    prompt: [
      `Generate exactly ${safeCardCount} study flashcards.`,
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

  return output.cards;
}
