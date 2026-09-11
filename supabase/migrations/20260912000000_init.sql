create table public.players (
  id uuid primary key,
  owner uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 24),
  avatar smallint not null check (avatar between 0 and 11),
  created_at timestamptz not null default now()
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users (id) on delete cascade,
  played_at timestamptz not null default now(),
  rounds smallint not null check (rounds between 1 and 10),
  timer_seconds smallint not null check (timer_seconds between 20 and 90),
  results jsonb not null
);

create table public.answer_bank (
  id bigint generated always as identity primary key,
  match_id uuid not null references public.matches (id) on delete cascade,
  letter char(1) not null check (letter ~ '^[A-Z]$'),
  category text not null check (category in ('place', 'animal', 'name', 'thing')),
  answer text not null check (char_length(answer) between 1 and 80),
  is_unique boolean not null,
  is_rejected boolean not null,
  created_at timestamptz not null default now()
);

create index players_owner_idx on public.players (owner);
create index matches_owner_played_idx on public.matches (owner, played_at desc);
create index answer_bank_letter_category_idx on public.answer_bank (letter, category, answer);

alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.answer_bank enable row level security;

grant select, insert, update on table public.players to authenticated;
grant select, insert on table public.matches to authenticated;
grant insert on table public.answer_bank to authenticated;
grant usage on sequence public.answer_bank_id_seq to authenticated;

create policy "players are private to their device" on public.players
  for select to authenticated using ((select auth.uid()) = owner);
create policy "device inserts its own players" on public.players
  for insert to authenticated with check ((select auth.uid()) = owner);
create policy "device updates its own players" on public.players
  for update to authenticated using ((select auth.uid()) = owner) with check ((select auth.uid()) = owner);

create policy "matches are private to their device" on public.matches
  for select to authenticated using ((select auth.uid()) = owner);
create policy "device inserts its own matches" on public.matches
  for insert to authenticated with check ((select auth.uid()) = owner);

create policy "answers are written for matches the device owns" on public.answer_bank
  for insert to authenticated
  with check (exists (select 1 from public.matches m where m.id = match_id and m.owner = (select auth.uid())));
