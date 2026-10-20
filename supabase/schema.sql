-- Codebreaker: Number Duel - database, security rules and server functions.
-- Paste this whole file into Supabase > SQL Editor > New query > Run.
-- Safe to re-run on a fresh project. (To start over: drop the four tables first.)

create extension if not exists pgcrypto;

-- ---------- TABLES ----------
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  host_id uuid not null,
  status text not null default 'lobby' check (status in ('lobby','setup','playing','finished')),
  round int not null default 1,
  current_turn uuid,
  winner uuid,
  created_at timestamptz not null default now()
);

create table public.players (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null,
  name text not null,
  seat int not null,
  ready boolean not null default false,
  primary key (room_id, user_id)
);

-- Secret numbers live ONLY here. No policies and no grants = browsers can never read this table.
create table public.secrets (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null,
  round int not null,
  secret text not null,
  primary key (room_id, user_id, round)
);

create table public.guesses (
  id bigint generated always as identity primary key,
  room_id uuid not null references public.rooms(id) on delete cascade,
  round int not null,
  user_id uuid not null,
  guess_no int not null,
  guess text not null,
  right_digits int not null,
  right_positions int not null,
  created_at timestamptz not null default now(),
  unique (room_id, round, user_id, guess_no),
  unique (room_id, round, user_id, guess)   -- duplicate guesses are disabled
);

-- ---------- ROW LEVEL SECURITY ----------
alter table public.rooms   enable row level security;
alter table public.players enable row level security;
alter table public.secrets enable row level security;
alter table public.guesses enable row level security;

-- Browsers get no direct write access to anything. All changes go through the functions below.
revoke all on public.rooms, public.players, public.secrets, public.guesses from anon, authenticated;
grant select on public.rooms, public.players, public.guesses to authenticated;

create function public.is_member(p_room uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.players where room_id = p_room and user_id = auth.uid());
$$;

create policy "members read room"    on public.rooms   for select to authenticated using (public.is_member(id));
create policy "members read players" on public.players for select to authenticated using (public.is_member(room_id));
create policy "members read guesses" on public.guesses for select to authenticated using (public.is_member(room_id));
-- (secrets: intentionally no policy)

-- ---------- HELPERS ----------
create function public.assert_valid_number(p text) returns void
language plpgsql immutable set search_path = public as $$
begin
  if p is null or p !~ '^[0-9]{4}$' then raise exception 'Enter exactly four digits (0-9).'; end if;
  if left(p, 1) = '0' then raise exception 'The first digit cannot be zero.'; end if;
  if (select count(distinct c) from regexp_split_to_table(p, '') as c) <> 4 then
    raise exception 'Each digit can only be used once.';
  end if;
end $$;

-- The clue rules. Both numbers have no repeated digits, so each match counts once.
create function public.compute_clues(p_secret text, p_guess text)
returns table (right_digits int, right_positions int)
language plpgsql immutable set search_path = public as $$
declare i int;
begin
  right_digits := 0; right_positions := 0;
  for i in 1..4 loop
    if position(substr(p_guess, i, 1) in p_secret) > 0 then right_digits := right_digits + 1; end if;
    if substr(p_guess, i, 1) = substr(p_secret, i, 1) then right_positions := right_positions + 1; end if;
  end loop;
  return next;
end $$;

-- ---------- GAME FUNCTIONS (the trusted backend) ----------
create function public.create_room(p_name text) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid(); v_code text; v_id uuid; v_i int;
  v_alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- no 0/O/1/I to avoid mix-ups
begin
  if v_uid is null then raise exception 'You are not signed in.'; end if;
  p_name := left(btrim(coalesce(p_name, '')), 20);
  if p_name = '' then raise exception 'Enter a display name first.'; end if;
  loop
    v_code := '';
    for v_i in 1..5 loop
      v_code := v_code || substr(v_alphabet, 1 + floor(random() * 32)::int, 1);
    end loop;
    exit when not exists (select 1 from public.rooms r where r.code = v_code);
  end loop;
  insert into public.rooms (code, host_id) values (v_code, v_uid) returning id into v_id;
  insert into public.players (room_id, user_id, name, seat) values (v_id, v_uid, p_name, 1);
  return v_code;
end $$;

create function public.join_room(p_code text, p_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_room public.rooms;
begin
  if v_uid is null then raise exception 'You are not signed in.'; end if;
  p_name := left(btrim(coalesce(p_name, '')), 20);
  if p_name = '' then raise exception 'Enter a display name first.'; end if;
  select * into v_room from public.rooms r where r.code = upper(btrim(p_code)) for update;
  if not found or v_room.created_at < now() - interval '24 hours' then
    raise exception 'Room not found or expired. Check the code.';
  end if;
  if exists (select 1 from public.players p where p.room_id = v_room.id and p.user_id = v_uid) then
    return v_room.id;  -- already in: this is a rejoin
  end if;
  if (select count(*) from public.players p where p.room_id = v_room.id) >= 2 then
    raise exception 'This room is full.';
  end if;
  insert into public.players (room_id, user_id, name, seat) values (v_room.id, v_uid, p_name, 2);
  update public.rooms set status = 'setup' where id = v_room.id;
  return v_room.id;
end $$;

create function public.set_secret(p_room uuid, p_secret text) returns void
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_room public.rooms;
begin
  select * into v_room from public.rooms r where r.id = p_room for update;   -- lock: one action at a time
  if not found or not public.is_member(p_room) then raise exception 'You are not part of this room.'; end if;
  if v_room.status <> 'setup' then raise exception 'Secrets can only be chosen before the game starts.'; end if;
  perform public.assert_valid_number(p_secret);
  if exists (select 1 from public.secrets s where s.room_id = p_room and s.user_id = v_uid and s.round = v_room.round) then
    raise exception 'You already locked in your secret.';
  end if;
  insert into public.secrets (room_id, user_id, round, secret) values (p_room, v_uid, v_room.round, p_secret);
  update public.players set ready = true where room_id = p_room and user_id = v_uid;
  if (select count(*) from public.players p where p.room_id = p_room and p.ready) = 2 then
    update public.rooms
       set status = 'playing',
           current_turn = (select p.user_id from public.players p where p.room_id = p_room order by random() limit 1)
     where id = p_room;
  end if;
end $$;

create function public.submit_guess(p_room uuid, p_guess text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid(); v_room public.rooms; v_opp uuid; v_secret text;
  v_rd int; v_rp int; v_no int; v_won boolean;
begin
  select * into v_room from public.rooms r where r.id = p_room for update;   -- makes simultaneous guesses queue up
  if not found or not public.is_member(p_room) then raise exception 'You are not part of this room.'; end if;
  if v_room.status = 'finished' then raise exception 'The game is over. Start a rematch to play again.'; end if;
  if v_room.status <> 'playing' then raise exception 'The game has not started yet.'; end if;
  if v_room.current_turn is distinct from v_uid then raise exception 'It is not your turn yet.'; end if;
  perform public.assert_valid_number(p_guess);
  if exists (select 1 from public.guesses g where g.room_id = p_room and g.round = v_room.round
             and g.user_id = v_uid and g.guess = p_guess) then
    raise exception 'You already tried %. Pick a new number.', p_guess;
  end if;

  select p.user_id into v_opp from public.players p where p.room_id = p_room and p.user_id <> v_uid;
  select s.secret into v_secret from public.secrets s
   where s.room_id = p_room and s.user_id = v_opp and s.round = v_room.round;
  if v_secret is null then raise exception 'Your opponent has no secret yet.'; end if;

  select c.right_digits, c.right_positions into v_rd, v_rp from public.compute_clues(v_secret, p_guess) c;
  select count(*) + 1 into v_no from public.guesses g
   where g.room_id = p_room and g.round = v_room.round and g.user_id = v_uid;
  insert into public.guesses (room_id, round, user_id, guess_no, guess, right_digits, right_positions)
  values (p_room, v_room.round, v_uid, v_no, p_guess, v_rd, v_rp);

  v_won := (p_guess = v_secret);
  if v_won then
    update public.rooms set status = 'finished', winner = v_uid, current_turn = null where id = p_room;
  else
    update public.rooms set current_turn = v_opp where id = p_room;
  end if;
  return jsonb_build_object('right_digits', v_rd, 'right_positions', v_rp, 'won', v_won);
end $$;

create function public.rematch(p_room uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_room public.rooms;
begin
  select * into v_room from public.rooms r where r.id = p_room for update;
  if not found or not public.is_member(p_room) then raise exception 'You are not part of this room.'; end if;
  if v_room.status = 'setup' then return; end if;   -- the other player already started it
  if v_room.status <> 'finished' then raise exception 'The game is not finished yet.'; end if;
  delete from public.secrets where room_id = p_room;
  update public.players set ready = false where room_id = p_room;
  update public.rooms set status = 'setup', round = round + 1, current_turn = null, winner = null where id = p_room;
end $$;

-- Only works once the game is finished.
create function public.get_reveal(p_room uuid) returns table (player_id uuid, secret text)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_member(p_room) then raise exception 'You are not part of this room.'; end if;
  if not exists (select 1 from public.rooms r where r.id = p_room and r.status = 'finished') then
    raise exception 'Secrets are hidden until the game ends.';
  end if;
  return query
    select s.user_id, s.secret from public.secrets s
    join public.rooms r on r.id = s.room_id and r.round = s.round
    where s.room_id = p_room;
end $$;

-- Only signed-in (including anonymous) users may call the functions.
revoke execute on function public.create_room(text), public.join_room(text, text), public.set_secret(uuid, text),
  public.submit_guess(uuid, text), public.rematch(uuid), public.get_reveal(uuid) from public, anon;
grant execute on function public.create_room(text), public.join_room(text, text), public.set_secret(uuid, text),
  public.submit_guess(uuid, text), public.rematch(uuid), public.get_reveal(uuid) to authenticated;

-- ---------- REALTIME ----------
alter publication supabase_realtime add table public.rooms, public.players, public.guesses;
-- (secrets is deliberately NOT published)

-- ---------- UI UPDATE (avatars, own-secret read) ----------
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
