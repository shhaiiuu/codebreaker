import type { ReactNode } from 'react'

// Small line icons drawn as SVG (no emoji, so they look the same on every device).
type P = { className?: string }
const icon = (children: ReactNode) => ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={`shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)
export const Lock = icon(<><rect x="5" y="11" width="14" height="9" rx="2" fill="#7c5cff" stroke="#1b2559" /><path d="M8 11V8a4 4 0 018 0v3" stroke="#1b2559" /></>)
export const Bulb = icon(<><path d="M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z" fill="#ffd23f" stroke="#1b2559" /><path d="M10 19h4M10.5 21.5h3" stroke="#1b2559" /></>)
export const Pencil = icon(<><path d="M4 20l1-5L16 4l4 4L9 19z" fill="#ffb347" stroke="#1b2559" /><path d="M14 6l4 4" stroke="#1b2559" /></>)
export const Book = icon(<path d="M3 5h7a2 2 0 012 2v13a2 2 0 00-2-2H3zM21 5h-7a2 2 0 00-2 2v13a2 2 0 012-2h7z" />)
export const Exit = icon(<path d="M10 4H5a1 1 0 00-1 1v14a1 1 0 001 1h5M15 8l4 4-4 4M19 12H9" />)
export const Users = icon(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0113 0" /><circle cx="17" cy="9" r="2.5" /><path d="M17 14a5 5 0 015 5" /></>)
export const Door = icon(<path d="M14 4H6a1 1 0 00-1 1v14a1 1 0 001 1h8M10 12h10M17 9l3 3-3 3" />)
export const Plane = icon(<path d="M21 3L3 11l7 3 3 7zM10 14L21 3" />)
export const Replay = icon(<path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4" />)
export const HomeIcon = icon(<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />)
export const Play = icon(<><circle cx="12" cy="12" r="10" fill="#111" stroke="#111" /><path d="M10 8l6 4-6 4z" fill="#fff" stroke="none" /></>)
