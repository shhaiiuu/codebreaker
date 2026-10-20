-- Run in Supabase SQL Editor AFTER schema.sql. Each block either passes silently or errors loudly.

-- 1) Clue rules (your spec examples + extremes)
do $$ begin
  assert (select right_digits    from public.compute_clues('2368','1234')) = 2, '2368/1234 digits';
  assert (select right_positions from public.compute_clues('2368','1234')) = 0, '2368/1234 positions';
  assert (select right_digits    from public.compute_clues('2368','2567')) = 2, '2368/2567 digits';
  assert (select right_positions from public.compute_clues('2368','2567')) = 2, '2368/2567 positions';
  assert (select right_digits    from public.compute_clues('2368','8632')) = 4, 'anagram digits';
  assert (select right_positions from public.compute_clues('2368','8632')) = 0, 'anagram positions';
  assert (select right_positions from public.compute_clues('2368','2368')) = 4, 'exact match';
  assert (select right_digits    from public.compute_clues('1234','5678')) = 0, 'no overlap';
  raise notice 'clue tests passed';
end $$;

-- 2) Number validation: each of these must RAISE (the block passes if all four raise)
do $$
declare bad text; n int := 0;
begin
  foreach bad in array array['0123','1123','123','12345','12a4'] loop
    begin perform public.assert_valid_number(bad); exception when others then n := n + 1; end;
  end loop;
  assert n = 5, 'all invalid numbers must be rejected';
  perform public.assert_valid_number('1234'); perform public.assert_valid_number('9071');
  raise notice 'validation tests passed';
end $$;

-- 3) Secrets are unreadable from the browser role. This MUST say "permission denied":
-- set role authenticated; select * from public.secrets; reset role;
