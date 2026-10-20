import type { Guess } from '../lib/types'
import { Pencil } from './Icons'

const MIN_ROWS = 10 // the game has no guess limit; rows beyond 10 are added as needed

export default function GuessHistoryPanel({ title, tone, rows }: { title: string; tone: 'lavender' | 'pink'; rows: Guess[] }) {
  const total = Math.max(MIN_ROWS, rows.length)
  const lav = tone === 'lavender'
  const cell = 'bg-slate-100 py-2 first:rounded-l-xl last:rounded-r-xl'
  return (
    <section className={`flex h-full flex-col overflow-hidden rounded-2xl border-[3px] bg-white shadow-lg ${lav ? 'border-violet-300' : 'border-pink-300'}`}>
      <h2 className={`${lav ? 'bg-[#d9ccff]' : 'bg-[#ffc9d4]'} flex items-center justify-between px-4 py-3 text-2xl font-bold`}>
        <span className="truncate">{title}</span><Pencil className="h-7 w-7" />
      </h2>
      <div className="max-h-[60vh] flex-1 overflow-y-auto p-2 lg:max-h-[75vh]">
        <table className="w-full border-separate border-spacing-y-1 text-center text-lg">
          <thead><tr><th className="py-1 font-medium">#</th><th className="font-medium">Guess</th><th className="font-medium">Digits</th><th className="font-medium">Positions</th></tr></thead>
          <tbody>
            {Array.from({ length: total }, (_, i) => {
              const g = rows[i]
              return (
                <tr key={g?.id ?? `empty-${i}`} className={g ? 'row-new' : 'text-slate-400'}>
                  <td className={cell}>{i + 1}</td>
                  <td className={`${cell} tracking-wider`}>{g?.guess ?? '–'}</td>
                  <td className={`${cell} text-sky-500`}>{g ? g.right_digits : '–'}</td>
                  <td className={`${cell} text-violet-600`}>{g ? g.right_positions : '–'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
