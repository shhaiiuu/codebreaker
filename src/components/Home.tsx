import { useState } from 'react'
import { Users, Door } from './Icons'
import { api } from '../lib/api'
import { useProfile } from '../hooks/useProfile'
import Avatar, { AVATAR_COUNT } from './Avatar'
import Logo, { Rays } from './Logo'
import Rules from './Rules'

function Chevrons({ dir, label, onClick }: { dir: string; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={label} className="flex flex-col font-display text-4xl font-bold leading-[0.75] text-white">
      {[0, 1, 2].map((i) => <span key={i}>{dir}</span>)}
    </button>
  )
}

export default function Home({ onCreate, onEnter }: { onCreate: () => void; onEnter: (code: string) => void }) {
  const p = useProfile()
  const [joining, setJoining] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [rules, setRules] = useState(false)

  async function join() {
    if (busy) return // prevents duplicate join requests
    const room = code.trim().toUpperCase()
    if (!p.name.trim()) return setError('Enter a display name first.')
    if (room.length !== 5) return setError('Room codes have 5 characters. Check with your friend.')
    setBusy(true); setError(null)
    try {
      await api.joinRoom(room, p.name.trim())
      await api.setAvatar(room, p.avatar).catch(() => {}) // avatar is cosmetic; never block joining
      onEnter(room)
    } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }
  const step = (d: number) => p.setAvatar((p.avatar + d + AVATAR_COUNT) % AVATAR_COUNT)

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center p-4">
      <div className="space-y-4 rounded-3xl border-[3px] border-sky-400/70 bg-[#0e3bb0]/95 p-5 text-white shadow-xl">
        <Logo size="text-4xl" />
        <p className="text-center text-sm">Two players. Two secret numbers. One winner.</p>
        <div className="flex gap-2">
          <input value={p.name} maxLength={20} onChange={(e) => p.setName(e.target.value)} placeholder="Your name" aria-label="Display name" className="field flex-1" />
          <select value={p.lang} onChange={(e) => p.setLang(e.target.value)} aria-label="Language" className="field w-auto">
            <option value="en">English</option>
          </select>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Chevrons dir="‹" label="Previous avatar" onClick={() => step(-1)} />
          <Avatar id={p.avatar} size={96} />
          <Chevrons dir="›" label="Next avatar" onClick={() => step(1)} />
          <button onClick={() => p.setAvatar(Math.floor(Math.random() * AVATAR_COUNT))} aria-label="Random avatar" className="ml-2 flex items-center gap-1 self-start">
            <svg viewBox="0 0 32 32" width="38" height="38" aria-hidden="true"><rect x="3" y="3" width="26" height="26" rx="6" fill="#fff" stroke="#1b2559" strokeWidth="2.5" />
              {[[10, 10], [22, 10], [16, 16], [10, 22], [22, 22]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.4" fill="#1b2559" />)}</svg>
            <Rays size={16} />
          </button>
        </div>
        <button onClick={onCreate} className="btn btn-purple w-full rounded-2xl py-3 text-xl"><Users className="mr-2 inline h-6 w-6" />Create Room</button>
        {!joining ? (
          <button onClick={() => setJoining(true)} className="btn btn-blue w-full rounded-2xl py-3 text-xl"><Door className="mr-2 inline h-6 w-6" />Join Room</button>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); join() }} className="row-new space-y-2 rounded-2xl border-2 border-sky-200 bg-sky-100 p-3 text-navy">
            <label className="block text-sm">Enter your friend's room code
              <input value={code} maxLength={5} autoFocus onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. DWB8R"
                className="field mt-1 font-mono text-lg uppercase tracking-widest" />
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setJoining(false); setError(null) }} className="btn btn-light flex-1 text-base">Cancel</button>
              <button type="submit" disabled={busy} className="btn btn-blue flex-1 text-base">{busy ? 'Joining…' : <><Door className="mr-1 inline h-5 w-5" />Join Room</>}</button>
            </div>
          </form>
        )}
        {error && <p role="alert" className="rounded-lg bg-red-100 p-2 text-center font-bold text-red-700">{error}</p>}
        <button onClick={() => setRules(true)} className="block w-full text-center text-sm underline">Rules</button>
      </div>
      <Rules open={rules} onClose={() => setRules(false)} />
    </main>
  )
}
