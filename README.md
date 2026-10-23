# Codebreaker: Number Duel

Codebreaker: Number Duel is a two-player online guessing game where you try to figure out your opponent’s secret number before they figure out yours.

Each player chooses a four-digit number, and both players take turns guessing. After every guess, the game gives you clues about how many digits are correct and how many are in the correct positions. Use those clues, along with your previous guesses, to narrow down the possibilities and crack your opponent’s number.

The game is built with React, TypeScript, and Tailwind CSS. Supabase handles the database, real-time updates, and the server-side logic that keeps the game fair and protects secret numbers.

## How to Play

1. Each player secretly chooses a four-digit number.
2. The number cannot start with `0`, and no digit can be repeated. For example, `2368` is valid, but `0123` and `1123` are not.
3. Players take turns guessing their opponent’s number.
4. After each guess, the game tells you how many guessed digits appear in the secret number and how many are in exactly the right positions.
5. Use these clues and your previous guesses to plan your next move. The game won't tell you exactly which digits are correct.
6. The first player to guess the opponent’s complete secret number wins!

Your dashboard keeps track of your previous guesses and clues, helping you work out your next move.

## Keeping Secret Numbers Safe

The game uses Supabase to protect each player's secret number and make sure turns are handled correctly.

- Secret numbers are stored in a separate `secrets` table that browsers cannot read directly.
- Players cannot directly write to the game tables. Instead, the game uses server-side functions to create rooms, join games, save secret numbers, submit guesses, start rematches, and reveal the final numbers.
- The server checks each action to make sure the player is allowed to perform it and that the guess is valid.
- The server calculates the clues, so players cannot simply change the results in their browser.
- Secret numbers are revealed only after the game ends, through the `get_reveal` function.
- The browser uses only the public Supabase anon/publishable key. Never put the `service_role` key or any secret key in the frontend.

## Getting Started

### 1. Create a Supabase project

1. Go to [Supabase](https://supabase.com/) and create an account if you don't already have one.
2. Create a new project and choose a name, database password, and region.
3. Wait for the project to finish setting up.

Keep your database password somewhere safe.

### 2. Set up the database

1. Open your Supabase project and go to **SQL Editor**.
2. Create a new query, paste the contents of `supabase/schema.sql`, and run it.
3. If the project includes `supabase/tests.sql`, run its tests and check that the clue and validation tests pass.
4. Under **Authentication → Sign In / Providers**, enable anonymous sign-ins so players can join without creating accounts.
5. Check that the `rooms`, `players`, and `guesses` tables are included in the `supabase_realtime` publication. The `secrets` table should not be included.

You should also verify that authenticated users cannot read the `secrets` table directly. If you get unexpected results or an SQL error, stop and check the permissions before making the game public.

**Already set up the database?** If your existing database needs the UI changes from `supabase/migration_002_ui.sql`, run that migration once. Fresh installations may already include those changes in `schema.sql`, so check before running it again.

### 3. Add the surprise videos

If you want the surprise videos to play on the win and lose screens, place these files in `public/videos/`:

- `win-surprise.mp4`
- `lose-surprise.mp4`

If the files aren't there, the game should display its fallback message instead.

### 4. Run the game on your computer

You'll need Node.js version 20 or newer.

1. Install Node.js from [nodejs.org](https://nodejs.org/).
2. Open your Supabase project and find the project URL and anon/publishable key under **Project Settings → API** or **API Keys**.
3. In your project folder, copy `.env.example` to `.env.local`.
4. Add your Supabase details to `.env.local`:

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

5. Open a terminal in your project folder and run:

   ```bash
   npm install
   npm test
   npm run build
   npm run dev
   ```

6. Open the local address shown in your terminal, usually `http://localhost:5173`.

If a command fails, check the error message before continuing.

### 5. Put the game online

You can deploy the game using Vercel so you and your friend can play from different devices.

1. Push your project to a GitHub repository.
2. Make sure `.env.local` is not uploaded to GitHub.
3. Sign in to [Vercel](https://vercel.com/) and import your GitHub repository.
4. Select **Vite** as the framework preset.
5. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under Environment Variables.
6. Deploy the project.
7. Once deployment finishes, Vercel will give you a public URL you can share with your friend.

In Supabase, open **Authentication → URL Configuration** and set the Site URL to your deployed website address.

You can also use Netlify. The usual Vite build command is `npm run build`, and the output directory is `dist`.

## Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | The public anon/publishable key used by the frontend |

These values are intended for frontend use, but database security must still be enforced through proper permissions and server-side checks. Never replace the public key with a `service_role` key.

## Testing the Game

Before sharing the game, test it on two different browsers or devices. Two tabs in the same browser may share the same anonymous identity, so they might not behave like two separate players.

1. On Device A, enter a name and create a room.
2. Copy the room invite link and open it on Device B.
3. On Device B, enter a name and join the room.
4. Check that both players can see when the other joins and that their online status updates.
5. Try invalid secret numbers such as `0123`, `1123`, and `1234` with repeated digits where applicable. The game should show a helpful error and reject invalid numbers.
6. Confirm that neither player can see the other's secret number before the game ends.
7. Check that only the player whose turn it is can submit a guess.
8. Submit valid guesses and confirm that both screens show the same guesses and clues in the correct order.
9. Refresh one device during a game and check that the game state and guess history are restored.
10. Disconnect one device briefly, reconnect it, and check that the connection status recovers.
11. Guess the exact secret number and confirm that both players see the result and the final secrets.
12. Start a rematch and confirm that the new game begins with fresh secret numbers and an empty guess history.

The expected clue results should also be checked against the actual server-side rules. For example, if the secret number is `2368`, the guess `1234` should produce 2 matching digits and 0 exact-position matches. The guess `2567` should produce 2 matching digits and 2 exact-position matches.

## Current Limitations

- Rooms stop accepting new players after 24 hours.
- Old room records are not automatically deleted.
- Each player's identity is tied to their browser. Clearing that browser's site data may cause them to lose access to their seat in an ongoing game.
- There is no per-IP limit on room creation yet. Before a public launch, consider adding CAPTCHA and stronger abuse protection for anonymous sign-ins.
- If a player leaves and never returns, the game waits for them. There is currently no automatic forfeit timer.

## Before Launching

Test the game thoroughly on two separate devices, verify the database permissions, and make sure the deployed website uses the correct environment variables. Never expose secret keys or allow the browser to access hidden game data directly.

Have fun, and may the best codebreaker win!
