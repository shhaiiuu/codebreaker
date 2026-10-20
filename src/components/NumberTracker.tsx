import type { Dispatch, SetStateAction } from 'react'
import { Bulb } from './Icons'
import type { Notes } from '../hooks/useNotes'
import { MARK_UI, type Mark } from '../lib/status'
import Legend from './Legend'

const NEXT: Record<Mark, Mark> = { grey: 'green', green: 'red', red: 'yellow', yellow: 'grey' }
const GLYPH: Record<Mark, string> = { green: 'text-green-600', red: 'text-red-500', yellow: 'text-yellow-500', grey: '' }

export default function NumberTracker({ notes, setNotes }: { notes: Notes; setNotes: Dispatch<SetStateAction<Notes>> }) {
  return (
    <section className="rounded-2xl border-2 border-sky-200 bg-sky-100 p-3">
      <h2 className="flex flex-wrap items-center gap-x-2 text-lg font-bold text-sky-700">
        <Bulb className="h-7 w-7" /> Numbers Tracker <span className="text-sm font-normal text-navy">(Your View Only)</span>
      </h2>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {notes.tracker.map((m, d) => (
            <div key={d} className="flex flex-col items-center">
              <button type="button" aria-label={`Digit ${d}: ${MARK_UI[m].tracker}. Click to change.`}
                onClick={() => setNotes((n) => ({ ...n, tracker: n.tracker.map((x, j) => (j === d ? NEXT[x] : x)) }))}
                className={`${m === 'grey' ? 'bg-white' : MARK_UI[m].bg} h-12 w-9 rounded-lg border-[3px] border-black font-display text-xl font-bold shadow-[0_2px_0_#1b2559] sm:w-10`}>{d}</button>
              <span aria-hidden="true" className={`h-4 text-sm font-bold leading-4 ${GLYPH[m]}`}>{m === 'grey' ? '' : MARK_UI[m].icon}</span>
            </div>
          ))}
        </div>
        <Legend tracker />
      </div>
    </section>
  )
}
