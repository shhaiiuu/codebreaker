# Codebreaker: Number Duel

Two-player online number-guessing game. React + TypeScript + Tailwind, with Supabase for the database, realtime sync and server-side rules.

## How it keeps secrets safe (plain English)
- Secret numbers are stored in a table (`secrets`) that browsers are **not allowed to read at all**.
- Browsers can't write to the game tables either. They can only call a few server functions (`create_room`, `join_room`, `set_secret`, `submit_guess`, `rematch`, `get_reveal`).
- Those functions check who you are, whose turn it is and whether the guess is valid, calculate the clues, and lock the room row so two simultaneous guesses are handled one at a time.
- Secrets are revealed only by `get_reveal`, and only after the game is finished.
- Your browser only ever holds the **anon/publishable key**, which is designed to be public. Never use the `service_role` / secret key in this project.

## Setup

### 1. Create the Supabase project
1. Go to supabase.com, sign up, click **New project**. Choose a name, a database password (save it somewhere), and the region nearest to you and your friend.
2. Wait about two minutes until it finishes setting up.

### 2. Create the database and turn on anonymous sign-in
1. Left menu **SQL Editor > New query**. Paste all of `supabase/schema.sql`, click **Run**. It should say "Success". If it errors, copy the error message and send it to me.
2. New query again: paste `supabase/tests.sql` (parts 1 and 2) and run. You want "clue tests passed" and "validation tests passed" in the output.
3. **Authentication > Sign In / Providers** (labelled "Providers" in some versions), turn on **Allow anonymous sign-ins**, save. Players don't make accounts. Each browser gets a private anonymous identity.
4. Verify security: in SQL Editor run `set role authenticated; select * from public.secrets;` then `reset role;`. You **must** see "permission denied". If you see rows, stop and tell me.
5. Check **Database > Publications > supabase_realtime** lists `rooms`, `players`, `guesses` (and not `secrets`).

**Already ran the original schema?** Also run `supabase/migration_002_ui.sql` once (adds avatars and the "read my own secret" function). Fresh installs don't need it: it's already at the end of `schema.sql`.

### Surprise videos
Put `win-surprise.mp4` and `lose-surprise.mp4` in `public/videos/`. Until you do, the "Click for a Surprise!" bar opens a friendly "not added yet" message.

### 3. Run it on your computer
1. Install Node.js (version 20 or newer) from nodejs.org.
2. In Supabase, **Project Settings > API** (or "API Keys"). Copy the **Project URL** and the **anon / publishable** key.
3. In this project folder: copy `.env.example` to `.env.local` and paste the two values in.
4. In a terminal in the folder run:
   ```
   npm install
   npm test
   npm run build
   npm run dev
   ```
   Open the address it prints (usually http://localhost:5173). `npm run build` also type-checks the code. If it prints errors, send them to me.

### 4. Deploy publicly (Vercel, free tier)
1. Put the folder on GitHub (create a repo, upload the files; `.env.local` is ignored by `.gitignore` and must not be uploaded).
2. On vercel.com choose **Add New > Project**, import the repo. Framework preset: **Vite**.
3. Under **Environment Variables** add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same values as before. Click **Deploy**.
4. You get an `https://something.vercel.app` address. (Netlify works the same way: build command `npm run build`, publish directory `dist`.)
5. In Supabase **Authentication > URL Configuration**, set Site URL to your Vercel address. Anonymous sign-in doesn't use redirects, so this is mainly tidiness.

### Environment variables
| Name | What it is | Secret? |
|---|---|---|
| `VITE_SUPABASE_URL` | Your project address | No |
| `VITE_SUPABASE_ANON_KEY` | Public (anon/publishable) key | No, but never swap in the service_role key |

## Two-device test checklist
Use two **different browsers or devices**. Two tabs of the same browser share one identity and will not work as two players. (A private/incognito window counts as separate.)
1. Device A: enter a name, **Create Room**, copy the invite link. Send it to device B (ideally on mobile data instead of Wi-Fi).
2. Device B: open the link, enter a name, **Join room**. A should show "B joined the room"; both show Online.
3. Both lock in secrets. Try `0123`, `1123`, `123`: each should show a friendly error. Confirm the opponent never sees your digits.
4. Game starts; exactly one device has the active guess box. The other's box is disabled.
5. Guess invalid numbers on the active device: no row added, turn unchanged.
6. Make valid guesses: both tables update on both screens, turns alternate. Check against secrets 2368: guess 1234 gives 2 / 0, guess 2567 gives 2 / 2.
7. Refresh the page on one device mid-game: you return to the same game with history.
8. Turn Wi-Fi/data off on one device for ~20 seconds, then back on: it shows "Connection lost" then recovers; the other device sees offline/online notices.
9. Guess the exact number: both screens show the winner, guess counts and both secrets.
10. Tap **Play Again** on either device: both go back to choosing new secrets and the history starts fresh.
11. Out-of-turn check (optional): the backend rejects it with "It is not your turn yet." Try it by editing the code to enable the button, or via the browser console: `supabase.rpc('submit_guess', ...)`.

## Known limits
- Rooms expire for joining after 24 hours. Old rooms are not deleted automatically (you can delete rows in the dashboard).
- Identity is per browser: clearing site data loses your seat in a running game.
- Rate limiting: turn order already limits guess speed, but there is no per-IP limit on creating rooms. For a public launch, enable CAPTCHA for anonymous sign-ins in Supabase.
- If a player never returns, the game simply waits; there is no forfeit timer.
