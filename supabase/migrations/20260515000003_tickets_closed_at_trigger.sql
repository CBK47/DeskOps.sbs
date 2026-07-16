create or replace function public.tickets_sync_closed_at()
returns trigger language plpgsql as $$
begin
  if new.status in ('done', 'cancelled') and (old.status is distinct from new.status) then
    new.closed_at := now();
  elsif new.status not in ('done', 'cancelled') and (old.status is distinct from new.status) then
    new.closed_at := null;
  end if;
  return new;
end $$;

create trigger tickets_sync_closed_at
  before update on public.tickets
  for each row execute function public.tickets_sync_closed_at();

-- Also handle the case where a ticket is INSERTED already in a done/cancelled state.
create or replace function public.tickets_sync_closed_at_on_insert()
returns trigger language plpgsql as $$
begin
  if new.status in ('done', 'cancelled') and new.closed_at is null then
    new.closed_at := now();
  end if;
  return new;
end $$;

create trigger tickets_sync_closed_at_on_insert
  before insert on public.tickets
  for each row execute function public.tickets_sync_closed_at_on_insert();
