
import { useEffect } from 'react'

export default function Rules({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-navy/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Rules"
    >
      <div className="card max-h-full w-full max-w-md overflow-y-auto p-6">
        <h2 className="mb-3 text-2xl font-bold">How to Play</h2>

        <ul className="list-disc space-y-2 pl-5">
          <li>
            Each player secretly chooses a <b>4-digit number</b>.
            All four digits must be different, and the number cannot start with 0.
            For example, <b>2368</b> is valid, but <b>0123</b> and <b>1123</b> are not.
          </li>

          <li>
            Players take turns guessing their opponent's secret number,
            one at a time.
          </li>

          <li>
            After each guess, the system tells you how many <b>digits are correct</b> and how many are in the <b>correct positions</b>.
          </li>

          <li>
            Use those clues to figure out your opponent's secret number.
            The system does not reveal exactly which digits are correct.
          </li>

          <li>
            The dashboard keeps track of all your previous guesses and clues, helping you figure out your next move.
          </li>

          <li>
            Your goal is to guess your opponent's exact number before
            they guess yours.
          </li>

          <li>
            <b> The first player to crack the secret number wins!!!!</b>
          </li>
        </ul>

        <button onClick={onClose} className="btn btn-purple mt-5 w-full">
          Got it
        </button>
      </div>
    </div>
  )
}
