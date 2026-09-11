"use client";

import { useEffect, useState } from "react";
import { fetchMatchHistory, type MatchSummary } from "@/supabase/persistence";
import { Mascot } from "./Mascot";
import { Card, Screen } from "./ui";
import { TopBar } from "./TopBar";

type Status = { kind: "loading" } | { kind: "unavailable" } | { kind: "error"; message: string } | { kind: "ready"; matches: MatchSummary[] };

export function HistoryClient() {
  const [status, setStatus] = useState<Status>({ kind: "loading" });

  useEffect(() => {
    fetchMatchHistory()
      .then((matches) => setStatus(matches ? { kind: "ready", matches } : { kind: "unavailable" }))
      .catch((cause: unknown) => setStatus({ kind: "error", message: cause instanceof Error ? cause.message : String(cause) }));
  }, []);

  return (
    <Screen>
      <TopBar label="History" />
      {status.kind === "loading" && <p className="text-center font-bold text-ink-soft">Loading…</p>}
      {status.kind === "unavailable" && <Card>History isn&apos;t set up on this build.</Card>}
      {status.kind === "error" && <Card>Couldn&apos;t load history: {status.message}</Card>}
      {status.kind === "ready" && status.matches.length === 0 && (
        <Card className="text-center">
          <Mascot mood="sleepy" size={120} className="mx-auto" />
          <p className="font-bold mt-2">No matches yet. Go play one!</p>
        </Card>
      )}
      {status.kind === "ready" &&
        status.matches.map((match) => (
          <Card key={match.id}>
            <p className="text-sm font-bold text-ink-soft">
              {new Date(match.played_at).toLocaleString()} · {match.rounds} rounds · {match.timer_seconds}s
            </p>
            <ul className="mt-2 flex flex-col gap-1">
              {match.results.map((result) => (
                <li key={result.player_id} className="flex items-center gap-2">
                  <span className="chip bg-lavender text-violet-text">#{result.rank}</span>
                  <Mascot variant={result.avatar} size={28} />
                  <span className="flex-1 font-bold">{result.name}</span>
                  <span className="font-display text-xl font-bold text-violet-deep">{result.total}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
    </Screen>
  );
}
