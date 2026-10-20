const COLORS = ['#ff4d6d', '#ff9f1c', '#ffd23f', '#3ddc84', '#1e90ff', '#7c5cff', '#ff6bd6', '#ff4d6d', '#ff9f1c', '#3ddc84']
const OUTLINE = '-2px 0 #1b2559, 2px 0 #1b2559, 0 -2px #1b2559, 0 2px #1b2559, -2px -2px #1b2559, 2px 2px #1b2559, -2px 2px #1b2559, 2px -2px #1b2559, 0 4px #1b2559'

/** Three short hand-drawn strokes, like the sparkles beside titles in the reference. */
export function Rays({ color = '#ffd23f', flip = false, size = 22 }: { color?: string; flip?: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="shrink-0" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <g stroke={color} strokeWidth="3" strokeLinecap="round"><path d="M5 12h8" /><path d="M7 4l7 3" /><path d="M7 20l7-3" /></g>
    </svg>
  )
}

/** Chunky multicolour lettering with a dark outline. */
export function Outlined({ text, colors = COLORS, className = '' }: { text: string; colors?: string[]; className?: string }) {
  return (
    <span className={`font-display font-bold ${className}`} aria-label={text}>
      {[...text].map((c, i) => (
        <span key={i} aria-hidden="true" style={{ color: colors[i % colors.length], textShadow: OUTLINE }}>{c === ' ' ? '\u00a0' : c}</span>
      ))}
    </span>
  )
}

export default function Logo({ size = 'text-4xl', subtitle = true }: { size?: string; subtitle?: boolean }) {
  return (
    <div className="text-center leading-none">
      <div className="flex items-center justify-center gap-1">
        <Rays flip />
        <span><Outlined text="codebreaker" className={size} /><span className={`font-display font-bold text-white ${size}`} style={{ textShadow: OUTLINE }}>.io</span></span>
        <Rays />
      </div>
      {subtitle && (
        <div className="mt-2 font-display text-sm font-bold tracking-[0.25em] text-white">
          NUMBER DUEL
          <svg viewBox="0 0 120 8" className="mx-auto h-2 w-28" aria-hidden="true"><path d="M2 4q8-5 16 0t16 0 16 0 16 0 16 0 16 0 16 0" fill="none" stroke="#ffd23f" strokeWidth="2.5" strokeLinecap="round" /></svg>
        </div>
      )}
    </div>
  )
}
