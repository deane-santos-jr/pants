"use client";

import { useEffect, useState } from "react";
import { useSound } from "@/audio/useSound";
import { loadRoster, saveRoster } from "@/game/storage";
import {
  DEFAULT_ROUNDS,
  DEFAULT_TIMER,
  MAX_PLAYERS,
  MAX_ROUNDS,
  MAX_TIMER,
  MIN_PLAYERS,
  MIN_ROUNDS,
  MIN_TIMER,
  type MatchConfig,
  type Player,
} from "@/game/types";
import { fetchRoster } from "@/supabase/persistence";
import { AvatarPicker } from "./AvatarPicker";
import { Mascot } from "./Mascot";
import { Button, Card } from "./ui";

type Props = { onStart: (config: MatchConfig) => void };

const newPlayer = (avatar: number): Player => ({ id: crypto.randomUUID(), name: "", avatar });

const initialRoster = (): Player[] => {
  const cached = loadRoster();
  return cached.length ? cached : [newPlayer(0), newPlayer(1)];
};

const Stepper = ({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) => (
  <div className="flex items-center justify-between">
    <span className="font-bold">{label}</span>
    <div className="flex items-center gap-2">
      <Button tone="ghost" type="button" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(value - step)}>
        −
      </Button>
      <span className="font-display text-2xl w-16 text-center">
        {value}
        {suffix}
      </span>
      <Button tone="ghost" type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(value + step)}>
        +
      </Button>
    </div>
  </div>
);

export function SetupScreen({ onStart }: Props) {
  const { play } = useSound();
  const [players, setPlayers] = useState<Player[]>(initialRoster);
  const [editing, setEditing] = useState<string | null>(null);
  const [rounds, setRounds] = useState(DEFAULT_ROUNDS);
  const [timerSeconds, setTimerSeconds] = useState(DEFAULT_TIMER);
  const [allowHardLetters, setAllowHardLetters] = useState(false);

  useEffect(() => {
    fetchRoster()
      .then((remote) => {
        if (remote && remote.length) setPlayers(remote);
      })
      .catch(() => undefined);
  }, []);

  const updatePlayer = (id: string, patch: Partial<Player>) =>
    setPlayers((current) => current.map((player) => (player.id === id ? { ...player, ...patch } : player)));

  const addPlayer = () => {
    play("pop");
    const next = newPlayer(players.length % 12);
    setPlayers((current) => [...current, next]);
    setEditing(next.id);
  };

  const removePlayer = (id: string) => setPlayers((current) => current.filter((player) => player.id !== id));

  const ready = players.length >= MIN_PLAYERS && players.every((player) => player.name.trim().length > 0);

  const start = () => {
    const trimmed = players.map((player) => ({ ...player, name: player.name.trim().slice(0, 24) }));
    saveRoster(trimmed);
    play("fanfare", 30);
    onStart({ players: trimmed, rounds, timerSeconds, allowHardLetters });
  };

  return (
    <>
      <Card>
        <h2 className="text-2xl font-bold mb-3">Who&apos;s playing?</h2>
        <ul className="flex flex-col gap-2">
          {players.map((player) => (
            <li key={player.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Change avatar"
                  onClick={() => setEditing(editing === player.id ? null : player.id)}
                  className="shrink-0"
                >
                  <Mascot variant={player.avatar} size={44} />
                </button>
                <input
                  value={player.name}
                  maxLength={24}
                  placeholder="Name"
                  aria-label="Player name"
                  onChange={(event) => updatePlayer(player.id, { name: event.target.value })}
                  className="flex-1 min-w-0 rounded-full bg-cream px-4 py-2 font-bold outline-none focus:ring-4 focus:ring-lavender"
                />
                <button
                  type="button"
                  aria-label={`Remove ${player.name || "player"}`}
                  disabled={players.length <= MIN_PLAYERS}
                  onClick={() => removePlayer(player.id)}
                  className="w-9 h-9 rounded-full bg-pink text-pink-text font-bold disabled:opacity-30"
                >
                  ×
                </button>
              </div>
              {editing === player.id && (
                <AvatarPicker
                  value={player.avatar}
                  onChange={(avatar) => {
                    play("pop");
                    updatePlayer(player.id, { avatar });
                    setEditing(null);
                  }}
                />
              )}
            </li>
          ))}
        </ul>
        <Button tone="ghost" type="button" className="mt-3 w-full" disabled={players.length >= MAX_PLAYERS} onClick={addPlayer}>
          + Add player
        </Button>
      </Card>

      <Card className="flex flex-col gap-4">
        <Stepper label="Rounds" value={rounds} min={MIN_ROUNDS} max={MAX_ROUNDS} onChange={setRounds} />
        <Stepper label="Timer" value={timerSeconds} min={MIN_TIMER} max={MAX_TIMER} step={5} suffix="s" onChange={setTimerSeconds} />
        <label className="flex items-center justify-between font-bold">
          <span>Hard letters (Q, X, Z)</span>
          <input
            type="checkbox"
            checked={allowHardLetters}
            onChange={(event) => setAllowHardLetters(event.target.checked)}
            className="w-6 h-6 accent-violet-deep"
          />
        </label>
      </Card>

      <Button big type="button" disabled={!ready} onClick={start}>
        Let&apos;s play!
      </Button>
    </>
  );
}
