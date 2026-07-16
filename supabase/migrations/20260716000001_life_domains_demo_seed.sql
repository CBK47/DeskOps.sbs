create type public.life_domain as enum (
  'health',
  'career',
  'money',
  'family',
  'love',
  'friends',
  'fun',
  'spirituality'
);

alter table public.streams
  add column life_domain public.life_domain;

-- A neutral, idempotent setup for the public Build Week demo.
create or replace function public.seed_initial_streams()
returns void
language plpgsql
security invoker
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Not authenticated'; end if;

  insert into public.streams (user_id, name, color, life_domain) values
    (uid, 'Health',      'lime',    'health'),
    (uid, 'Career',      'indigo',  'career'),
    (uid, 'Money',       'emerald', 'money'),
    (uid, 'Family',      'rose',    'family'),
    (uid, 'Love',        'pink',    'love'),
    (uid, 'Friends',     'sky',     'friends'),
    (uid, 'Fun',         'orange',  'fun'),
    (uid, 'Spirituality','violet',  'spirituality'),
    (uid, 'Home',        'amber',   null),
    (uid, 'Admin',       'slate',   null)
  on conflict (user_id, name) do update
    set color = excluded.color,
        life_domain = excluded.life_domain;
end
$$;

create or replace function public.seed_demo_tickets()
returns void
language plpgsql
security invoker
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Not authenticated'; end if;

  perform public.seed_initial_streams();

  insert into public.tickets (
    user_id, stream_id, title, notes, status, priority, due_date, recurrence
  )
  select
    uid,
    streams.id,
    demo.title,
    demo.notes,
    demo.status::public.ticket_status,
    demo.priority::public.ticket_priority,
    current_date + demo.due_offset,
    demo.recurrence::public.recurrence_rule
  from (
    values
      ('Health', 'Book annual health check', 'Choose a convenient appointment.', 'open', 'high', 5, 'none'),
      ('Health', 'Take a restorative walk', 'A short walk after lunch.', 'done', 'low', -2, 'weekly'),
      ('Career', 'Prepare project handover', 'Summarise completed work and next steps.', 'done', 'high', -1, 'none'),
      ('Career', 'Review next week priorities', 'Protect time for focused work.', 'open', 'medium', 2, 'weekly'),
      ('Money', 'Review monthly budget', 'Check recurring costs before month end.', 'open', 'medium', -3, 'monthly'),
      ('Money', 'File expense receipts', 'Add the last three receipts.', 'done', 'low', -4, 'none'),
      ('Family', 'Plan Sunday lunch', 'Confirm who is bringing what.', 'open', 'medium', 3, 'weekly'),
      ('Family', 'Call a family member', 'Catch up without multitasking.', 'done', 'low', -5, 'weekly'),
      ('Love', 'Plan a screen-free evening', 'Choose something simple to do together.', 'open', 'medium', 4, 'weekly'),
      ('Friends', 'Reply to group message', 'Suggest two dates to meet.', 'open', 'low', -1, 'none'),
      ('Friends', 'Arrange a coffee catch-up', 'Pick a local place.', 'done', 'low', -6, 'none'),
      ('Fun', 'Choose a weekend activity', 'Keep it low-pressure and enjoyable.', 'open', 'low', 6, 'weekly'),
      ('Spirituality', 'Journal for ten minutes', 'Write down what is taking up space.', 'open', 'low', 1, 'daily'),
      ('Home', 'Renew home insurance', 'Compare renewal before the deadline.', 'open', 'high', -2, 'yearly'),
      ('Home', 'Replace kitchen light bulb', 'Buy the correct fitting.', 'done', 'low', -7, 'none'),
      ('Admin', 'Update emergency contacts', 'Confirm phone numbers are current.', 'open', 'medium', 8, 'yearly')
  ) as demo(stream_name, title, notes, status, priority, due_offset, recurrence)
  join public.streams on streams.user_id = uid and streams.name = demo.stream_name
  where not exists (
    select 1
    from public.tickets existing
    where existing.user_id = uid and existing.title = demo.title
  );
end
$$;
