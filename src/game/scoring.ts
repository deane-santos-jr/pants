import { normalizeAnswer, startsWithLetter } from "./normalize";
import {
  CATEGORIES,
  rejectionKey,
  type Category,
  type CategoryScore,
  type Player,
  type PlayerId,
  type PlayerRoundScore,
  type Round,
  type RoundScores,
  type Standing,
} from "./types";

export const UNIQUE_POINTS = 10;
export const DUPLICATE_POINTS = 5;

type Candidate = { playerId: PlayerId; normalized: string };

const validCandidates = (round: Round, category: Category): Candidate[] =>
  Object.entries(round.answers)
    .map(([playerId, sheet]) => ({ playerId, normalized: normalizeAnswer(sheet[category]) }))
    .filter(
      ({ playerId, normalized }) =>
        startsWithLetter(normalized, round.letter) &&
        !round.rejected.includes(rejectionKey(playerId, category)),
    );

const countOccurrences = (candidates: Candidate[]): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const { normalized } of candidates) counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  return counts;
};

const scoreCategory = (round: Round, playerId: PlayerId, category: Category): CategoryScore => {
  const normalized = normalizeAnswer(round.answers[playerId]?.[category] ?? "");
  if (normalized === "") return { points: 0, reason: "blank" };
  if (!startsWithLetter(normalized, round.letter)) return { points: 0, reason: "wrong-letter" };
  if (round.rejected.includes(rejectionKey(playerId, category))) return { points: 0, reason: "rejected" };
  const occurrences = countOccurrences(validCandidates(round, category)).get(normalized) ?? 0;
  return occurrences > 1
    ? { points: DUPLICATE_POINTS, reason: "duplicate" }
    : { points: UNIQUE_POINTS, reason: "unique" };
};

const scorePlayer = (round: Round, playerId: PlayerId): PlayerRoundScore => {
  const scores = Object.fromEntries(
    CATEGORIES.map((category) => [category, scoreCategory(round, playerId, category)]),
  ) as Record<Category, CategoryScore>;
  const total = CATEGORIES.reduce((sum, category) => sum + scores[category].points, 0);
  return { ...scores, total };
};

export const scoreRound = (round: Round, players: Player[]): RoundScores =>
  Object.fromEntries(players.map((player) => [player.id, scorePlayer(round, player.id)]));

export const matchTotals = (rounds: Round[], players: Player[]): Record<PlayerId, number> => {
  const totals: Record<PlayerId, number> = Object.fromEntries(players.map((p) => [p.id, 0]));
  for (const round of rounds) {
    const scores = scoreRound(round, players);
    for (const player of players) totals[player.id] += scores[player.id].total;
  }
  return totals;
};

export const standings = (rounds: Round[], players: Player[]): Standing[] => {
  const totals = matchTotals(rounds, players);
  const sorted = [...players].sort((a, b) => totals[b.id] - totals[a.id]);
  let rank = 0;
  let previousTotal: number | null = null;
  return sorted.map((player, index) => {
    if (totals[player.id] !== previousTotal) rank = index + 1;
    previousTotal = totals[player.id];
    return { player, total: totals[player.id], rank };
  });
};
