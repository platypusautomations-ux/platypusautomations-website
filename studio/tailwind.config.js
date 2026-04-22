/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ["'Instrument Serif'", 'serif'],
        body: ["'Barlow'", 'sans-serif'],
      },
      colors: {
        teal: {
          DEFAULT: '#008080',
          light: '#00a0a0',
          dark: '#006060',
        },
        navy: {
          DEFAULT: '#0a1628',
          light: '#0d1f3c',
          dark: '#060e1a',
        },
      },
      letterSpacing: {
        'heading': '-0.04em',
      },
    },
  },
  plugins: [],
}
