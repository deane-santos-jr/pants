"use client";

import { useEffect } from "react";
import { useSound } from "@/audio/useSound";
import { scoreRound, standings } from "@/game/scoring";
import { CATEGORIES, CATEGORY_LABELS, type Category, type Match, type PlayerId, type ScoreReason } from "@/game/types";
import { Mascot } from "./Mascot";
import { Button, Card } from "./ui";

type Props = { match: Match; isFinal: boolean; onToggleReject: (playerId: PlayerId, category: Category) => void; onNext: () => void };

const REASON_STYLE: Record<ScoreReason, string> = {
  unique: "bg-sky text-blue-text",
  duplicate: "bg-lavender text-violet-text",
  blank: "bg-white text-ink-soft",
  "wrong-letter": "bg-pink text-pink-text",
  rejected: "bg-pink text-pink-text line-through",
};

const REASON_LABEL: Record<ScoreReason, string> = {
  unique: "unique",
  duplicate: "same",
  blank: "blank",
  "wrong-letter": "wrong letter",
  rejected: "rejected",
};

export function RevealScreen({ match, isFinal, onToggleReject, onNext }: Props) {
  const { play } = useSound();
  const round = match.rounds[match.roundIndex];
  const players = match.config.players;
  const scores = scoreRound(round, players);
  const totals = standings(match.rounds, players);

  useEffect(() => {
    play("fanfare", [30, 30, 60]);
  }, [play]);

  return (
    <div className="flex flex-col gap-4">
      <Card className="text-center">
        <p className="text-ink-soft font-bold">Round {match.roundIndex + 1} · letter</p>
        <p className="font-display text-6xl font-bold text-pink-deep leading-none">{round.letter}</p>
        <p className="mt-2 text-sm text-ink-soft">Tap an answer to reject it. Tap again to allow it.</p>
      </Card>

      {CATEGORIES.map((category) => (
        <Card key={category} className="flex flex-col gap-2">
          <h3 className="text-xl font-bold">{CATEGORY_LABELS[category]}</h3>
          {players.map((player) => {
            const score = scores[player.id][category];
            const text = round.answers[player.id]?.[category]?.trim() || "—";
            return (
              <button
                key={player.id}
                type="button"
                disabled={score.reason === "blank"}
                onClick={() => {
                  play("pop", 15);
                  onToggleReject(player.id, category);
                }}
                className="flex items-center gap-2 rounded-2xl bg-cream px-3 py-2 text-left disabled:opacity-60"
              >
                <Mascot variant={player.avatar} size={32} mood={score.points === 10 ? "cheer" : score.points === 0 ? "worried" : "happy"} />
                <span className="text-xs font-bold text-ink-soft w-16 truncate">{player.name}</span>
                <span className={`flex-1 font-bold truncate ${score.reason === "rejected" ? "line-through text-ink-soft" : ""}`}>
                  {text}
                </span>
                <span className={`chip ${REASON_STYLE[score.reason]}`}>
                  {score.points > 0 ? `+${score.points}` : REASON_LABEL[score.reason]}
                </span>
              </button>
            );
          })}
        </Card>
      ))}

      <Card>
        <h3 className="text-xl font-bold mb-2">Score</h3>
        <ul className="flex flex-col gap-1">
          {totals.map(({ player, total, rank }) => (
            <li key={player.id} className="flex items-center gap-2">
              <span className="chip bg-lavender text-violet-text">#{rank}</span>
              <span className="flex-1 font-bold">{player.name}</span>
              <span className="text-ink-soft text-sm">+{scores[player.id].total} this round</span>
              <span className="font-display text-2xl font-bold text-violet-deep">{total}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Button big tone="violet" type="button" onClick={onNext}>
        {isFinal ? "See results" : "Next round"}
      </Button>
    </div>
  );
}
