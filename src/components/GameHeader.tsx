import type { Player, Room } from '../lib/types'
import { Book, Exit } from './Icons'
import Avatar from './Avatar'
import Logo, { Rays } from './Logo'

function Pill({ p, you, online }: { p?: Player; you?: boolean; online: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl border-2 border-cyan-300 bg-[#0d2a7a] px-2 py-1 text-white">
      {p ? <Avatar id={p.avatar} size={34} /> : <div className="h-9 w-9 rounded-full border-[3px] border-dashed border-slate-400" />}
      <div className="min-w-0 leading-tight">
        <div className="truncate font-bold">{p ? `${p.name}${you ? ' (You)' : ''}` : 'Waiting…'}</div>
        <div className={`text-sm ${online ? 'text-green-400' : 'text-slate-400'}`}>● {p ? (online ? 'Online' : 'Offline') : 'Not joined'}</div>
      </div>
    </div>
  )
}

export default function GameHeader({ room, me, opp, online, myTurn, onRules, onLeave }: {
  room: Room; me?: Player; opp?: Player; online: Set<string>; myTurn: boolean; onRules: () => void; onLeave: () => void
}) {
  let title = ''; let hint = ''
  if (room.status === 'lobby') { title = 'Waiting for a friend'; hint = 'Share your room code!' }
  else if (room.status === 'setup') { title = 'Pick your secret'; hint = 'Choose a 4-digit number' }
  else if (room.status === 'playing') {
    title = myTurn ? 'Your Turn' : `${opp?.name ?? 'Opponent'}'s Turn`
    hint = myTurn ? "Guess your opponent's 4-digit number!" : 'Plan your next guess while you wait.'
  }
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 lg:flex-nowrap">
      <Logo size="text-3xl" subtitle={false} />
      <div className="order-last w-full text-center lg:order-none lg:w-auto" aria-live="polite">
        {title && (
          <div className="inline-flex items-center gap-2">
            <Rays flip />
            <div className={`rounded-xl border-2 px-8 py-1 font-display text-2xl font-bold ${myTurn || room.status !== 'playing' ? 'border-violet-300 bg-[#b794ff]' : 'border-pink-300 bg-pink-200'}`}>{title}</div>
            <Rays />
          </div>
        )}
        {hint && <div className="text-sm text-white">{hint}</div>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Pill p={me} you online={!!me && online.has(me.user_id)} />
        <span className="font-display text-2xl font-bold text-yellow-300">VS</span>
        <Pill p={opp} online={!!opp && online.has(opp.user_id)} />
        <button onClick={onRules} className="rounded-xl border-2 border-sky-200 bg-blue-600 px-3 py-2 font-bold text-white"><Book className="mr-1 inline h-5 w-5" />Rules</button>
        <button onClick={onLeave} className="rounded-xl border-2 border-red-400 bg-red-500/20 px-3 py-2 font-bold text-red-300"><Exit className="mr-1 inline h-5 w-5" />Leave</button>
      </div>
    </header>
  )
}
