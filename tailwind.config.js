export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Patrick Hand', 'ui-sans-serif', 'system-ui', 'sans-serif'], display: ['Fredoka', 'ui-rounded', 'system-ui', 'sans-serif'] },
      colors: {
        ink: { 900: '#0a0e1f', 800: '#121833', 700: '#1b2347', 600: '#2a3562' },
        navy: '#1b2559',
        bolt: '#38a3ff',
        volt: '#7c6cff',
      },
    },
  },
  plugins: [],
}
