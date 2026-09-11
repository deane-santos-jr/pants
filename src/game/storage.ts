import type { Match, Player } from "./types";

const MATCH_KEY = "pants:match";
const ROSTER_KEY = "pants:roster";

const read = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

export const loadMatch = (): Match | null => read<Match>(MATCH_KEY);
export const saveMatch = (match: Match) => localStorage.setItem(MATCH_KEY, JSON.stringify(match));
export const clearMatch = () => localStorage.removeItem(MATCH_KEY);

export const loadRoster = (): Player[] => read<Player[]>(ROSTER_KEY) ?? [];
export const saveRoster = (players: Player[]) => localStorage.setItem(ROSTER_KEY, JSON.stringify(players));
