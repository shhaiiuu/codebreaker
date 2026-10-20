import { useEffect } from 'react'

export default function Rules({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-navy/70 p-4" role="dialog" aria-modal="true" aria-label="Rules">
      <div className="card max-h-full w-full max-w-md overflow-y-auto p-6">
        <h2 className="mb-3 text-2xl font-bold">How to play</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Each player secretly picks a four-digit number. No zero first, no repeated digits (2368 works, 0123 and 1123 do not).</li>
          <li>Take turns guessing your opponent's number.</li>
          <li><b>Digits</b> counts guessed digits that appear anywhere in their number.</li>
          <li><b>Positions</b> counts guessed digits in exactly the right place.</li>
          <li>You only see the two counts, never which digits matched.</li>
          <li>The planner and Numbers Tracker are your private notes. Only you see them.</li>
          <li>First to guess the exact number wins.</li>
        </ul>
        <button onClick={onClose} className="btn btn-purple mt-5 w-full">Got it</button>
      </div>
    </div>
  )
}
