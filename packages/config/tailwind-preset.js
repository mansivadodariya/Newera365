/**
 * Shared Tailwind preset for NewEra365.
 * Brand tokens are placeholders — update after Gate 2 design handoff (NE-024).
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0b3d91',
          dark: '#06214f',
          light: '#3b6fc4',
        },
        accent: '#f5a623',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
