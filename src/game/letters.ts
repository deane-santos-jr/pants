export const ALL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const HARD_LETTERS = ["Q", "X", "Z"];

export type RandomSource = () => number;

export const letterPool = (used: string[], allowHard: boolean): string[] =>
  ALL_LETTERS.filter((letter) => !used.includes(letter)).filter(
    (letter) => allowHard || !HARD_LETTERS.includes(letter),
  );

export const pickLetter = (used: string[], allowHard: boolean, random: RandomSource): string => {
  const pool = letterPool(used, allowHard);
  if (pool.length === 0) throw new Error("No letters left to pick");
  return pool[Math.floor(random() * pool.length)];
};
