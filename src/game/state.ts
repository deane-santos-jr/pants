import { pickLetter, type RandomSource } from "./letters";
import { shuffle } from "./shuffle";
import {
  emptySheet,
  rejectionKey,
  type AnswerSheet,
  type Category,
  type Match,
  type MatchConfig,
  type Player,
  type PlayerId,
  type RejectionKey,
  type Round,
  type Verdict,
} from "./types";

export type MatchAction =
  | { type: "begin-turn"; now: number }
  | { type: "submit-turn"; answers: AnswerSheet }
  | { type: "toggle-reject"; playerId: PlayerId; category: Category }
  | { type: "set-validation"; verdicts: Record<RejectionKey, Verdict> }
  | { type: "next-round"; random: RandomSource };

const usedLetters = (match: Match): string[] => match.rounds.map((round) => round.letter);

const newRound = (letter: string, players: Player[], random: RandomSource): Round => ({
  letter,
  order: shuffle(players, random).map((player) => player.id),
  answers: {},
  rejected: [],
});

export const startMatch = (config: MatchConfig, random: RandomSource): Match => ({
  config,
  rounds: [newRound(pickLetter([], config.allowHardLetters, random), config.players, random)],
  roundIndex: 0,
  turnIndex: 0,
  phase: "pass",
  turnEndsAt: null,
});

export const currentRound = (match: Match): Round => match.rounds[match.roundIndex];

export const currentPlayer = (match: Match): Player => {
  const playerId = currentRound(match).order[match.turnIndex];
  const player = match.config.players.find((candidate) => candidate.id === playerId);
  if (!player) throw new Error(`Unknown player ${playerId} in turn order`);
  return player;
};

export const isFinalRound = (match: Match): boolean => match.roundIndex === match.config.rounds - 1;

const replaceCurrentRound = (match: Match, round: Round): Match => ({
  ...match,
  rounds: match.rounds.map((existing, index) => (index === match.roundIndex ? round : existing)),
});

const beginTurn = (match: Match, now: number): Match => {
  if (match.phase !== "pass") throw new Error(`Cannot begin a turn during ${match.phase}`);
  return { ...match, phase: "turn", turnEndsAt: now + match.config.timerSeconds * 1000 };
};

const submitTurn = (match: Match, answers: AnswerSheet): Match => {
  if (match.phase !== "turn") throw new Error(`Cannot submit a turn during ${match.phase}`);
  const round = currentRound(match);
  const withAnswers = replaceCurrentRound(match, {
    ...round,
    answers: { ...round.answers, [currentPlayer(match).id]: { ...emptySheet(), ...answers } },
  });
  const isLastPlayer = match.turnIndex === round.order.length - 1;
  return isLastPlayer
    ? { ...withAnswers, phase: "reveal", turnEndsAt: null }
    : { ...withAnswers, phase: "pass", turnIndex: match.turnIndex + 1, turnEndsAt: null };
};

const toggleReject = (match: Match, playerId: PlayerId, category: Category): Match => {
  if (match.phase !== "reveal") throw new Error(`Cannot reject answers during ${match.phase}`);
  const round = currentRound(match);
  const key = rejectionKey(playerId, category);
  const rejected = round.rejected.includes(key)
    ? round.rejected.filter((existing) => existing !== key)
    : [...round.rejected, key];
  return replaceCurrentRound(match, { ...round, rejected });
};

const setValidation = (match: Match, verdicts: Record<RejectionKey, Verdict>): Match => {
  if (match.phase !== "reveal") throw new Error(`Cannot validate answers during ${match.phase}`);
  const round = currentRound(match);
  const invalidKeys = (Object.keys(verdicts) as RejectionKey[]).filter((key) => !verdicts[key].valid);
  const rejected = [...new Set([...round.rejected, ...invalidKeys])];
  return replaceCurrentRound(match, { ...round, rejected, validation: verdicts });
};

const nextRound = (match: Match, random: RandomSource): Match => {
  if (match.phase !== "reveal") throw new Error(`Cannot advance during ${match.phase}`);
  if (isFinalRound(match)) return { ...match, phase: "results" };
  const letter = pickLetter(usedLetters(match), match.config.allowHardLetters, random);
  return {
    ...match,
    rounds: [...match.rounds, newRound(letter, match.config.players, random)],
    roundIndex: match.roundIndex + 1,
    turnIndex: 0,
    phase: "pass",
    turnEndsAt: null,
  };
};

export const matchReducer = (match: Match, action: MatchAction): Match => {
  switch (action.type) {
    case "begin-turn":
      return beginTurn(match, action.now);
    case "submit-turn":
      return submitTurn(match, action.answers);
    case "toggle-reject":
      return toggleReject(match, action.playerId, action.category);
    case "set-validation":
      return setValidation(match, action.verdicts);
    case "next-round":
      return nextRound(match, action.random);
  }
};
