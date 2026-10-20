/** Friendly client-side check. The server repeats these rules, so this is only for speed. */
export function checkNumber(v: string): string | null {
  if (!/^\d{4}$/.test(v)) return 'Enter exactly four digits (0-9).'
  if (v[0] === '0') return 'The first digit cannot be zero.'
  if (new Set(v).size !== 4) return 'Each digit can only be used once.'
  return null
}
