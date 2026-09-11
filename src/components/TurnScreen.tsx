"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSound } from "@/audio/useSound";
import { CATEGORIES, CATEGORY_LABELS, emptySheet, type AnswerSheet, type Category, type Player } from "@/game/types";
import { Mascot } from "./Mascot";
import { Button, Card } from "./ui";

type Props = { player: Player; letter: string; endsAt: number; timerSeconds: number; onSubmit: (answers: AnswerSheet) => void };

const URGENT_SECONDS = 10;

const useCountdown = (endsAt: number) => {
  const [remaining, setRemaining] = useState(() => Math.max(0, endsAt - Date.now()));
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, endsAt - Date.now()));
    tick();
    const interval = window.setInterval(tick, 200);
    return () => window.clearInterval(interval);
  }, [endsAt]);
  return remaining;
};

export function TurnScreen({ player, letter, endsAt, timerSeconds, onSubmit }: Props) {
  const { play } = useSound();
  const [answers, setAnswers] = useState<AnswerSheet>(emptySheet);
  const answersRef = useRef(answers);
  const submitted = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  const remaining = useCountdown(endsAt);
  const secondsLeft = Math.ceil(remaining / 1000);
  const urgent = secondsLeft <= URGENT_SECONDS;
  const lastTicked = useRef<number | null>(null);

  useEffect(() => {
    if (secondsLeft > URGENT_SECONDS || secondsLeft === 0 || lastTicked.current === secondsLeft) return;
    lastTicked.current = secondsLeft;
    play("urgentTick", 10);
  }, [secondsLeft, play]);

  const submit = useCallback(() => {
    if (submitted.current) return;
    submitted.current = true;
    onSubmit(answersRef.current);
  }, [onSubmit]);

  useEffect(() => {
    if (remaining > 0) return;
    play("timeUp", [60, 40, 60]);
    submit();
  }, [remaining, play, submit]);

  const update = (category: Category, value: string) =>
    setAnswers((current) => ({ ...current, [category]: value }));

  const progress = Math.min(1, remaining / (timerSeconds * 1000));

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        play("fanfare", 40);
        submit();
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mascot variant={player.avatar} mood={urgent ? "worried" : "happy"} size={48} />
          <span className="font-bold">{player.name}</span>
        </div>
        <div
          role="timer"
          aria-live="polite"
          className={`font-display text-3xl font-bold tabular-nums ${urgent ? "text-pink-deep" : "text-violet-deep"}`}
        >
          {secondsLeft}s
        </div>
      </div>
      <div className="h-3 rounded-full bg-white overflow-hidden">
        <div
          className={`h-full rounded-full transition-[width] duration-200 ${urgent ? "bg-pink-deep" : "bg-violet-deep"}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <Card className="text-center">
        <p className="text-ink-soft font-bold">Your letter is</p>
        <p className="font-display text-8xl font-bold text-pink-deep leading-none wobble">{letter}</p>
      </Card>

      <Card className="flex flex-col gap-3">
        {CATEGORIES.map((category, index) => (
          <label key={category} className="flex flex-col gap-1">
            <span className="font-bold text-ink-soft">{CATEGORY_LABELS[category]}</span>
            <input
              autoFocus={index === 0}
              autoComplete="off"
              autoCapitalize="words"
              enterKeyHint={index === CATEGORIES.length - 1 ? "done" : "next"}
              value={answers[category]}
              maxLength={80}
              onChange={(event) => update(category, event.target.value)}
              className="rounded-full bg-cream px-4 py-3 text-lg font-bold outline-none focus:ring-4 focus:ring-sky"
            />
          </label>
        ))}
      </Card>

      <Button big type="submit">
        PANTS!
      </Button>
    </form>
  );
}
