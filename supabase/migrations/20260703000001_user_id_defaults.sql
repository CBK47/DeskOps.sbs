-- Default user_id to auth.uid() at the DB level so app code doesn't need
-- to call supabase.auth.getUser() before an insert just to read the id
-- back out. That extra getUser() call triggers a session-refresh cookie
-- write, which — combined with a Server Action that also calls redirect()
-- — crashes on Cloudflare's edge runtime (next-on-pages). RLS already
-- scopes every table to auth.uid() = user_id, so this is also just a
-- more idiomatic Supabase pattern regardless of the edge-runtime quirk.

alter table public.streams alter column user_id set default auth.uid();
alter table public.tickets alter column user_id set default auth.uid();
