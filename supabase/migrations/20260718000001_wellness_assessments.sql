-- Additive Wellness Wheel model. The legacy public.life_domain enum remains
-- unchanged so existing streams and queue-health history are never relabelled.
create type public.wellness_dimension as enum (
  'physical',
  'emotional',
  'intellectual',
  'social',
  'spiritual',
  'occupational',
  'environmental',
  'financial'
);

create type public.wellness_focus_state as enum (
  'active_focus',
  'background',
  'not_tracking'
);

create type public.wellness_reminder as enum (
  'never',
  'monthly',
  'quarterly',
  'custom'
);

create type public.wellness_assessment_status as enum ('completed', 'skipped');

create table public.wellness_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  status public.wellness_assessment_status not null default 'completed',
  reminder public.wellness_reminder not null default 'never',
  custom_reminder_days smallint,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  constraint wellness_custom_reminder_days_check check (
    (reminder = 'custom' and custom_reminder_days between 7 and 365)
    or (reminder <> 'custom' and custom_reminder_days is null)
  )
);

create table public.wellness_assessment_entries (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  dimension public.wellness_dimension not null,
  current_rating smallint,
  desired_rating smallint,
  focus_state public.wellness_focus_state not null,
  areas text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (assessment_id, dimension),
  constraint wellness_entry_assessment_owner_fkey
    foreign key (assessment_id, user_id)
    references public.wellness_assessments(id, user_id)
    on delete cascade,
  constraint wellness_current_rating_check check (current_rating between 1 and 10),
  constraint wellness_desired_rating_check check (desired_rating between 1 and 10),
  constraint wellness_area_count_check check (cardinality(areas) <= 8)
);

create index wellness_assessments_user_created_idx
  on public.wellness_assessments (user_id, created_at desc);
create index wellness_entries_user_assessment_idx
  on public.wellness_assessment_entries (user_id, assessment_id);

alter table public.wellness_assessments enable row level security;
alter table public.wellness_assessment_entries enable row level security;

create policy "own wellness assessments: select" on public.wellness_assessments
  for select using (auth.uid() = user_id);
create policy "own wellness assessments: insert" on public.wellness_assessments
  for insert with check (auth.uid() = user_id);
create policy "own wellness assessments: update" on public.wellness_assessments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own wellness assessments: delete" on public.wellness_assessments
  for delete using (auth.uid() = user_id);

create policy "own wellness entries: select" on public.wellness_assessment_entries
  for select using (auth.uid() = user_id);
create policy "own wellness entries: insert" on public.wellness_assessment_entries
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.wellness_assessments assessment
      where assessment.id = assessment_id and assessment.user_id = auth.uid()
    )
  );
create policy "own wellness entries: update" on public.wellness_assessment_entries
  for update using (auth.uid() = user_id) with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.wellness_assessments assessment
      where assessment.id = assessment_id and assessment.user_id = auth.uid()
    )
  );
create policy "own wellness entries: delete" on public.wellness_assessment_entries
  for delete using (auth.uid() = user_id);

-- Save one complete snapshot atomically. The active-focus count is based on
-- the person's explicit choice, never on rating gaps.
create or replace function public.save_wellness_assessment(
  p_entries jsonb,
  p_reminder public.wellness_reminder,
  p_custom_reminder_days smallint default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  new_assessment_id uuid;
  active_focus_count integer;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  if jsonb_typeof(p_entries) <> 'array' or jsonb_array_length(p_entries) = 0 then
    raise exception 'Choose at least one dimension';
  end if;

  select count(*) into active_focus_count
  from jsonb_array_elements(p_entries) entry
  where entry->>'focus_state' = 'active_focus';

  if active_focus_count < 1 or active_focus_count > 3 then
    raise exception 'Choose between one and three active focus areas';
  end if;

  insert into public.wellness_assessments (user_id, status, reminder, custom_reminder_days)
  values (uid, 'completed', p_reminder, p_custom_reminder_days)
  returning id into new_assessment_id;

  insert into public.wellness_assessment_entries (
    assessment_id,
    user_id,
    dimension,
    current_rating,
    desired_rating,
    focus_state,
    areas
  )
  select
    new_assessment_id,
    uid,
    (entry->>'dimension')::public.wellness_dimension,
    nullif(entry->>'current_rating', '')::smallint,
    nullif(entry->>'desired_rating', '')::smallint,
    (entry->>'focus_state')::public.wellness_focus_state,
    coalesce(
      array(select jsonb_array_elements_text(coalesce(entry->'areas', '[]'::jsonb))),
      '{}'
    )
  from jsonb_array_elements(p_entries) entry;

  return new_assessment_id;
end
$$;

create or replace function public.skip_wellness_assessment()
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  new_assessment_id uuid;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  insert into public.wellness_assessments (user_id, status, reminder)
  values (uid, 'skipped', 'never')
  returning id into new_assessment_id;
  return new_assessment_id;
end
$$;
