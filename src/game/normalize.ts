const stripDiacritics = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "");

export const normalizeAnswer = (raw: string): string =>
  stripDiacritics(raw)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

export const startsWithLetter = (normalized: string, letter: string): boolean =>
  normalized.length > 0 && normalized[0] === letter.toLowerCase();
