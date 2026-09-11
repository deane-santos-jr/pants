export type Mood = "happy" | "cheer" | "worried" | "sleepy";

export type AvatarVariant = { fill: string; stroke: string; accessory: "none" | "bow" | "star" | "heart" };

export const AVATAR_VARIANTS: AvatarVariant[] = [
  { fill: "#ffb6d9", stroke: "#db2777", accessory: "none" },
  { fill: "#e8bfff", stroke: "#7c3aed", accessory: "none" },
  { fill: "#b3e5fc", stroke: "#2563eb", accessory: "none" },
  { fill: "#ffb6d9", stroke: "#db2777", accessory: "bow" },
  { fill: "#e8bfff", stroke: "#7c3aed", accessory: "bow" },
  { fill: "#b3e5fc", stroke: "#2563eb", accessory: "bow" },
  { fill: "#ffb6d9", stroke: "#db2777", accessory: "star" },
  { fill: "#e8bfff", stroke: "#7c3aed", accessory: "star" },
  { fill: "#b3e5fc", stroke: "#2563eb", accessory: "star" },
  { fill: "#ffb6d9", stroke: "#db2777", accessory: "heart" },
  { fill: "#e8bfff", stroke: "#7c3aed", accessory: "heart" },
  { fill: "#b3e5fc", stroke: "#2563eb", accessory: "heart" },
];

type Props = { variant?: number; mood?: Mood; size?: number; className?: string };

const Face = ({ mood, stroke }: { mood: Mood; stroke: string }) => {
  switch (mood) {
    case "cheer":
      return (
        <>
          <path d="M38 44 q6 -8 12 0" fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
          <path d="M70 44 q6 -8 12 0" fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
          <path d="M46 56 q14 16 28 0 z" fill={stroke} />
        </>
      );
    case "worried":
      return (
        <>
          <circle cx="44" cy="44" r="5" fill={stroke} />
          <circle cx="76" cy="44" r="5" fill={stroke} />
          <path d="M36 32 l14 6 M84 32 l-14 6" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
          <path d="M50 60 q10 -6 20 0" fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="92" cy="40" rx="4" ry="7" fill="#b3e5fc" />
        </>
      );
    case "sleepy":
      return (
        <>
          <path d="M38 46 q6 4 12 0 M70 46 q6 4 12 0" fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
          <circle cx="60" cy="58" r="4" fill={stroke} />
        </>
      );
    default:
      return (
        <>
          <circle cx="44" cy="44" r="5" fill={stroke} />
          <circle cx="76" cy="44" r="5" fill={stroke} />
          <circle cx="34" cy="54" r="5" fill="#ff8fc4" opacity="0.6" />
          <circle cx="86" cy="54" r="5" fill="#ff8fc4" opacity="0.6" />
          <path d="M50 56 q10 10 20 0" fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        </>
      );
  }
};

const Accessory = ({ kind }: { kind: AvatarVariant["accessory"] }) => {
  switch (kind) {
    case "bow":
      return (
        <g transform="translate(86 14)">
          <path d="M0 8 l-14 -8 v16 z M0 8 l14 -8 v16 z" fill="#db2777" />
          <circle cx="0" cy="8" r="4" fill="#ffb6d9" />
        </g>
      );
    case "star":
      return (
        <path
          transform="translate(88 12) scale(0.9)"
          d="M0 -10 L3 -3 L10 -2 L5 3 L6 10 L0 7 L-6 10 L-5 3 L-10 -2 L-3 -3 Z"
          fill="#fbbf24"
        />
      );
    case "heart":
      return (
        <path
          transform="translate(88 14) scale(0.55)"
          d="M0 12 C-14 0 -14 -12 -4 -12 C0 -12 0 -8 0 -8 C0 -8 0 -12 4 -12 C14 -12 14 0 0 12 Z"
          fill="#db2777"
        />
      );
    default:
      return null;
  }
};

export function Mascot({ variant = 0, mood = "happy", size = 120, className }: Props) {
  const look = AVATAR_VARIANTS[variant % AVATAR_VARIANTS.length];
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="PANTS mascot"
    >
      <path
        d="M26 18 h68 a6 6 0 0 1 6 6 v12 l-8 70 a6 6 0 0 1 -6 6 h-18 a6 6 0 0 1 -6 -6 l-2 -34 l-2 34 a6 6 0 0 1 -6 6 h-18 a6 6 0 0 1 -6 -6 l-8 -70 v-12 a6 6 0 0 1 6 -6 z"
        fill={look.fill}
        stroke="#ffffff"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path
        d="M26 18 h68 a6 6 0 0 1 6 6 v12 l-8 70 a6 6 0 0 1 -6 6 h-18 a6 6 0 0 1 -6 -6 l-2 -34 l-2 34 a6 6 0 0 1 -6 6 h-18 a6 6 0 0 1 -6 -6 l-8 -70 v-12 a6 6 0 0 1 6 -6 z"
        fill="none"
        stroke={look.stroke}
        strokeWidth="3"
        strokeLinejoin="round"
        opacity="0.5"
      />
      <rect x="22" y="22" width="76" height="10" rx="5" fill={look.stroke} opacity="0.35" />
      <rect x="38" y="76" width="10" height="12" rx="3" fill="#ffffff" opacity="0.7" />
      <Face mood={mood} stroke={look.stroke} />
      <Accessory kind={look.accessory} />
    </svg>
  );
}
