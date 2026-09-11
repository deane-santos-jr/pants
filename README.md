# PANTS

Place · Animal · Name · Thing · Score. The Filipino pen-and-paper game, on one phone that gets passed around.

## Play

- 2–8 players, 1–10 rounds, 20–90s per turn, optional hard letters (Q, X, Z).
- Each round shows one letter. Players take turns typing a Place, Animal, Name, and Thing that start with it.
- Reveal: 10 points for a unique answer, 5 if someone else wrote the same, 0 for blank or wrong letter. Tap any answer to reject it.
- A refresh mid-game resumes where you left off.

## Stack

Next.js 16 (App Router) · Tailwind 4 · Supabase (anonymous auth, Postgres) · Vercel · Vitest.

## Develop

```bash
pnpm install
pnpm dev
pnpm test
pnpm lint && pnpm typecheck
```

## Supabase (history + saved players)

The game works without Supabase. With it, finished matches, the player roster, and an anonymous answer bank are saved per device. Run `./scripts/supabase-setup.sh` once, then put the printed values in `.env.local` (see `.env.example`) and in the Vercel project's environment variables.

Schema lives in `supabase/migrations`. Push changes with `supabase db push`.
