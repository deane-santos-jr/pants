import { generateText, Output } from "ai";
import { validationRequestSchema, verdictListSchema } from "@/game/validation";
import { CATEGORY_LABELS } from "@/game/types";

const MODEL = "anthropic/claude-haiku-4.5";

const instructions = `You judge answers in PANTS, a Filipino party word game like Scattergories.
Each answer must be a real example of its category and start with the given letter.
Categories: Place (a real city, town, province, country, landmark, or geographic feature), Animal (a real animal, in English or Filipino/Tagalog), Name (a first name, surname, or well-known person or character), Thing (a concrete common noun for an object or item, in English or Filipino/Tagalog).
Accept Filipino, Tagalog, Bisaya, Taglish, and English. Accept minor misspellings when the intended word is obvious. Accept plural and singular.
Reject an answer only when it clearly is not that category: for example a person's name given as an Animal, an animal given as a Place, an adjective or verb given as a Thing, or gibberish.
Give a reason of at most 12 words, written for the players.`;

export async function POST(request: Request) {
  const parsed = validationRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const { letter, entries } = parsed.data;

  const prompt = entries
    .map((entry) => `key=${entry.key} | category=${CATEGORY_LABELS[entry.category]} | answer="${entry.answer}"`)
    .join("\n");

  try {
    const { output } = await generateText({
      model: MODEL,
      output: Output.object({ schema: verdictListSchema }),
      system: instructions,
      prompt: `Letter: ${letter}\nReturn one verdict per key, using the exact keys given.\n${prompt}`,
    });
    const known = new Set(entries.map((entry) => entry.key));
    return Response.json({ verdicts: output.verdicts.filter((verdict) => known.has(verdict.key)) });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error("validation failed", message);
    return Response.json({ error: message }, { status: 502 });
  }
}
