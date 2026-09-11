"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSound } from "@/audio/useSound";
import { standings } from "@/game/scoring";
import type { Match } from "@/game/types";
import { saveFinishedMatch, type SaveOutcome } from "@/supabase/persistence";
import { Mascot } from "./Mascot";
import { Button, Card } from "./ui";

type Props = { match: Match; onPlayAgain: () => void };

const SAVE_LABEL: Record<SaveOutcome["status"], string> = {
  saved: "Saved to history ✓",
  unavailable: "History not set up on this build",
  failed: "Couldn't save this match",
};

export function ResultsScreen({ match, onPlayAgain }: Props) {
  const { play } = useSound();
  const [outcome, setOutcome] = useState<SaveOutcome | null>(null);
  const results = standings(match.rounds, match.config.players);
  const winners = results.filter((standing) => standing.rank === 1);

  useEffect(() => {
    play("fanfare", [50, 50, 50, 50, 120]);
    saveFinishedMatch(match).then(setOutcome);
  }, [match, play]);

  return (
    <div className="flex flex-col gap-4 items-center text-center">
      <span className="chip bg-sky text-ink">Final results</span>
      <div className="flex gap-2 float">
        {winners.map(({ player }) => (
          <Mascot key={player.id} variant={player.avatar} mood="cheer" size={140} />
        ))}
      </div>
      <h2 className="text-3xl font-bold">
        {winners.map(({ player }) => player.name).join(" & ")} {winners.length > 1 ? "win!" : "wins!"}
      </h2>

      <Card className="w-full text-left">
        <ul className="flex flex-col gap-2">
          {results.map(({ player, total, rank }) => (
            <li key={player.id} className="flex items-center gap-3">
              <span className="chip bg-lavender text-violet-text">#{rank}</span>
              <Mascot variant={player.avatar} size={36} mood={rank === 1 ? "cheer" : "happy"} />
              <span className="flex-1 font-bold">{player.name}</span>
              <span className="font-display text-2xl font-bold text-violet-deep">{total}</span>
            </li>
          ))}
        </ul>
      </Card>

      <p className="text-sm font-bold text-ink-soft" aria-live="polite">
        {outcome ? SAVE_LABEL[outcome.status] : "Saving…"}
        {outcome?.status === "failed" && <span className="block font-normal">{outcome.message}</span>}
      </p>

      <Button big type="button" onClick={onPlayAgain}>
        Play again
      </Button>
      <Link href="/" className="font-bold text-violet-deep underline">
        Back home
      </Link>
    </div>
  );
}
