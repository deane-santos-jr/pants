import { describe, expect, it } from "vitest";
import { scoreRound, standings } from "./scoring";
import { rejectionKey, type Player, type Round } from "./types";

const players: Player[] = [
  { id: "a", name: "Ana", avatar: 0 },
  { id: "b", name: "Ben", avatar: 1 },
  { id: "c", name: "Cai", avatar: 2 },
];

const round = (overrides: Partial<Round> = {}): Round => ({
  letter: "M",
  order: ["a", "b", "c"],
  rejected: [],
  answers: {
    a: { place: "Manila", animal: "Monkey", name: "Maria", thing: "Mug" },
    b: { place: "manila ", animal: "Mouse", name: "", thing: "Cebu" },
    c: { place: "Makati", animal: "Monkey!", name: "Mario", thing: "Mug" },
  },
  ...overrides,
});

describe("scoreRound", () => {
  const scores = scoreRound(round(), players);

  it("gives 10 for unique answers", () => {
    expect(scores.c.place).toEqual({ points: 10, reason: "unique" });
  });
  it("gives 5 for duplicates after normalisation", () => {
    expect(scores.a.place).toEqual({ points: 5, reason: "duplicate" });
    expect(scores.b.place).toEqual({ points: 5, reason: "duplicate" });
    expect(scores.a.animal.reason).toBe("duplicate");
    expect(scores.c.animal.reason).toBe("duplicate");
  });
  it("gives 0 for blank", () => {
    expect(scores.b.name).toEqual({ points: 0, reason: "blank" });
  });
  it("gives 0 for wrong letter", () => {
    expect(scores.b.thing).toEqual({ points: 0, reason: "wrong-letter" });
  });
  it("totals per player", () => {
    expect(scores.a.total).toBe(5 + 5 + 10 + 5);
    expect(scores.b.total).toBe(5 + 10 + 0 + 0);
  });
  it("rejected answers score 0 and stop counting as duplicates", () => {
    const rejected = scoreRound(round({ rejected: [rejectionKey("c", "thing")] }), players);
    expect(rejected.c.thing).toEqual({ points: 0, reason: "rejected" });
    expect(rejected.a.thing).toEqual({ points: 10, reason: "unique" });
  });
});

describe("standings", () => {
  it("ranks by total with shared ranks on ties", () => {
    const tie: Round = {
      letter: "M",
      order: ["a", "b", "c"],
      rejected: [],
      answers: {
        a: { place: "Manila", animal: "", name: "", thing: "" },
        b: { place: "Makati", animal: "", name: "", thing: "" },
        c: { place: "", animal: "", name: "", thing: "" },
      },
    };
    const result = standings([tie], players);
    expect(result.map((s) => [s.player.id, s.total, s.rank])).toEqual([
      ["a", 10, 1],
      ["b", 10, 1],
      ["c", 0, 3],
    ]);
  });
});
