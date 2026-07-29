-- Run this once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run)

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  sync_code text not null,
  title text not null default '',
  platform text default 'PC',
  category text default 'Uncategorized',
  status text default 'Backlog',
  progress int default 0,
  rating int default 0,
  playtime text default '',
  achievements text default '',
  cover_image text default '',
  release_year text default '',
  description text default '',
  genres jsonb default '[]',
  session_log jsonb default '[]',
  created_at bigint,
  updated_at bigint
);

create index if not exists games_sync_code_idx on games (sync_code);

-- Row Level Security: enabled, but with a fully open policy. This app has
-- no login system — access is only gated by knowing the sync code, which
-- the app checks client-side. Anyone with your Supabase anon key (which is
-- necessarily public in a client-only app like this one) can technically
-- query any row directly, bypassing that check. That's an acceptable
-- tradeoff for a personal game-backlog tracker, but don't put anything
-- sensitive in this table.
alter table games enable row level security;

drop policy if exists "Allow all access" on games;

create policy "Allow all access" on games
  for all
  using (true)
  with check (true);

-- If you already created this table before the `achievements` column
-- existed, run just this one line to add it instead of the whole script:
-- alter table games add column if not exists achievements text default '';
