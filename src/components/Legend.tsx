import { MARKS, MARK_UI } from '../lib/status'

export default function Legend({ tracker = false }: { tracker?: boolean }) {
  return (
    <ul className="shrink-0 space-y-1 rounded-xl border-2 border-sky-300 bg-white/60 px-3 py-2 text-sm" aria-label="Color legend">
      {MARKS.map((m) => (
        <li key={m} className="flex items-center gap-2">
          <span className={`${MARK_UI[m].bg} inline-block h-5 w-5 rounded-md border-2 border-navy/60`} />{tracker ? MARK_UI[m].tracker : MARK_UI[m].label}
        </li>
      ))}
    </ul>
  )
}
