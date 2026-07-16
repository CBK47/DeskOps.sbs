-- One-shot seeding helper. Inserts initial streams for the calling user.
-- Run from a server action after first sign-in: select public.seed_initial_streams();
create or replace function public.seed_initial_streams()
returns void
language plpgsql
security invoker
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Not authenticated'; end if;

  insert into public.streams (user_id, name, color) values
    (uid, 'Personal',           'sky'),
    (uid, 'Home',               'amber'),
    (uid, 'Career',             'indigo'),
    (uid, 'Money',              'emerald'),
    (uid, 'Health',             'lime'),
    (uid, 'Family',             'rose'),
    (uid, 'Friends',            'pink'),
    (uid, 'Fun',                'orange'),
    (uid, 'Spirituality',       'violet'),
    (uid, 'Admin',              'slate')
  on conflict (user_id, name) do nothing;
end
$$;
