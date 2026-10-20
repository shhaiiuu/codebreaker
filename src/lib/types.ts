export type Status = 'lobby' | 'setup' | 'playing' | 'finished'
export type Room = {
  id: string; code: string; host_id: string; status: Status
  round: number; current_turn: string | null; winner: string | null; created_at: string
}
export type Player = { room_id: string; user_id: string; name: string; seat: number; ready: boolean; avatar: number }
export type Guess = {
  id: number; room_id: string; round: number; user_id: string
  guess_no: number; guess: string; right_digits: number; right_positions: number
}
