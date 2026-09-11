import { normalizeAnswer, startsWithLetter } from "./normalize";
import { CATEGORIES, rejectionKey, type Player, type RejectionKey, type Round, type Verdict } from "./types";
import { verdictListSchema, type ValidationEntry } from "./validation";

export const pendingEntries = (round: Round, players: Player[]): ValidationEntry[] =>
  players.flatMap((player) =>
    CATEGORIES.flatMap((category) => {
      const raw = round.answers[player.id]?.[category] ?? "";
      const normalized = normalizeAnswer(raw);
      if (!startsWithLetter(normalized, round.letter)) return [];
      return [{ key: rejectionKey(player.id, category), category, answer: raw.trim() }];
    }),
  );

export const requestVerdicts = async (round: Round, players: Player[]): Promise<Record<RejectionKey, Verdict>> => {
  const entries = pendingEntries(round, players);
  if (entries.length === 0) return {};
  const response = await fetch("/api/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ letter: round.letter, entries }),
  });
  if (!response.ok) throw new Error(`Validation failed (${response.status})`);
  const { verdicts } = verdictListSchema.parse(await response.json());
  return Object.fromEntries(
    verdicts.map((verdict) => [verdict.key, { valid: verdict.valid, reason: verdict.reason }]),
  ) as Record<RejectionKey, Verdict>;
};
