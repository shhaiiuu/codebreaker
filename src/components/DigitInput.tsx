import { useRef, useState } from 'react'

type Props = { value: string; onChange: (v: string) => void; onEnter: () => void; label: string; disabled?: boolean; maskable?: boolean }

/** Four digit boxes over one real input, so phones show a number keypad. Used for the secret number. */
export default function DigitInput({ value, onChange, onEnter, label, disabled, maskable }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const [hidden, setHidden] = useState(!!maskable)
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" onClick={() => ref.current?.focus()}>
        <div className="flex gap-2" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`flex h-16 w-14 items-center justify-center rounded-xl border-[3px] bg-white font-display text-3xl font-bold shadow-[0_3px_0_#1b2559]
              ${i === value.length && !disabled ? 'border-violet-600' : 'border-black'} ${disabled ? 'opacity-50' : ''}`}>
              {value[i] ? (hidden ? '•' : value[i]) : ''}
            </div>
          ))}
        </div>
        <input ref={ref} aria-label={label} inputMode="numeric" autoComplete="off" maxLength={4} value={value} disabled={disabled}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
          onKeyDown={(e) => { if (e.key === 'Enter') onEnter() }}
          className="absolute inset-0 h-full w-full cursor-text opacity-0" />
      </div>
      {maskable && <button type="button" onClick={() => setHidden(!hidden)} className="text-sm underline">{hidden ? 'Show digits' : 'Hide digits'}</button>}
    </div>
  )
}
