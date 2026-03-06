/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        void:    { DEFAULT: '##0a0a0f' },
        surface: { DEFAULT: '#13131a', light: '#1c1c26', border: '#2a2a38' },
        accent:  { DEFAULT: '#7c6aff', hover: '#9580ff' },
        online:  '#22c55e',
        msg:     '#e2e2f0',
      },
    },
  },
  plugins: [],
}