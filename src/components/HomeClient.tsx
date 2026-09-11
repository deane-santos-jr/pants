"use client";

import Link from "next/link";
import { loadMatch } from "@/game/storage";
import { useHydrated } from "@/hooks/useHydrated";
import { Mascot } from "./Mascot";
import { MuteButton } from "./MuteButton";
import { Button, Card, Screen, Title } from "./ui";

export function HomeClient() {
  const hydrated = useHydrated();
  const saved = hydrated ? loadMatch() : null;
  const resumable = Boolean(saved && saved.phase !== "results");

  return (
    <Screen className="items-center justify-center text-center">
      <div className="absolute top-4 right-4">
        <MuteButton />
      </div>
      <div className="float">
        <Mascot mood="cheer" size={200} />
      </div>
      <Title className="text-6xl text-violet-deep">PANTS</Title>
      <Card>
        <p className="font-bold text-ink-soft">
          <span className="text-pink-deep">P</span>lace · <span className="text-violet-deep">A</span>nimal ·{" "}
          <span className="text-blue-deep">N</span>ame · <span className="text-pink-deep">T</span>hing ·{" "}
          <span className="text-violet-deep">S</span>core
        </p>
        <p className="mt-1 text-sm text-ink-soft">One phone. Pass it around. Beat the timer.</p>
      </Card>
      <Link href="/play" className="w-full">
        <Button big className="w-full">
          {resumable ? "Resume game" : "New game"}
        </Button>
      </Link>
      <Link href="/history" className="font-bold text-violet-deep underline">
        Past matches
      </Link>
    </Screen>
  );
}
