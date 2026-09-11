"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Tone = "pink" | "violet" | "blue" | "ghost";

const TONES: Record<Tone, string> = {
  pink: "bg-pink-deep text-white shadow-[0_6px_0_#9d174d] active:shadow-none",
  violet: "bg-violet-deep text-white shadow-[0_6px_0_#5b21b6] active:shadow-none",
  blue: "bg-blue-deep text-white shadow-[0_6px_0_#1e40af] active:shadow-none",
  ghost: "bg-cream text-violet-text shadow-[0_4px_0_var(--lavender)] active:shadow-none",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; big?: boolean };

export function Button({ tone = "pink", big = false, className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`font-display font-bold rounded-full transition-transform active:translate-y-1.5 disabled:opacity-40 disabled:active:translate-y-0 disabled:active:shadow-[inherit] ${
        big ? "text-2xl px-8 py-4" : "text-lg px-5 py-2.5"
      } ${TONES[tone]} ${className}`}
    />
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`sticker p-5 ${className}`}>{children}</div>;
}

export function Screen({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <main className={`relative flex-1 w-full max-w-md mx-auto px-4 pt-6 pb-10 flex flex-col gap-5 ${className}`}>
      <Sparkles />
      {children}
    </main>
  );
}

const SPARKLES = [
  { top: "4%", left: "6%", size: 18, delay: "0s", color: "#db2777" },
  { top: "10%", left: "88%", size: 14, delay: "0.6s", color: "#7c3aed" },
  { top: "82%", left: "10%", size: 12, delay: "1.1s", color: "#2563eb" },
  { top: "90%", left: "84%", size: 20, delay: "0.3s", color: "#db2777" },
];

export function Sparkles() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {SPARKLES.map((sparkle, index) => (
        <svg
          key={index}
          viewBox="0 0 24 24"
          width={sparkle.size}
          height={sparkle.size}
          className="absolute twinkle"
          style={{ top: sparkle.top, left: sparkle.left, animationDelay: sparkle.delay }}
        >
          <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill={sparkle.color} />
        </svg>
      ))}
    </div>
  );
}

export function Title({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h1 className={`font-display text-4xl font-bold text-ink text-center ${className}`}>{children}</h1>;
}
