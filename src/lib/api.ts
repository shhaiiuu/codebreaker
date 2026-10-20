import { supabase } from './supabase'

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args)
  if (error) throw new Error(error.message)
  return data as T
}

export const api = {
  createRoom: (name: string) => rpc<string>('create_room', { p_name: name }),
  joinRoom: (code: string, name: string) => rpc<string>('join_room', { p_code: code, p_name: name }),
  setAvatar: (code: string, avatar: number) => rpc<void>('set_avatar', { p_code: code, p_avatar: avatar }),
  setSecret: (room: string, secret: string) => rpc<void>('set_secret', { p_room: room, p_secret: secret }),
  submitGuess: (room: string, guess: string) => rpc<unknown>('submit_guess', { p_room: room, p_guess: guess }),
  rematch: (room: string) => rpc<void>('rematch', { p_room: room }),
  getReveal: (room: string) => rpc<{ player_id: string; secret: string }[]>('get_reveal', { p_room: room }),
  getMySecret: (room: string) => rpc<string | null>('get_my_secret', { p_room: room }),
}
