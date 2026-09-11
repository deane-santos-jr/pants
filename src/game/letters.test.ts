import { describe, expect, it } from "vitest";
import { ALL_LETTERS, HARD_LETTERS, letterPool, pickLetter } from "./letters";

describe("letterPool", () => {
  it("excludes hard letters by default", () => {
    const pool = letterPool([], false);
    expect(pool).toHaveLength(ALL_LETTERS.length - HARD_LETTERS.length);
    for (const hard of HARD_LETTERS) expect(pool).not.toContain(hard);
  });
  it("includes hard letters when allowed", () => {
    expect(letterPool([], true)).toEqual(ALL_LETTERS);
  });
  it("excludes used letters", () => {
    expect(letterPool(["A", "B"], true)).not.toContain("A");
  });
});

describe("pickLetter", () => {
  it("never repeats a used letter", () => {
    const used = ALL_LETTERS.filter((letter) => letter !== "M");
    expect(pickLetter(used, true, () => 0.99)).toBe("M");
  });
  it("throws when exhausted", () => {
    expect(() => pickLetter(ALL_LETTERS, true, Math.random)).toThrow();
  });
});
