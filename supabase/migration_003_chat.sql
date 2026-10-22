-- Room chat. Run ONCE in Supabase > SQL Editor > New query > Run.
-- Additive only: nothing existing is changed or dropped. Needs schema.sql (is_member) to exist already.

-- 1) Messages table. Browsers can READ their own room's messages but can never write to it directly.
create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null,
  body text not null check (char_length(body) between 1 and 300),
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_room_idx on public.chat_messages (room_id, id);

alter table public.chat_messages enable row level security;
revoke all on public.chat_messages from anon, authenticated;
grant select on public.chat_messages to authenticated;
create policy "members read chat" on public.chat_messages
  for select to authenticated using (public.is_member(room_id));

-- 2) The only way to send: checks membership, uses the caller's real identity (no impersonation), limits length and speed.
create or replace function public.send_chat(p_room uuid, p_body text) returns public.chat_messages
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_body text := btrim(coalesce(p_body, '')); v_row public.chat_messages;
begin
  if v_uid is null or not public.is_member(p_room) then raise exception 'You are not part of this room.'; end if;
  if v_body = '' then raise exception 'Type a message first.'; end if;
  if char_length(v_body) > 300 then raise exception 'Messages can be at most 300 characters.'; end if;
  if (select count(*) from public.chat_messages m
       where m.room_id = p_room and m.user_id = v_uid and m.created_at > now() - interval '10 seconds') >= 8 then
    raise exception 'Slow down a little.';
  end if;
  insert into public.chat_messages (room_id, user_id, body) values (p_room, v_uid, v_body) returning * into v_row;
  return v_row;
end $$;
revoke execute on function public.send_chat(uuid, text) from public, anon;
grant execute on function public.send_chat(uuid, text) to authenticated;

-- 3) Live updates for new messages
alter publication supabase_realtime add table public.chat_messages;

-- 4) Typing indicator: a private Realtime channel only room members may join and send on.
create policy "members receive typing" on realtime.messages
  for select to authenticated
  using (case when realtime.topic() like 'chat-typing:%'
              then public.is_member((substring(realtime.topic() from 13))::uuid) else false end);
create policy "members send typing" on realtime.messages
  for insert to authenticated
  with check (case when realtime.topic() like 'chat-typing:%'
                   then public.is_member((substring(realtime.topic() from 13))::uuid) else false end);
