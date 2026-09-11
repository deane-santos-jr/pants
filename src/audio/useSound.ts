"use client";

import { useCallback, useSyncExternalStore } from "react";
import { sounds, vibrate, type SoundName } from "./synth";

const MUTE_KEY = "pants:muted";
const listeners = new Set<() => void>();

const readMuted = () => {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
};

const writeMuted = (muted: boolean) => {
  localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  for (const listener of listeners) listener();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useSound = () => {
  const muted = useSyncExternalStore(subscribe, readMuted, () => false);
  const play = useCallback(
    (name: SoundName, haptic?: number | number[]) => {
      if (muted) return;
      sounds[name]();
      if (haptic) vibrate(haptic);
    },
    [muted],
  );
  const toggleMuted = useCallback(() => writeMuted(!muted), [muted]);
  return { muted, play, toggleMuted };
};
