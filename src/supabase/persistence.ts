import { normalizeAnswer } from "@/game/normalize";
import { scoreRound, standings } from "@/game/scoring";
import { CATEGORIES, type Match, type Player, type Standing } from "@/game/types";
import { ensureDeviceSession, supabase } from "./client";

export type SaveOutcome = { status: "saved" } | { status: "unavailable" } | { status: "failed"; message: string };

type AnswerBankRow = {
  match_id: string;
  letter: string;
  category: string;
  answer: string;
  is_unique: boolean;
  is_rejected: boolean;
};

const answerBankRows = (match: Match, matchId: string): AnswerBankRow[] =>
  match.rounds.flatMap((round) => {
    const scores = scoreRound(round, match.config.players);
    return match.config.players.flatMap((player) =>
      CATEGORIES.flatMap((category) => {
        const answer = normalizeAnswer(round.answers[player.id]?.[category] ?? "");
        if (answer === "") return [];
        const score = scores[player.id][category];
        return [
          {
            match_id: matchId,
            letter: round.letter,
            category,
            answer,
            is_unique: score.reason === "unique",
            is_rejected: score.reason === "rejected",
          },
        ];
      }),
    );
  });

const resultRows = (results: Standing[]) =>
  results.map(({ player, total, rank }) => ({ player_id: player.id, name: player.name, avatar: player.avatar, total, rank }));

export const saveFinishedMatch = async (match: Match): Promise<SaveOutcome> => {
  const db = supabase();
  if (!db) return { status: "unavailable" };
  try {
    const owner = await ensureDeviceSession(db);
    await upsertRoster(match.config.players, owner);
    const { data, error } = await db
      .from("matches")
      .insert({
        owner,
        rounds: match.config.rounds,
        timer_seconds: match.config.timerSeconds,
        results: resultRows(standings(match.rounds, match.config.players)),
      })
      .select("id")
      .single();
    if (error) throw error;
    const { error: bankError } = await db.from("answer_bank").insert(answerBankRows(match, data.id));
    if (bankError) throw bankError;
    return { status: "saved" };
  } catch (cause) {
    return { status: "failed", message: cause instanceof Error ? cause.message : String(cause) };
  }
};

const upsertRoster = async (players: Player[], owner: string) => {
  const db = supabase();
  if (!db) return;
  const { error } = await db
    .from("players")
    .upsert(players.map((player) => ({ id: player.id, owner, name: player.name, avatar: player.avatar })), {
      onConflict: "id",
    });
  if (error) throw error;
};

export const fetchRoster = async (): Promise<Player[] | null> => {
  const db = supabase();
  if (!db) return null;
  await ensureDeviceSession(db);
  const { data, error } = await db.from("players").select("id, name, avatar").order("created_at");
  if (error) throw error;
  return data;
};

export type MatchSummary = {
  id: string;
  played_at: string;
  rounds: number;
  timer_seconds: number;
  results: { player_id: string; name: string; avatar: number; total: number; rank: number }[];
};

export const fetchMatchHistory = async (): Promise<MatchSummary[] | null> => {
  const db = supabase();
  if (!db) return null;
  await ensureDeviceSession(db);
  const { data, error } = await db
    .from("matches")
    .select("id, played_at, rounds, timer_seconds, results")
    .order("played_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as MatchSummary[];
};
