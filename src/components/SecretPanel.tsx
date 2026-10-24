
import { useState } from 'react'
import { Rays } from './Logo'
import { Lock } from './Icons'

export default function SecretPanel({ secret }: { secret: string | null }) {
  const [hidden, setHidden] = useState(true)

  return (
    <section className="rounded-2xl border-2 border-yellow-300 bg-yellow-100 p-3">
      <h2 className="mb-2 flex flex-wrap items-center justify-center gap-x-2 text-lg font-bold">
        <Lock className="h-7 w-7" />
        Your Secret Number
        <span className="text-sm font-normal">
          (Only you can see this)
        </span>
      </h2>

      <div
        className="flex items-center justify-center gap-2"
        aria-label={
          secret
            ? hidden
              ? 'Your secret number is hidden'
              : `Your secret number is ${secret.split('').join(' ')}`
            : 'Your secret number is loading'
        }
      >
        <Rays color="#ff9f1c" flip />

        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex h-16 w-14 items-center justify-center rounded-xl border-[3px] border-black bg-white font-display text-4xl font-bold shadow-[0_3px_0_#1b2559]"
          >
            {secret ? (hidden ? '•' : secret[i]) : '•'}
          </div>
        ))}

        <Rays color="#ff9f1c" />
      </div>

      <button
        type="button"
        onClick={() => setHidden(!hidden)}
        className="mt-2 text-sm underline"
        aria-pressed={!hidden}
      >
        {hidden ? 'Show digits' : 'Hide digits'}
      </button>
    </section>
  )
}
