import { useState } from 'react'
import { Users } from './Icons'
import { api } from '../lib/api'
import { useProfile } from '../hooks/useProfile'
import Logo from './Logo'

export default function CreatePage({ onBack, onEnter }: { onBack: () => void; onEnter: (code: string) => void }) {
  const p = useProfile()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function create() {
    if (busy) return
    if (!p.name.trim()) return setError('Enter a display name first.')
    setBusy(true); setError(null)
    try {
      const code = await api.createRoom(p.name.trim()) // real code from the server
      await api.setAvatar(code, p.avatar).catch(() => {})
      onEnter(code)
    } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }
  return (
    <main className="mx-auto min-h-screen max-w-md space-y-3 p-4">
      <button onClick={onBack} className="font-display font-bold text-white">← Back</button>
      <Logo size="text-4xl" />
      <h1 className="rounded-xl border-[3px] border-navy bg-pink-200 py-2 text-center text-2xl font-bold shadow-[0_3px_0_#1b2559]"><Users className="mr-2 inline h-6 w-6" />Create a Room</h1>
      <p className="text-center text-white">Choose your player name and create a private duel with your friend.</p>
      <div className="space-y-3 rounded-2xl border-[3px] border-sky-200 bg-sky-100 p-3">
        <form onSubmit={(e) => { e.preventDefault(); create() }} className="space-y-3">
          <label className="block text-sm">Display name
            <input value={p.name} maxLength={20} onChange={(e) => p.setName(e.target.value)} className="field mt-1" />
          </label>
          <button type="submit" disabled={busy} className="btn btn-purple w-full rounded-2xl py-3 text-xl"><Users className="mr-2 inline h-6 w-6" />{busy ? 'Creating…' : 'Create Room'}</button>
        </form>
        {error && <p role="alert" className="rounded-lg bg-red-100 p-2 text-center font-bold text-red-700">{error}</p>}
        <div className="rounded-xl border-[3px] border-dashed border-sky-400 bg-white/70 p-3 text-center">
          <p className="text-sm">After creating, you'll get a room code like this:</p>
          <div className="my-2 rounded-lg bg-pink-100 py-2 font-display text-3xl font-bold tracking-[0.35em] text-violet-700" aria-hidden="true">DWB8R</div>
          <ul className="space-y-1 text-left text-sm">
            {['Share the code or link with your friend', 'Wait for them to join', 'Start the duel and have fun!'].map((t) => (
              <li key={t} className="flex items-center gap-2"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-500 text-xs font-bold text-white">✓</span>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
