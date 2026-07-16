create type public.ticket_status   as enum ('open','in_progress','done','cancelled');
create type public.ticket_priority as enum ('low','medium','high','urgent');
create type public.recurrence_rule as enum ('none','daily','weekly','monthly','yearly');

create table public.tickets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id)       on delete cascade,
  stream_id    uuid not null references public.streams(id)   on delete cascade,
  title        text not null,
  notes        text,
  status       public.ticket_status   not null default 'open',
  priority     public.ticket_priority not null default 'medium',
  due_date     date,
  recurrence   public.recurrence_rule not null default 'none',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  closed_at    timestamptz
);

create index tickets_user_id_idx          on public.tickets (user_id);
create index tickets_stream_id_idx        on public.tickets (stream_id);
create index tickets_open_due_idx         on public.tickets (status, due_date)
  where status in ('open','in_progress');

create or replace function public.tickets_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger tickets_set_updated_at
  before update on public.tickets
  for each row execute function public.tickets_set_updated_at();

alter table public.tickets enable row level security;

create policy "own tickets: select" on public.tickets
  for select using (auth.uid() = user_id);

create policy "own tickets: insert" on public.tickets
  for insert with check (auth.uid() = user_id);

create policy "own tickets: update" on public.tickets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own tickets: delete" on public.tickets
  for delete using (auth.uid() = user_id);
