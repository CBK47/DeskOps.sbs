-- A ticket must belong to a stream owned by the same account. RLS scopes the
-- visible rows, while this constraint makes the relationship itself impossible
-- to forge through a direct client request.

do $$
begin
  if exists (
    select 1
    from public.tickets ticket
    left join public.streams stream
      on stream.id = ticket.stream_id
      and stream.user_id = ticket.user_id
    where stream.id is null
  ) then
    raise exception 'Cannot add ticket stream ownership integrity: existing tickets reference a stream owned by another user.';
  end if;
end
$$;

-- PostgreSQL requires a unique target for the composite foreign key. `id` is
-- already unique, so this is a harmless, explicit ownership target.
alter table public.streams
  add constraint streams_id_user_id_key unique (id, user_id);

alter table public.tickets
  add constraint tickets_stream_owner_fkey
    foreign key (stream_id, user_id)
    references public.streams (id, user_id)
    on delete cascade;

-- The composite constraint replaces the original id-only relationship.
alter table public.tickets
  drop constraint tickets_stream_id_fkey;
