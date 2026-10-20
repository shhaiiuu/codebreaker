import { useNotes } from '../hooks/useNotes'
import type { Guess, Player, Room } from '../lib/types'
import GuessHistoryPanel from './GuessHistoryPanel'
import NumberTracker from './NumberTracker'
import Planner from './Planner'
import ResultScreen from './ResultScreen'
import SecretPanel from './SecretPanel'

type Props = {
  room: Room; uid: string; me?: Player; opp?: Player; mine: Guess[]; theirs: Guess[]
  secret: string | null; reveal: Record<string, string>; busy: boolean; error: string | null; myTurn: boolean
  onGuess: (g: string) => Promise<boolean>; onRematch: () => void; onHome: () => void
}

/** Rendered with key={room.id-round} so private notes load fresh for each round. */
export default function GameBoard(p: Props) {
  const { room, uid, me, opp } = p
  const [notes, setNotes] = useNotes(`cb_notes_${room.id}_${room.round}_${uid}`)
  const won = room.winner === uid
  const cracked = opp ? p.reveal[opp.user_id] : undefined // opponent's secret, only after the game ends

  return (
    <>
      <div className="mt-3 flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]">
        <div className="order-2 lg:order-1"><GuessHistoryPanel title="Your Guesses" tone="lavender" rows={p.mine} /></div>
        <div className="order-1 flex flex-col gap-3 rounded-3xl border-[3px] border-sky-200 bg-white p-2 shadow-lg lg:order-2">
          <SecretPanel secret={p.secret} />
          <Planner notes={notes} setNotes={setNotes} canSubmit={p.myTurn} busy={p.busy} error={p.error} onSubmit={p.onGuess} />
          <NumberTracker notes={notes} setNotes={setNotes} />
        </div>
        <div className="order-3"><GuessHistoryPanel title={`${opp?.name ?? 'Opponent'}'s Guesses`} tone="pink" rows={p.theirs} /></div>
      </div>
      {room.status === 'finished' && <ResultScreen won={won} me={me} opp={opp} number={cracked} busy={p.busy} onAgain={p.onRematch} onHome={p.onHome} />}
    </>
  )
}
