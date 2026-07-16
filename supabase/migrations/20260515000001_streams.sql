create extension if not exists "pgcrypto";

create table public.streams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default 'slate',
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index streams_user_id_idx on public.streams (user_id);

alter table public.streams enable row level security;

create policy "own streams: select" on public.streams
  for select using (auth.uid() = user_id);

create policy "own streams: insert" on public.streams
  for insert with check (auth.uid() = user_id);

create policy "own streams: update" on public.streams
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own streams: delete" on public.streams
  for delete using (auth.uid() = user_id);
