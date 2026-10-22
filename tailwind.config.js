// Chat colours use Lovable's exact oklch values. "<alpha-value>" lets Tailwind v3 support things like bg-sky/40 and border-ink/15.
const c = (l, ch, h) => `oklch(${l} ${ch} ${h} / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Patrick Hand', 'ui-sans-serif', 'system-ui', 'sans-serif'], display: ['Fredoka', 'ui-rounded', 'system-ui', 'sans-serif'] },
      colors: {
        ink: { DEFAULT: c(0.2, 0.07, 268), 900: '#0a0e1f', 800: '#121833', 700: '#1b2347', 600: '#2a3562' },
        navy: '#1b2559',
        bolt: '#38a3ff',
        volt: '#7c6cff',
        // ---- chat (Lovable) ----
        sky: { DEFAULT: c(0.93, 0.04, 225) }, // adds bg-sky; the normal sky-100, sky-200... shades are kept
        lilac: c(0.76, 0.13, 295),
        sun: c(0.86, 0.15, 90),
        sunsoft: c(0.97, 0.06, 95),
        online: c(0.78, 0.18, 150),
        card: c(0.99, 0.005, 240),
        'card-foreground': c(0.22, 0.08, 268),
        primary: c(0.58, 0.2, 260),
        'primary-foreground': c(0.99, 0, 0),
        muted: c(0.95, 0.02, 240),
        'muted-foreground': c(0.5, 0.05, 260),
        destructive: c(0.63, 0.22, 25),
        'destructive-foreground': c(0.99, 0, 0),
        border: c(0.85, 0.06, 225),
        input: c(0.88, 0.04, 230),
        'bubble-me': c(0.58, 0.2, 260),
        'bubble-them': c(0.94, 0.035, 230),
      },
    },
  },
  plugins: [],
}
