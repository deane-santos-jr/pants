import { generateText, Output } from "ai";
import { enforceMeaningConsistency } from "@/game/consistency";
import { validationRequestSchema, verdictListSchema } from "@/game/validation";
import { CATEGORY_LABELS } from "@/game/types";

const MODELS = (process.env.VALIDATION_MODELS ?? "anthropic/claude-haiku-4.5,anthropic/claude-3-haiku").split(",");

const instructions = `You are the strict referee for PANTS, a Filipino party word game like Scattergories.
For each answer, first write "meaning": what the word actually is, in one short sentence (e.g. "Tagalog word for lion", "a Spanish male first name", "an English adjective meaning attractive", "a Filipino coconut liquor"). Then decide "valid".

An answer is valid only if the thing it names belongs to its category:
- Place: a real city, town, province, region, country, continent, landmark, body of water, or geographic feature. Not a food, drink, object, person, or animal.
- Animal: a real animal species or common animal name, in English or a Philippine language. A person's name is NOT an animal, even if it sounds like one.
- Name: a first name, surname, nickname, or a well-known real or fictional person or character.
- Thing: a concrete common noun for a physical object, food, drink, material, or item. Adjectives, verbs, feelings, and proper nouns are NOT things.

Be consistent with your own "meaning": if you wrote that a word is an adjective, verb, feeling, or a person's name, then it is not a valid Thing, Place, or Animal.
Accept English, Tagalog, Bisaya, other Philippine languages, and Taglish. Accept obvious misspellings and plurals. Do not accept a word just because it exists; it must fit the category. Ignore the starting letter; that is checked elsewhere.
"reason" is at most 12 words, addressed to the players, in English.`;

export async function POST(request: Request) {
  const parsed = validationRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const { letter, entries } = parsed.data;

  const prompt = entries
    .map((entry) => `key=${entry.key} | category=${CATEGORY_LABELS[entry.category]} | answer="${entry.answer}"`)
    .join("\n");

  const categoryOf = new Map(entries.map((entry) => [entry.key, entry.category]));
  const failures: string[] = [];
  for (const model of MODELS) {
    try {
      const { output } = await generateText({
        model,
        output: Output.object({ schema: verdictListSchema }),
        system: instructions,
        prompt: `Letter: ${letter}\nReturn one verdict per key, using the exact keys given.\n${prompt}`,
      });
      const verdicts = output.verdicts
        .filter((verdict) => categoryOf.has(verdict.key))
        .map((verdict) => enforceMeaningConsistency(categoryOf.get(verdict.key)!, verdict));
      return Response.json({ verdicts, model });
    } catch (cause) {
      failures.push(`${model}: ${cause instanceof Error ? cause.message : String(cause)}`);
    }
  }
  console.error("validation failed", failures);
  return Response.json({ error: failures.join(" | ") }, { status: 502 });
}
