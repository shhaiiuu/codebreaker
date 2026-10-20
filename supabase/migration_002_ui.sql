-- Run this ONCE in Supabase SQL Editor if you already ran the original schema.sql.
-- (Fresh installs: it is already appended to schema.sql, nothing extra to run.)
-- Additive only: no game rule, scoring, turn or validation function is changed.

alter table public.players add column if not exists avatar int not null default 0;

-- Saves the caller's chosen avatar (0-11) after create_room / join_room.
create or replace function public.set_avatar(p_code text, p_avatar int) returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.players p
     set avatar = greatest(0, least(coalesce(p_avatar, 0), 11))
   where p.user_id = auth.uid()
     and p.room_id = (select r.id from public.rooms r where r.code = upper(btrim(p_code)));
end $$;

-- Returns ONLY the caller's own secret for the current round. Never anyone else's.
create or replace function public.get_my_secret(p_room uuid) returns text
language plpgsql security definer set search_path = public as $$
declare v_secret text;
begin
  if not public.is_member(p_room) then raise exception 'You are not part of this room.'; end if;
  select s.secret into v_secret
    from public.secrets s
    join public.rooms r on r.id = s.room_id and r.round = s.round
   where s.room_id = p_room and s.user_id = auth.uid();
  return v_secret;
end $$;

revoke execute on function public.set_avatar(text, int), public.get_my_secret(uuid) from public, anon;
grant execute on function public.set_avatar(text, int), public.get_my_secret(uuid) to authenticated;
