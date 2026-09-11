"use client";

import { AVATAR_VARIANTS, Mascot } from "./Mascot";

type Props = { value: number; onChange: (variant: number) => void };

export function AvatarPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {AVATAR_VARIANTS.map((_, variant) => (
        <button
          key={variant}
          type="button"
          onClick={() => onChange(variant)}
          aria-label={`Avatar ${variant + 1}`}
          aria-pressed={value === variant}
          className={`rounded-2xl p-1 transition-transform ${
            value === variant ? "bg-lavender scale-110 ring-4 ring-violet-deep" : "bg-white/60"
          }`}
        >
          <Mascot variant={variant} size={40} />
        </button>
      ))}
    </div>
  );
}
