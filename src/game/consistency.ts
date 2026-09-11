import type { Category } from "./types";

type RawVerdict = { key: string; meaning: string; valid: boolean; reason: string };

const NOT_A_NOUN = /\b(adjective|adverb|verb|feeling|emotion|exclamation|interjection|preposition)\b/i;
const A_PERSON = /\b(first name|given name|surname|last name|family name|person'?s name|male name|female name|nickname)\b/i;

const contradiction = (category: Category, meaning: string): string | null => {
  if (category === "thing" && NOT_A_NOUN.test(meaning)) return "Not a thing: that's a describing word, not an object";
  if ((category === "animal" || category === "place") && A_PERSON.test(meaning)) return `A person's name is not a ${category}`;
  return null;
};

export const enforceMeaningConsistency = (category: Category, verdict: RawVerdict): RawVerdict => {
  if (!verdict.valid) return verdict;
  const reason = contradiction(category, verdict.meaning);
  return reason ? { ...verdict, valid: false, reason } : verdict;
};
