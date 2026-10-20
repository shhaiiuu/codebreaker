import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { Bulb, Plane } from './Icons'
import type { Notes } from '../hooks/useNotes'
import { checkNumber } from '../lib/validate'
import { MARKS, MARK_UI, type Mark } from '../lib/status'
import Legend from './Legend'
import { Rays } from './Logo'

type Props = {
  notes: Notes; setNotes: Dispatch<SetStateAction<Notes>>
  canSubmit: boolean; busy: boolean; error: string | null
  onSubmit: (guess: string) => Promise<boolean>
}
const TRI: Record<Mark, string> = { green: 'text-green-500', red: 'text-red-400', yellow: 'text-yellow-400', grey: 'text-slate-400' }

export default function Planner({ notes, setNotes, canSubmit, busy, error, onSubmit }: Props) {
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const { digits, marks } = notes

  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open])

  const setDigit = (i: number, d: string) => {
    setLocalError(null)
    setNotes((n) => ({ ...n, digits: n.digits.map((x, j) => (j === i ? d : x)) }))
    if (d) setActive(Math.min(i + 1, 3))
  }
  const setMark = (m: Mark) => setNotes((n) => ({ ...n, marks: n.marks.map((x, j) => (j === active ? m : x)) }))

  async function submit() {
    const guess = digits.join('')
    const problem = checkNumber(guess)
    if (problem) { setLocalError(problem); return }
    if (await onSubmit(guess)) {
      setLocalError(null); setActive(0); setOpen(false)
      setNotes((n) => ({ ...n, digits: ['', '', '', ''], marks: Array<Mark>(4).fill('grey') })) // tracker notes stay
    }
  }

  return (
    <section className="rounded-2xl border-2 border-sky-200 bg-sky-100 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <div className="min-w-0">
          <h2 className="flex flex-wrap items-center gap-x-2 text-lg font-bold text-sky-700">
            <Bulb className="h-7 w-7" /> Plan Your Next Guess <span className="text-sm font-normal text-navy">(Only you can see this)</span>
          </h2>
          <p className="text-sm">Click a box to set a digit and color based on your deduction:</p>
        </div>
        <Legend />
      </div>

      <div className="relative mt-2 flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          {digits.map((d, i) => (
            <div key={i} className="flex flex-col items-center">
              <button type="button" onClick={() => { setActive(i); setOpen(true) }}
                aria-label={`Slot ${i + 1}: ${d || 'empty'}, ${MARK_UI[marks[i]].label}`} aria-pressed={active === i && open}
                onKeyDown={(e) => {
                  if (/^\d$/.test(e.key)) { setActive(i); setDigit(i, e.key) }
                  else if (e.key === 'Backspace' || e.key === 'Delete') setDigit(i, '')
                  else if (e.key === 'Enter') submit()
                }}
                className={`${d ? MARK_UI[marks[i]].bg : 'bg-white'} flex h-16 w-14 flex-col items-center justify-center rounded-xl border-[3px] font-display text-3xl font-bold shadow-[0_3px_0_#1b2559]
                  ${active === i && open ? 'border-violet-600' : 'border-black'}`}>
                <span className={d ? '' : 'text-slate-400'}>{d || '–'}</span>
              </button>
              <span aria-hidden="true" className={`mt-1 text-lg leading-none ${TRI[marks[i]]}`}>▼</span>
            </div>
          ))}
        </div>
        <div className="flex items-center self-center">
          <Rays color="#7c5cff" flip />
          <button type="button" onClick={submit} disabled={!canSubmit || busy} className="btn btn-purple px-8 py-3 text-lg"><Plane className="mr-1 inline h-5 w-5" />{busy ? 'Sending…' : 'Submit Guess'}</button>
          <Rays color="#7c5cff" />
        </div>

        {open && (
          <div className="card absolute left-0 top-[5.5rem] z-10 w-72 max-w-full space-y-2 p-3" role="group" aria-label={`Edit slot ${active + 1}`}>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: 10 }, (_, d) => (
                <button key={d} type="button" onClick={() => setDigit(active, String(d))} aria-label={`Set slot ${active + 1} to ${d}`}
                  className={`h-8 w-8 rounded-lg border-2 border-black font-display font-bold ${digits[active] === String(d) ? 'bg-violet-300' : 'bg-white'}`}>{d}</button>
              ))}
              <button type="button" onClick={() => setDigit(active, '')} className="rounded-lg border-2 border-black bg-white px-2 text-sm">Clear</button>
            </div>
            <div className="flex flex-wrap gap-1">
              {MARKS.map((m) => (
                <button key={m} type="button" onClick={() => setMark(m)} aria-pressed={marks[active] === m}
                  className={`${MARK_UI[m].bg} rounded-lg border-2 px-2 text-sm ${marks[active] === m ? 'border-black font-bold ring-2 ring-navy' : 'border-slate-400'}`}>{MARK_UI[m].icon} {MARK_UI[m].label}</button>
              ))}
            </div>
            <button type="button" onClick={() => setOpen(false)} className="btn btn-light w-full py-1 text-sm">Done</button>
          </div>
        )}
      </div>

      <p className="mt-1 text-sm">4 digits &nbsp;•&nbsp; No repeating digits &nbsp;•&nbsp; Cannot start with 0</p>
      {!canSubmit && <p className="text-sm font-bold">Wait for your turn. You can keep planning!</p>}
      {(localError ?? error) && <p role="alert" className="mt-1 rounded-lg bg-red-100 p-2 text-center font-bold text-red-700">{localError ?? error}</p>}
    </section>
  )
}
