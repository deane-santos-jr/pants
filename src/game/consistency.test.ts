import { describe, expect, it } from "vitest";
import { enforceMeaningConsistency } from "./consistency";

const verdict = (meaning: string) => ({ key: "a:thing", meaning, valid: true, reason: "fits" });

describe("enforceMeaningConsistency", () => {
  it("rejects a thing the model called an adjective", () => {
    expect(enforceMeaningConsistency("thing", verdict("an English adjective meaning attractive")).valid).toBe(false);
  });
  it("rejects an animal the model called a first name", () => {
    expect(enforceMeaningConsistency("animal", verdict("a Spanish male first name")).valid).toBe(false);
  });
  it("keeps a thing that is a noun", () => {
    expect(enforceMeaningConsistency("thing", verdict("a Filipino coconut liquor")).valid).toBe(true);
  });
  it("keeps a name that is a first name", () => {
    expect(enforceMeaningConsistency("name", verdict("a Spanish male first name")).valid).toBe(true);
  });
  it("leaves already-invalid verdicts alone", () => {
    const invalid = { ...verdict("a noun"), valid: false, reason: "nope" };
    expect(enforceMeaningConsistency("thing", invalid)).toBe(invalid);
  });
});
