-- Copy this file to personal/streams.local.sql, which Git ignores.
-- Replace the placeholder with your user UUID from Supabase Authentication > Users.

insert into public.streams (user_id, name, color)
values
  ('00000000-0000-0000-0000-000000000000'::uuid, 'Example Client', 'indigo'),
  ('00000000-0000-0000-0000-000000000000'::uuid, 'Example Project', 'amber')
on conflict (user_id, name) do nothing;
