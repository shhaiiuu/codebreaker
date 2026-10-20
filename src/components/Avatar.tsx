export const AVATAR_COUNT = 12
const SKIN = ['#ffd9b8', '#f1c27d', '#c68642', '#8d5524', '#ffe0d0', '#e8b98a']
const HAIR = ['#e8590c', '#3b2a20', '#f4c430', '#222831', '#8e44ad', '#2f9e44']
type Mood = 'happy' | 'sad' | 'neutral'

// 16-wide pixel grid. o = outline, s = skin, h = hair, e = eye, m = mouth.
const R = (lead: number, mid: string) => '.'.repeat(lead) + 'o' + mid + 'o' + '.'.repeat(lead)
const S = (n: number) => 's'.repeat(n)
const TOP = ['....oooooooo....', R(3, 'h'.repeat(8)), R(2, 'h'.repeat(10)), R(1, 'h'.repeat(12)), R(1, 'hhsssssssshh'), R(1, S(12)),
  R(1, 'sseesssseess'), R(1, 'sseesssseess'), R(1, S(12)), R(1, S(12))]
const MOUTH: Record<Mood, string[]> = {
  happy: [R(1, 'sssmssssmsss'), R(1, 'ssssmmmmssss')],
  sad: [R(1, 'ssssmmmmssss'), R(1, 'sssmssssmsss')],
  neutral: [R(1, 'ssssmmmmssss'), R(1, S(12))],
}
const BOTTOM = [R(2, S(10)), R(4, S(6)), '.oo' + S(10) + 'oo.', R(1, S(12)), '.' + 'o'.repeat(14) + '.']

export default function Avatar({ id, size = 40, mood = 'happy' }: { id: number; size?: number; mood?: Mood }) {
  const col: Record<string, string> = { o: '#1b2559', e: '#1b2559', m: '#1b2559', s: SKIN[id % 6], h: HAIR[Math.floor(id / 2) % 6] }
  const rows = [...TOP, ...MOUTH[mood], ...BOTTOM]
  return (
    <svg viewBox="0 0 16 17" width={size} height={size * (17 / 16)} role="img" aria-label={`Avatar ${id + 1}`} shapeRendering="crispEdges" className="shrink-0">
      {rows.flatMap((r, y) => [...r].map((c, x) => (c === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={col[c]} />)))}
    </svg>
  )
}

/** The white crowned mascot used on result screens. */
export function Mascot({ sad = false, size = 90 }: { sad?: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 80 90" width={size} height={size * 1.1} role="img" aria-label={sad ? 'Sad mascot' : 'Cheering mascot'}>
      <path d="M14 52Q10 18 40 18Q70 18 66 52Q70 82 40 82Q10 82 14 52Z" fill="#fff" stroke="#1b2559" strokeWidth="3" />
      <path d="M26 22L30 6L36 16L40 4L44 16L50 6L54 22Z" fill="#ffd23f" stroke="#1b2559" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="31" cy="48" r="3" fill="#1b2559" /><circle cx="49" cy="48" r="3" fill="#1b2559" />
      <path d={sad ? 'M32 64Q40 57 48 64' : 'M31 58Q40 70 49 58Z'} fill={sad ? 'none' : '#ff6b81'} stroke="#1b2559" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="24" cy="58" r="4" fill="#ffb3c1" opacity="0.8" /><circle cx="56" cy="58" r="4" fill="#ffb3c1" opacity="0.8" />
    </svg>
  )
}
