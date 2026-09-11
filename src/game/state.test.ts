import { describe, expect, it } from "vitest";
import { currentPlayer, isFinalRound, matchReducer, startMatch } from "./state";
import { emptySheet, type Match, type MatchConfig } from "./types";

const config: MatchConfig = {
  players: [
    { id: "a", name: "Ana", avatar: 0 },
    { id: "b", name: "Ben", avatar: 1 },
  ],
  rounds: 2,
  timerSeconds: 45,
  allowHardLetters: false,
};

const random = () => 0;

const playFullRound = (match: Match): Match => {
  let next = match;
  for (let turn = 0; turn < match.config.players.length; turn += 1) {
    next = matchReducer(next, { type: "begin-turn", now: 1000 });
    next = matchReducer(next, { type: "submit-turn", answers: emptySheet() });
  }
  return next;
};

describe("match state machine", () => {
  it("starts in pass phase with the first player and a letter", () => {
    const match = startMatch(config, random);
    expect(match.phase).toBe("pass");
    expect(currentPlayer(match).id).toBe("a");
    expect(match.rounds[0].letter).toBe("A");
  });

  it("begin-turn sets the deadline from the timer", () => {
    const match = matchReducer(startMatch(config, random), { type: "begin-turn", now: 1000 });
    expect(match.phase).toBe("turn");
    expect(match.turnEndsAt).toBe(1000 + 45_000);
  });

  it("submitting passes to the next player, then reveals after the last", () => {
    let match = matchReducer(startMatch(config, random), { type: "begin-turn", now: 0 });
    match = matchReducer(match, { type: "submit-turn", answers: { ...emptySheet(), place: "Agoo" } });
    expect(match.phase).toBe("pass");
    expect(currentPlayer(match).id).toBe("b");
    match = matchReducer(match, { type: "begin-turn", now: 0 });
    match = matchReducer(match, { type: "submit-turn", answers: emptySheet() });
    expect(match.phase).toBe("reveal");
    expect(match.rounds[0].answers.a.place).toBe("Agoo");
  });

  it("toggle-reject flips a rejection", () => {
    const revealed = playFullRound(startMatch(config, random));
    const rejected = matchReducer(revealed, { type: "toggle-reject", playerId: "a", category: "place" });
    expect(rejected.rounds[0].rejected).toEqual(["a:place"]);
    const restored = matchReducer(rejected, { type: "toggle-reject", playerId: "a", category: "place" });
    expect(restored.rounds[0].rejected).toEqual([]);
  });

  it("next-round picks an unused letter and resets the turn order", () => {
    const revealed = playFullRound(startMatch(config, random));
    const next = matchReducer(revealed, { type: "next-round", random });
    expect(next.roundIndex).toBe(1);
    expect(next.rounds[1].letter).toBe("B");
    expect(next.phase).toBe("pass");
    expect(currentPlayer(next).id).toBe("a");
    expect(isFinalRound(next)).toBe(true);
  });

  it("next-round after the final round moves to results", () => {
    const secondRound = matchReducer(playFullRound(startMatch(config, random)), { type: "next-round", random });
    const finished = matchReducer(playFullRound(secondRound), { type: "next-round", random });
    expect(finished.phase).toBe("results");
  });

  it("rejects actions in the wrong phase", () => {
    expect(() => matchReducer(startMatch(config, random), { type: "submit-turn", answers: emptySheet() })).toThrow();
  });
});
