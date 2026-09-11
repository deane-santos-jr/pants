"use client";

import { useSound } from "@/audio/useSound";

export function MuteButton() {
  const { muted, toggleMuted } = useSound();
  return (
    <button
      type="button"
      onClick={toggleMuted}
      aria-pressed={muted}
      aria-label={muted ? "Unmute sounds" : "Mute sounds"}
      className="sticker !shadow-[var(--shadow-puff-sm)] !rounded-full w-11 h-11 text-xl flex items-center justify-center"
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
