"use client";

import { useEffect, useRef, useState } from "react";
import { useSound } from "@/audio/useSound";
import { scoreRound, standings } from "@/game/scoring";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  rejectionKey,
  type Category,
  type Match,
  type PlayerId,
  type RejectionKey,
  type ScoreReason,
  type Verdict,
} from "@/game/types";
import { pendingEntries, requestVerdicts } from "@/game/validateRound";
import { Mascot } from "./Mascot";
import { Button, Card } from "./ui";

type Props = {
  match: Match;
  isFinal: boolean;
  onToggleReject: (playerId: PlayerId, category: Category) => void;
  onValidated: (verdicts: Record<RejectionKey, Verdict>) => void;
  onNext: () => void;
};

type CheckStatus = "checking" | "done" | "failed" | "nothing";

const useAnswerCheck = (match: Match, onValidated: Props["onValidated"]): CheckStatus => {
  const round = match.rounds[match.roundIndex];
  const [failed, setFailed] = useState(false);
  const requested = useRef<string | null>(null);
  const roundKey = `${match.roundIndex}:${round.letter}`;
  const nothingToCheck = pendingEntries(round, match.config.players).length === 0;

  useEffect(() => {
    if (round.validation || nothingToCheck || requested.current === roundKey) return;
    requested.current = roundKey;
    requestVerdicts(round, match.config.players)
      .then(onValidated)
      .catch(() => setFailed(true));
  }, [round, roundKey, nothingToCheck, match.config.players, onValidated]);

  if (nothingToCheck) return "nothing";
  if (round.validation) return "done";
  return failed ? "failed" : "checking";
};

const notA = (category: Category) => {
  const label = CATEGORY_LABELS[category].toLowerCase();
  return /^[aeiou]/.test(label) ? `not an ${label}` : `not a ${label}`;
};

const CHECK_LABEL: Record<CheckStatus, string> = {
  checking: "Checking answers…",
  done: "Answers checked. Tap any to overrule.",
  failed: "Couldn't auto-check answers. Tap any to reject.",
  nothing: "Tap an answer to reject it. Tap again to allow it.",
};

const REASON_STYLE: Record<ScoreReason, string> = {
  unique: "bg-sky text-blue-text",
  duplicate: "bg-lavender text-violet-text",
  blank: "bg-white text-ink-soft",
  "wrong-letter": "bg-pink text-pink-text",
  rejected: "bg-pink text-pink-text",
};

const REASON_LABEL: Record<ScoreReason, string> = {
  unique: "unique",
  duplicate: "same",
  blank: "blank",
  "wrong-letter": "wrong letter",
  rejected: "rejected",
};

export function RevealScreen({ match, isFinal, onToggleReject, onValidated, onNext }: Props) {
  const { play } = useSound();
  const round = match.rounds[match.roundIndex];
  const players = match.config.players;
  const scores = scoreRound(round, players);
  const totals = standings(match.rounds, players);
  const checkStatus = useAnswerCheck(match, onValidated);
  const verdictFor = (playerId: PlayerId, category: Category): Verdict | undefined =>
    round.validation?.[rejectionKey(playerId, category)];

  useEffect(() => {
    play("fanfare", [30, 30, 60]);
  }, [play]);

  return (
    <div className="flex flex-col gap-4">
      <Card className="text-center">
        <p className="text-ink-soft font-bold">Round {match.roundIndex + 1} · letter</p>
        <p className="font-display text-6xl font-bold text-pink-deep leading-none">{round.letter}</p>
        <p className="mt-2 text-sm text-ink-soft" aria-live="polite">
          {checkStatus === "checking" && <span className="inline-block wobble mr-1">🔍</span>}
          {CHECK_LABEL[checkStatus]}
        </p>
      </Card>

      {CATEGORIES.map((category) => (
        <Card key={category} className="flex flex-col gap-2">
          <h3 className="text-xl font-bold">{CATEGORY_LABELS[category]}</h3>
          {players.map((player) => {
            const score = scores[player.id][category];
            const text = round.answers[player.id]?.[category]?.trim() || "—";
            const verdict = verdictFor(player.id, category);
            const flagged = score.reason === "rejected" && verdict?.valid === false;
            return (
              <button
                key={player.id}
                type="button"
                disabled={score.reason === "blank"}
                onClick={() => {
                  play("pop", 15);
                  onToggleReject(player.id, category);
                }}
                className="flex flex-col gap-1 rounded-2xl bg-cream px-3 py-2 text-left disabled:opacity-60"
              >
                <span className="flex items-center gap-2 w-full">
                  <Mascot variant={player.avatar} size={32} mood={score.points === 10 ? "cheer" : score.points === 0 ? "worried" : "happy"} />
                  <span className="text-xs font-bold text-ink-soft w-16 truncate">{player.name}</span>
                  <span className={`flex-1 font-bold truncate ${score.reason === "rejected" ? "line-through text-ink-soft" : ""}`}>
                    {text}
                  </span>
                  <span className={`chip ${REASON_STYLE[score.reason]}`}>
                    {score.points > 0 ? `+${score.points}` : flagged ? notA(category) : REASON_LABEL[score.reason]}
                  </span>
                </span>
                {flagged && <span className="text-xs text-pink-text pl-10">{verdict.reason}</span>}
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
