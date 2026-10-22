import { useEffect, useState } from 'react'
import { Lock } from './Icons'
import { useRoom } from '../hooks/useRoom'
import { useProfile } from '../hooks/useProfile'
import { api } from '../lib/api'
import { checkNumber } from '../lib/validate'
import DigitInput from './DigitInput'
import GameBoard from './GameBoard'
import GameHeader from './GameHeader'
import Rules from './Rules'
import WaitingRoom from './WaitingRoom'
import { ChatWidget } from '../chat/ChatWidget'

export default function Room({ code, uid, onLeave }: { code: string; uid: string; onLeave: () => void }) {
  const profile = useProfile()
  const { room, players, guesses, online, loaded, offline, notice, refresh } = useRoom(code, uid)
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reveal, setReveal] = useState<Record<string, string>>({})
  const [secret, setSecret] = useState<string | null>(null)
  const [rules, setRules] = useState(false)

  const me = players.find((p) => p.user_id === uid)
  const opp = players.find((p) => p.user_id !== uid)

  // Only the caller's OWN secret comes back from this call; the server refuses anything else.
  useEffect(() => {
    if (!room || !me?.ready) { setSecret(null); return }
    let live = true
    api.getMySecret(room.id).then((s) => { if (live) setSecret(s) }).catch(() => {})
    return () => { live = false }
  }, [room?.id, room?.round, me?.ready])

  // Both secrets are fetched only after the server says the game is finished.
  useEffect(() => {
    if (room?.status === 'finished') {
      api.getReveal(room.id).then((rows) => setReveal(Object.fromEntries(rows.map((r) => [r.player_id, r.secret])))).catch(() => {})
    } else setReveal({})
  }, [room?.id, room?.status, room?.round])

  useEffect(() => { setValue(''); setError(null) }, [room?.status, room?.round])

  async function run(fn: () => Promise<unknown>): Promise<boolean> {
    if (busy) return false // blocks double taps; the server also protects against duplicates
    setBusy(true); setError(null)
    try { await fn(); await refresh(); return true } catch (e) { setError((e as Error).message); return false } finally { setBusy(false) }
  }

  if (!loaded) return <main className="p-10 text-center font-bold text-white">{offline ? 'Connection lost. Retrying…' : 'Loading room…'}</main>

  if (!room) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-3 p-4">
        <div className="card space-y-3 bg-sky-50 p-5">
          <h1 className="text-2xl font-bold">Join room {code}</h1>
          <input value={profile.name} maxLength={20} onChange={(e) => profile.setName(e.target.value)} placeholder="Your display name" aria-label="Display name" className="field" />
          <button disabled={busy || !profile.name.trim()} className="btn btn-blue w-full"
            onClick={() => run(async () => { await api.joinRoom(code, profile.name.trim()); await api.setAvatar(code, profile.avatar).catch(() => {}) })}>Join room</button>
          {error && <p role="alert" className="rounded-lg bg-red-100 p-2 text-center font-bold text-red-700">{error}</p>}
          <button onClick={onLeave} className="text-sm underline">Back to home</button>
        </div>
      </main>
    )
  }

  const round = guesses.filter((g) => g.round === room.round)
  const mine = round.filter((g) => g.user_id === uid)
  const theirs = round.filter((g) => g.user_id !== uid)
  const myTurn = room.status === 'playing' && room.current_turn === uid
  const link = `${location.origin}${location.pathname}?room=${room.code}`

  const leave = () => {
    if (room.status === 'playing' && !window.confirm('Leave this duel? You can rejoin later with the room code.')) return
    onLeave()
  }
  const submitSecret = () => {
    const m = checkNumber(value); if (m) return setError(m)
    run(() => api.setSecret(room.id, value))
  }
  const onGuess = async (g: string) => {
    if (mine.some((x) => x.guess === g)) { setError(`You already tried ${g}. Pick a new number.`); return false }
    return run(() => api.submitGuess(room.id, g))
  }

  return (
    <main className="mx-auto max-w-[1400px] p-3">
      <GameHeader room={room} me={me} opp={opp} online={online} myTurn={myTurn} onRules={() => setRules(true)} onLeave={leave} />
      {offline && <p role="status" className="mt-2 rounded-xl bg-amber-200 p-2 text-center font-bold">Connection lost. Your game is safe. Reconnecting…</p>}
      {notice && <p role="status" className="mt-2 rounded-xl bg-sky-200 p-2 text-center font-bold">{notice}</p>}

      {room.status === 'lobby' && <WaitingRoom room={room} me={me} link={link} />}

      {room.status === 'setup' && me && (
        <section className="card mx-auto mt-6 max-w-md space-y-4 bg-yellow-100 p-5 text-center">
          {!me.ready ? (
            <>
              <h2 className="text-2xl font-bold"><Lock className="mr-1 inline h-6 w-6" />Choose your secret number</h2>
              <p className="text-sm">Four different digits, not starting with 0. Your opponent never sees it.</p>
              <DigitInput value={value} onChange={setValue} onEnter={submitSecret} label="Secret number" maskable disabled={busy} />
              <button disabled={busy} onClick={submitSecret} className="btn btn-purple w-full">Lock in secret</button>
              {error && <p role="alert" className="rounded-lg bg-red-100 p-2 font-bold text-red-700">{error}</p>}
            </>
          ) : (
            <p className="py-4">Your secret is locked in. Waiting for {opp?.name ?? 'your opponent'}…</p>
          )}
        </section>
      )}

      {(room.status === 'playing' || room.status === 'finished') && (
        <GameBoard key={`${room.id}-${room.round}`} room={room} uid={uid} me={me} opp={opp} mine={mine} theirs={theirs}
          secret={secret} reveal={reveal} busy={busy} error={error} myTurn={myTurn}
          onGuess={onGuess} onRematch={() => run(() => api.rematch(room.id))} onHome={onLeave} />
      )}
      {me && opp && (
        <div className="codebreaker-chat">
          <ChatWidget roomId={room.id} uid={uid} me={me} opp={opp} oppOnline={online.has(opp.user_id)} />
        </div>
      )}
      <Rules open={rules} onClose={() => setRules(false)} />
    </main>
  )
}
