import Link from "next/link";
import { MuteButton } from "./MuteButton";

export function TopBar({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-between">
      <Link href="/" className="font-display font-bold text-2xl text-violet-deep">
        PANTS
      </Link>
      {label && <span className="chip bg-lavender text-ink">{label}</span>}
      <MuteButton />
    </div>
  );
}
