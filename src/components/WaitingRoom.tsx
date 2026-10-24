import { useState } from 'react'
import type { Player, Room } from '../lib/types'
import Avatar from './Avatar'
import { Send } from 'lucide-react'
export default function WaitingRoom({ room, me, link }: { room: Room; me?: Player; link: string }) {
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  async function copy(text: string, label: string) {
    try { await navigator.clipboard.writeText(text); setCopied(label); setError(null); setTimeout(() => setCopied(null), 2000) }
    catch { setError('Copy failed. Select the code and copy it by hand.') }
  }
  return (
    <section className="card mx-auto mt-6 max-w-md space-y-3 bg-sky-50 p-5 text-center">
      <div className="flex items-center justify-center gap-2">{me && <Avatar id={me.avatar} size={44} />}<h2 className="text-2xl font-bold">Room created!</h2></div>
      <p>Share this code or link with your friend:</p>
      <div className="rounded-xl border-[3px] border-dashed border-sky-400 bg-yellow-100 py-3 font-display text-4xl font-bold tracking-[0.3em]" aria-label={`Room code ${room.code.split('').join(' ')}`}>{room.code}</div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => copy(room.code, 'code')} className="btn btn-blue flex-1 text-base">{copied === 'code' ? '✓ Copied' : 'Copy code'}</button>
        <button onClick={() => copy(link, 'link')} className="btn btn-purple flex-1 text-base">{copied === 'link' ? '✓ Copied' : 'Copy invite link'}</button>
      </div>
      {typeof navigator.share === 'function' && (
  <button
    onClick={() => navigator.share({ title: 'Codebreaker.io', url: link }).catch(() => {})}
    className="inline-flex items-center justify-center gap-1 text-sm underline"
  >
    <Send size={14} />
    Share...
  </button>
)}
      {error && <p role="alert" className="text-sm font-bold text-red-700">{error}</p>}
      <p aria-live="polite" className="font-bold">Waiting for your friend to join…</p>
    </section>
  )
}
