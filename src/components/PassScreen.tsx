"use client";

import { useSound } from "@/audio/useSound";
import type { Player } from "@/game/types";
import { Mascot } from "./Mascot";
import { Button, Card } from "./ui";

type Props = { player: Player; roundNumber: number; totalRounds: number; onBegin: () => void };

export function PassScreen({ player, roundNumber, totalRounds, onBegin }: Props) {
  const { play } = useSound();
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
      <span className="chip bg-sky text-ink">
        Round {roundNumber} of {totalRounds}
      </span>
      <div className="float">
        <Mascot variant={player.avatar} mood="happy" size={180} />
      </div>
      <Card className="w-full">
        <p className="text-ink-soft font-bold">Pass the phone to</p>
        <h2 className="text-4xl font-bold">{player.name}</h2>
        <p className="mt-2 text-sm text-ink-soft">No peeking, everyone else!</p>
      </Card>
      <Button
        big
        tone="violet"
        type="button"
        onClick={() => {
          play("boing", 20);
          onBegin();
        }}
      >
        I&apos;m {player.name}, go!
      </Button>
    </div>
  );
}
