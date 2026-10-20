import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Guess, Player, Room } from '../lib/types'

/**
 * Loads a room and keeps it live. Strategy: whenever Realtime says "something
 * changed", re-read the room. A 5-second refresh and a refresh when the tab
 * wakes up make it recover from dropped connections.
 */
export function useRoom(code: string, uid: string) {
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [online, setOnline] = useState<Set<string>>(new Set())
  const [loaded, setLoaded] = useState(false)
  const [offline, setOffline] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const playersRef = useRef<Player[]>([])
  playersRef.current = players
  const prevCount = useRef(0)

  const flash = useCallback((text: string) => {
    setNotice(text)
    setTimeout(() => setNotice((n) => (n === text ? null : n)), 4000)
  }, [])

  const load = useCallback(async () => {
    const { data: r, error } = await supabase.from('rooms').select('*').eq('code', code).maybeSingle()
    if (error) { setOffline(true); return } // keep what we have; do not pretend the room vanished
    setOffline(false)
    if (!r) { setRoom(null); setPlayers([]); setGuesses([]); setLoaded(true); return }
    const [p, g] = await Promise.all([
      supabase.from('players').select('*').eq('room_id', r.id).order('seat'),
      supabase.from('guesses').select('*').eq('room_id', r.id).order('guess_no'),
    ])
    if (p.error || g.error) { setOffline(true); return }
    setRoom(r as Room)
    setPlayers((p.data ?? []) as Player[])
    setGuesses((g.data ?? []) as Guess[])
    setLoaded(true)
  }, [code])

  useEffect(() => {
    load()
    const timer = setInterval(load, 5000)
    const wake = () => { if (document.visibilityState === 'visible') load() }
    document.addEventListener('visibilitychange', wake)
    window.addEventListener('online', load)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', wake)
      window.removeEventListener('online', load)
    }
  }, [load])

  const roomId = room?.id
  useEffect(() => {
    if (!roomId) return
    const nameOf = (key: string) => playersRef.current.find((p) => p.user_id === key)?.name ?? 'Your opponent'
    const ch = supabase.channel(`room:${roomId}`, { config: { presence: { key: uid } } })
    ch.on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, () => load())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guesses', filter: `room_id=eq.${roomId}` }, () => load())
      .on('presence', { event: 'sync' }, () => setOnline(new Set(Object.keys(ch.presenceState()))))
      .on('presence', { event: 'join' }, (p: { key: string }) => { if (p.key !== uid) flash(`${nameOf(p.key)} is online`) })
      .on('presence', { event: 'leave' }, (p: { key: string }) => { if (p.key !== uid) flash(`${nameOf(p.key)} went offline`) })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') { await ch.track({ at: Date.now() }); load() }
      })
    return () => { supabase.removeChannel(ch) }
  }, [roomId, uid, load, flash])

  useEffect(() => {
    if (prevCount.current === 1 && players.length === 2) {
      const other = players.find((p) => p.user_id !== uid)
      if (other) flash(`${other.name} joined the room`)
    }
    prevCount.current = players.length
  }, [players, uid, flash])

  return { room, players, guesses, online, loaded, offline, notice, refresh: load }
}
