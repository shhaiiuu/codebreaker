import { useEffect, useState } from 'react'
import type { Mark } from '../lib/status'

export type Notes = { digits: string[]; marks: Mark[]; tracker: Mark[] }
const MARK_SET = ['grey', 'green', 'red', 'yellow']
const empty = (): Notes => ({ digits: ['', '', '', ''], marks: Array<Mark>(4).fill('grey'), tracker: Array<Mark>(10).fill('grey') })

function load(key: string): Notes {
  try {
    const n = JSON.parse(localStorage.getItem(key) ?? 'null')
    const ok = n && n.digits?.length === 4 && n.marks?.length === 4 && n.tracker?.length === 10 &&
      [...n.marks, ...n.tracker].every((m: string) => MARK_SET.includes(m))
    if (ok) return n as Notes
  } catch { /* ignore */ }
  return empty()
}

/**
 * The player's PRIVATE deduction notes. They live only in this browser (localStorage) and are
 * never sent to Supabase or the opponent. Mount with a changing React `key` to switch rooms/rounds.
 */
export function useNotes(storageKey: string) {
  const [notes, setNotes] = useState<Notes>(() => load(storageKey))
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(notes)) } catch { /* ignore */ } }, [storageKey, notes])
  return [notes, setNotes] as const
}
