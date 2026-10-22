// Pixel-art avatar builder. Each of the 12 avatars has its OWN hairstyle and its OWN face,
// not just different colours. Plain TypeScript (no React) so it can be tested.
export const AVATAR_COUNT = 12
export const W = 16
export const H = 19
export type Face = 'happy' | 'sad' | 'neutral' | 'surprised' | 'wink' | 'angry' | 'cool' | 'tongue'
export const SKIN = ['#ffd9b8', '#f1c27d', '#c68642', '#8d5524', '#ffe0d0', '#e8b98a']
export const HAIR = ['#e8590c', '#3b2a20', '#f4c430', '#222831', '#8e44ad', '#2f9e44']

// o = outline, s = skin, h = hair, e = eyes/brows/glasses, m = mouth, p = tongue, . = empty
const R = (lead: number, mid: string) => '.'.repeat(lead) + 'o' + mid + 'o' + '.'.repeat(lead)
const pad = (lead: number, mid: string) => '.'.repeat(lead) + mid + '.'.repeat(W - lead - mid.length)
const S = (n: number) => 's'.repeat(n)
const h = (n: number) => 'h'.repeat(n)
const E = '.'.repeat(W)

// Head, neck and shoulders. Rows 0-1 are empty space for tall hair.
const BASE = [E, E, pad(4, 'oooooooo'), R(3, S(8)), R(2, S(10)), ...Array.from({ length: 9 }, () => R(1, S(12))),
  R(2, S(10)), R(4, S(6)), '.oo' + S(10) + 'oo.', R(1, S(12)), '.' + 'o'.repeat(14) + '.']

const CAP = [E, E, E, R(3, h(8)), R(2, h(10)), R(1, h(12)), R(1, 'hhsssssssshh')]
type Style = { rows: string[]; sides?: boolean }
const STYLES: Style[] = [
  { rows: CAP }, // 0 short cap
  { rows: [pad(4, 'o...o...o'), pad(3, 'ohohohohoho'), E, ...CAP.slice(3)] }, // 1 spiky
  { rows: [pad(6, 'oooo'), pad(6, 'ohho'), pad(6, 'ohho'), pad(6, 'ohho'), pad(6, 'ohho')] }, // 2 mohawk
  { rows: CAP, sides: true }, // 3 long hair
  { rows: [pad(5, 'oooooo'), pad(5, 'ohhhho'), pad(4, 'ohhhhhho'), ...CAP.slice(3)] }, // 4 top bun
  { rows: [pad(4, 'oooooooo'), pad(2, 'oo' + h(8) + 'oo'), R(1, h(12)), R(1, h(12)), R(1, h(12)), R(1, h(12)), R(1, 'hhsssssssshh'), R(1, 'hssssssssssh')] }, // 5 afro
  { rows: [E, E, E, R(3, h(8)), R(2, h(10)), R(1, h(12)), R(1, 'hhhhhsssssss'), R(1, 'hhhsssssssss')] }, // 6 side swoop
  { rows: [E, pad(7, 'oo'), pad(7, 'hh')] }, // 7 bald with a tuft
]

type Put = (x: number, y: number, c: string) => void
const paint = (p: Put, c: string, cells: [number, number][]) => cells.forEach(([x, y]) => p(x, y, c))
const EYES: [number, number][] = [[4, 8], [5, 8], [4, 9], [5, 9], [10, 8], [11, 8], [10, 9], [11, 9]]
const row = (y: number, from: number, to: number): [number, number][] => Array.from({ length: to - from + 1 }, (_, i) => [from + i, y])
const FACES: Record<Face, (p: Put) => void> = {
  happy: (p) => { paint(p, 'e', EYES); paint(p, 'm', [[5, 12], [10, 12], ...row(13, 6, 9)]) },
  sad: (p) => { paint(p, 'e', EYES); paint(p, 'm', [...row(12, 6, 9), [5, 13], [10, 13]]) },
  neutral: (p) => { paint(p, 'e', EYES); paint(p, 'm', row(12, 5, 10)) },
  surprised: (p) => { paint(p, 'e', EYES); paint(p, 'm', [[7, 12], [8, 12], [7, 13], [8, 13]]) },
  wink: (p) => { paint(p, 'e', [...row(9, 4, 5), [10, 8], [11, 8], [10, 9], [11, 9]]); paint(p, 'm', [[5, 12], [10, 12], ...row(13, 6, 9)]) },
  angry: (p) => { paint(p, 'e', [...row(9, 4, 5), ...row(9, 10, 11), [3, 7], [4, 7], [5, 8], [11, 7], [12, 7], [10, 8]]); paint(p, 'm', row(13, 6, 9)) },
  cool: (p) => { paint(p, 'e', [...row(8, 3, 12), ...row(9, 3, 6), ...row(9, 9, 12)]); paint(p, 'm', [...row(12, 6, 9), [10, 11]]) },
  tongue: (p) => { paint(p, 'e', EYES); paint(p, 'm', row(12, 5, 10)); paint(p, 'p', [[7, 13], [8, 13]]) },
}

// [hairstyle, face, skin colour, hair colour]: every avatar differs in shape AND expression.
const LOOKS: [number, Face, number, number][] = [
  [0, 'happy', 0, 0], [1, 'cool', 1, 3], [3, 'wink', 4, 4], [5, 'surprised', 3, 1],
  [4, 'tongue', 2, 2], [2, 'angry', 5, 5], [6, 'sad', 0, 1], [7, 'neutral', 1, 0],
  [3, 'happy', 2, 0], [0, 'surprised', 5, 4], [1, 'tongue', 3, 5], [5, 'wink', 4, 3],
]

export function lookOf(id: number) { return LOOKS[((id % AVATAR_COUNT) + AVATAR_COUNT) % AVATAR_COUNT] }

/** Returns the pixel rows plus the colour map. `mood` overrides the face (used on win/lose screens). */
export function buildAvatar(id: number, mood?: Face) {
  const [style, face, skin, hair] = lookOf(id)
  const grid = BASE.map((r) => [...r])
  const put: Put = (x, y, c) => { if (grid[y] && x >= 0 && x < W) grid[y][x] = c }
  STYLES[style].rows.forEach((r, y) => [...r].forEach((c, x) => { if (c !== '.') put(x, y, c) }))
  if (STYLES[style].sides) for (let y = 7; y <= 14; y++) for (const x of [2, 3, 12, 13]) if (grid[y][x] === 's') grid[y][x] = 'h'
  FACES[mood ?? face](put)
  const palette: Record<string, string> = { o: '#1b2559', e: '#1b2559', m: '#1b2559', p: '#ff6b81', s: SKIN[skin], h: HAIR[hair] }
  return { rows: grid.map((r) => r.join('')), palette }
}
