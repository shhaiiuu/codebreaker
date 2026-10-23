# Codebreaker: Number Duel

Hey! Welcome to Codebreaker: Number Duel.

This is a two-player number-guessing game where you and your friend try to figure out each other's secret numbers. The catch is that you don't get to see the actual number or know exactly which digits you've guessed correctly. You have to use the clues the game gives you and figure it out yourself.

Both players choose a four-digit number, then take turns guessing. After each guess, you'll find out how many digits are correct and how many are in the right positions. Your job is to use that information to crack your opponent's number before they crack yours.

I built this game using React, TypeScript, and Tailwind CSS, with Supabase handling the database and keeping both players in sync while they play.

## How to Play

Here's how the game works:

1. First, both players choose their own secret four-digit number.
2. Your number can't start with `0`, and you can't use the same digit twice. So `2368` is valid, but `0123` and `1123` aren't.
3. Once the game starts, you and your opponent take turns guessing each other's numbers.
4. After every guess, the game gives you two clues:
   - **Correct digits:** How many digits in your guess also appear in your opponent's number, regardless of their position.
   - **Correct positions:** How many digits are already in exactly the right place.
5. Use those clues and your previous guesses to work out what the secret number could be. The game won't tell you which specific digits matched, so you'll have to figure that out yourself.
6. The first person to guess their opponent's exact number wins!

Your dashboard also keeps all your previous guesses and clues in one place, so you can look back at them and plan your next move.

## A Little About How It Works

I used Supabase to handle the online part of the game, so two players can join the same room and play together from different devices.

The game also needs to make sure that nobody can peek at the other player's secret number or submit guesses when it isn't their turn. To handle that, the important game actions are checked on the server instead of trusting whatever happens in the browser.

Secret numbers are kept separately from the information shown during the game. The server checks guesses, works out the clues, and only reveals the secret numbers once the game is over.

Players can join without creating a regular account because the game uses Supabase's anonymous sign-in feature. The browser uses the public Supabase key to connect to the project, while access to the actual game data is controlled through database permissions and server-side functions.

## Getting the Game Running

If you want to run the game on your own computer, here's what you'll need.

### 1. Set up Supabase

First, head over to [Supabase](https://supabase.com/) and create a project. Give it a name, choose a database password, and select a region.

Once the project is ready:

1. Open the **SQL Editor** in your Supabase dashboard.
2. Open `supabase/schema.sql` from the project, copy its contents, paste them into a new SQL query, and run it.
3. If your project includes `supabase/tests.sql`, run the tests and check that they pass.
4. Go to **Authentication → Sign In / Providers** and enable anonymous sign-ins.
5. Check that the `rooms`, `players`, and `guesses` tables are included in the `supabase_realtime` publication. The `secrets` table should stay out of that publication.

It's also worth checking that the database permissions prevent players from reading secret numbers directly.

If you've already set up the database, don't run everything again without checking what's already there. Depending on which version of the schema you installed, you might also need `supabase/migration_002_ui.sql` for the avatar and related UI changes.

### 2. Add the surprise videos

The game has surprise videos for the win and lose screens. If you want to use them, put these two files inside `public/videos/`:

- `win-surprise.mp4`
- `lose-surprise.mp4`

Make sure the filenames match exactly. If you haven't added the videos yet, the game should show its fallback message instead.

### 3. Run it on your computer

You'll need [Node.js](https://nodejs.org/) version 20 or newer.

After installing it, open your project folder in VS Code.

In your Supabase dashboard, find your project URL and public anon/publishable key under **Project Settings → API** or **API Keys**.

Now copy `.env.example` to `.env.local` in your project folder and add these two values:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Once that's done, open the terminal in VS Code and run:

```bash
npm install
npm test
npm run build
npm run dev
```

When the last command finishes, the terminal will show you a local address. Open it in your browser; it's usually `http://localhost:5173`.

If something doesn't work, check the terminal for the error message. That will usually give you a better idea of what needs fixing.

### 4. Share the game online

Once everything is working locally, you can put the game online so your friend can join from their own device.

I recommend using GitHub and Vercel for this.

1. Push your project to a GitHub repository.
2. Check that `.env.local` isn't included in the files you're uploading.
3. Go to [Vercel](https://vercel.com/) and import your GitHub repository.
4. Choose **Vite** as the framework preset.
5. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under Environment Variables.
6. Deploy the project and wait for Vercel to finish building it.
7. Once it's live, copy the website link and send it to your friend.

There's one more small thing to check in Supabase: open **Authentication → URL Configuration** and set the Site URL to your deployed website address.

You can use Netlify instead if you prefer. For a Vite project, the usual build command is `npm run build`, and the output folder is `dist`.

## Environment Variables

These are the two values the game needs to connect to Supabase:

| Variable | What it does |
|---|---|
| `VITE_SUPABASE_URL` | Tells the game where your Supabase project is. |
| `VITE_SUPABASE_ANON_KEY` | Lets the browser connect using the project's public key. |

Both are used by the frontend. The actual protection for your game data comes from your database permissions and server-side checks.

## Before You Play With a Friend

I'd recommend testing the game on two different browsers or devices before sharing it. Two tabs in the same browser can share the same anonymous identity, which means they might not behave like two separate players.

Here's a quick checklist:

1. Open the game on Device A, enter a name, and create a room.
2. Copy the invite link and open it on Device B.
3. Enter another name on Device B and join the room.
4. Check that both players can see when the other person joins and comes online.
5. Try invalid numbers such as `0123`, `1123`, and `123` when choosing a secret number. The game should reject them with a helpful message.
6. Make sure neither player can see the other's secret number before the game ends.
7. Check that only the player whose turn it is can submit a guess.
8. Make a few guesses and confirm that both screens show the same guesses and clues.
9. Refresh one device during the game and check that the game state and previous guesses are still there.
10. Briefly disconnect one device from the internet, reconnect it, and see whether the connection recovers.
11. Guess the exact secret number and check that both players see the winner and the final results.
12. Start a rematch and make sure the new game begins with fresh secret numbers and an empty guess history.

You can also test the clues using a known secret number. For example, if the secret number is `2368`:

- Guessing `1234` should give you 2 correct digits and 0 correct positions.
- Guessing `2567` should give you 2 correct digits and 2 correct positions.

These examples assume the game counts matching digits and exact positions separately.

## Things That Could Be Improved Later

There are a few limitations worth keeping in mind:

- Rooms stop accepting new players after 24 hours.
- Old rooms aren't automatically deleted.
- A player's identity is tied to their browser, so clearing its site data can make it difficult to return to an ongoing game.
- There isn't a per-IP limit on room creation yet, so extra abuse protection would be useful before opening the game to a larger audience.
- If a player leaves and never comes back, the game waits for them instead of automatically declaring a forfeit.

These aren't necessarily problems when you're testing with a friend, but they're worth considering if you want to make the game available to more people.

## That's It!

That's Codebreaker: Number Duel. The idea is simple: make smart guesses, pay attention to the clues, and try to figure out your opponent's number before they figure out yours.

Have fun playing, and good luck cracking the code!