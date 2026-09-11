import { describe, expect, it } from "vitest";
import { normalizeAnswer, startsWithLetter } from "./normalize";

describe("normalizeAnswer", () => {
  it("lowercases and trims", () => {
    expect(normalizeAnswer("  Manila ")).toBe("manila");
  });
  it("strips punctuation and collapses whitespace", () => {
    expect(normalizeAnswer("Manila,  City!")).toBe("manila city");
  });
  it("strips diacritics", () => {
    expect(normalizeAnswer("Ñeñe")).toBe("nene");
  });
  it("keeps digits", () => {
    expect(normalizeAnswer("7-Eleven")).toBe("7eleven");
  });
});

describe("startsWithLetter", () => {
  it("is case-insensitive on the letter", () => {
    expect(startsWithLetter("manila", "M")).toBe(true);
  });
  it("rejects wrong letter and empty", () => {
    expect(startsWithLetter("cebu", "M")).toBe(false);
    expect(startsWithLetter("", "M")).toBe(false);
  });
});
