-- recurrence_anchor_day: preserves the original day-of-month for monthly/yearly
-- recurring tickets so they don't drift downward after a clamp month (e.g. Jan 31 -> Feb 28 -> Mar 31).
alter table public.tickets
  add column recurrence_anchor_day smallint;

-- For existing tickets with recurrence set, backfill from their current due_date's day.
update public.tickets
   set recurrence_anchor_day = extract(day from due_date)::smallint
 where recurrence in ('monthly', 'yearly')
   and due_date is not null
   and recurrence_anchor_day is null;

-- Trigger: when a ticket is INSERTED with a monthly/yearly recurrence and a due_date but no
-- anchor_day, derive the anchor_day from the due_date.
create or replace function public.tickets_set_recurrence_anchor()
returns trigger language plpgsql as $$
begin
  if new.recurrence in ('monthly', 'yearly')
     and new.due_date is not null
     and new.recurrence_anchor_day is null then
    new.recurrence_anchor_day := extract(day from new.due_date)::smallint;
  end if;
  return new;
end $$;

create trigger tickets_set_recurrence_anchor_on_insert
  before insert on public.tickets
  for each row execute function public.tickets_set_recurrence_anchor();
