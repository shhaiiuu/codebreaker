import { AVATAR_COUNT, buildAvatar, H, W, type Face } from '../lib/avatarGrid'
export { AVATAR_COUNT }

/** Pixel-art avatar. `mood` (optional) overrides the avatar's own face, e.g. happy/sad on result screens. */
export default function Avatar({ id, size = 40, mood }: { id: number; size?: number; mood?: Face }) {
  const { rows, palette } = buildAvatar(id, mood)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={size} height={size * (H / W)} role="img" aria-label={`Avatar ${id + 1}`} shapeRendering="crispEdges" className="shrink-0">
      {rows.flatMap((r, y) => [...r].map((c, x) => (c === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={palette[c]} />)))}
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
