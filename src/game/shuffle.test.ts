import { describe, expect, it } from "vitest";
import { shuffle } from "./shuffle";

describe("shuffle", () => {
  it("keeps every item exactly once", () => {
    const items = [1, 2, 3, 4, 5];
    expect([...shuffle(items, Math.random)].sort()).toEqual(items);
  });
  it("does not mutate the input", () => {
    const items = ["a", "b"];
    shuffle(items, () => 0);
    expect(items).toEqual(["a", "b"]);
  });
  it("is deterministic for a fixed random source", () => {
    expect(shuffle(["a", "b", "c"], () => 0)).toEqual(["b", "c", "a"]);
  });
});
