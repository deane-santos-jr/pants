export const CATEGORIES = ["place", "animal", "name", "thing"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  place: "Place",
  animal: "Animal",
  name: "Name",
  thing: "Thing",
};

export type PlayerId = string;

export type Player = {
  id: PlayerId;
  name: string;
  avatar: number;
};

export type MatchConfig = {
  players: Player[];
  rounds: number;
  timerSeconds: number;
  allowHardLetters: boolean;
};

export type AnswerSheet = Record<Category, string>;

export type RejectionKey = `${PlayerId}:${Category}`;

export type Verdict = { valid: boolean; reason: string };

export type Round = {
  letter: string;
  order: PlayerId[];
  answers: Record<PlayerId, AnswerSheet>;
  rejected: RejectionKey[];
  validation?: Record<RejectionKey, Verdict>;
};

export type Phase = "pass" | "turn" | "reveal" | "results";

export type Match = {
  config: MatchConfig;
  rounds: Round[];
  roundIndex: number;
  turnIndex: number;
  phase: Phase;
  turnEndsAt: number | null;
};

export type ScoreReason = "unique" | "duplicate" | "blank" | "wrong-letter" | "rejected";

export type CategoryScore = { points: number; reason: ScoreReason };

export type PlayerRoundScore = Record<Category, CategoryScore> & { total: number };

export type RoundScores = Record<PlayerId, PlayerRoundScore>;

export type Standing = { player: Player; total: number; rank: number };

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 8;
export const MIN_ROUNDS = 1;
export const MAX_ROUNDS = 10;
export const DEFAULT_ROUNDS = 5;
export const MIN_TIMER = 20;
export const MAX_TIMER = 90;
export const DEFAULT_TIMER = 45;

export const emptySheet = (): AnswerSheet => ({ place: "", animal: "", name: "", thing: "" });

export const rejectionKey = (playerId: PlayerId, category: Category): RejectionKey =>
  `${playerId}:${category}`;
