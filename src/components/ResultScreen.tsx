import { useState } from 'react'
import type { Player } from '../lib/types'
import { LOSE_VIDEO, WIN_VIDEO } from '../lib/videos'
import Avatar from './Avatar'
import { HomeIcon, Play, Replay } from './Icons'
import { Outlined } from './Logo'
import SurpriseVideoModal from './SurpriseVideoModal'

const WIN_COLORS = ['#ffd23f', '#3ddc84', '#1e90ff', '#ff6bd6', '#ff9f1c', '#7c5cff', '#ff4d6d']
const LOSE_COLORS = ['#ff5a6a', '#ff7a7a']

/** `number` is the opponent's secret, revealed by the server only after the game is finished. */
export default function ResultScreen({ won, me, opp, number, busy, onAgain, onHome }: {
  won: boolean; me?: Player; opp?: Player; number?: string; busy: boolean; onAgain: () => void; onHome: () => void
}) {
  const [video, setVideo] = useState(false)
  const accent = won ? '#ffd23f' : '#ff5a6a'
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={won ? 'You win' : 'You lost'}>
      <div className="relative w-full max-w-md rounded-3xl border-[3px] border-sky-300 bg-[#0e3bb0]/95 p-5 text-center">
        <Outlined text={won ? 'You Win!' : 'You Lost!'} className="text-6xl" colors={won ? WIN_COLORS : LOSE_COLORS} />
        <div className="mt-3 flex items-center gap-3 rounded-2xl border-[3px] border-sky-200 bg-white p-3 text-left">
          <Avatar id={me?.avatar ?? 0} size={56} mood={won ? 'happy' : 'sad'} />
          <div className="min-w-0">
            {won ? (<><div className="truncate text-xl font-bold">{me?.name}</div><div>cracked the code!</div></>)
              : (<><div className="text-xl font-bold">Better luck next time!</div><div>The number was:</div></>)}
          </div>
        </div>
        <div className="my-3 flex justify-center gap-2" aria-label={`The number was ${number ?? 'unknown'}`}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex h-14 w-12 items-center justify-center rounded-xl border-[3px] bg-white font-display text-3xl font-bold" style={{ borderColor: accent, boxShadow: '0 3px 0 #1b2559' }}>{number ? number[i] : '•'}</div>
          ))}
        </div>
        <div className="absolute -right-4 top-24 rotate-[8deg] rounded-xl border-[3px] border-navy bg-pink-300 px-3 font-display text-3xl font-bold text-white [text-shadow:0_2px_0_#1b2559]" aria-hidden="true">GG!</div>
        <div className="grid grid-cols-2 gap-3">
          <button className="btn btn-purple" onClick={onAgain} disabled={busy}><Replay className="mr-1 inline h-5 w-5" />Play Again</button>
          <button className="btn btn-blue" onClick={onHome}><HomeIcon className="mr-1 inline h-5 w-5" />Back to Home</button>
        </div>
        <button className="btn btn-yellow mt-3 flex w-full items-center justify-center gap-2" onClick={() => setVideo(true)}><Play className="h-7 w-7" />Click for a Surprise!</button>
      </div>
      {video && <SurpriseVideoModal src={won ? WIN_VIDEO : LOSE_VIDEO} onClose={() => setVideo(false)} />}
    </div>
  )
}
