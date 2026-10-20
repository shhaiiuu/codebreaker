export type Mark = 'grey' | 'green' | 'red' | 'yellow'
export const MARKS: Mark[] = ['green', 'red', 'yellow', 'grey']
// Colour is never the only signal: every state also has an icon and a label.
export const MARK_UI: Record<Mark, { bg: string; icon: string; label: string; tracker: string }> = {
  green: { bg: 'bg-green-300', icon: '✓', label: 'Correct (confirmed)', tracker: 'Used (confirmed)' },
  red: { bg: 'bg-red-300', icon: '✕', label: 'Excluded', tracker: 'Excluded' },
  yellow: { bg: 'bg-yellow-200', icon: '?', label: 'Possible', tracker: 'Possible' },
  grey: { bg: 'bg-slate-200', icon: '–', label: 'Not sure', tracker: 'Not sure' },
}
