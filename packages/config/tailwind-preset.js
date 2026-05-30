/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        foreground: 'var(--foreground)',
        muted: 'var(--muted)',
        'text-secondary': 'var(--text-secondary)',
        border: 'var(--border)',
        section: 'var(--section)',
        'footer-bg': 'var(--footer-bg)',
        accent: {
          DEFAULT: '#00B050',
          hover: '#15803D',
          bright: '#1AD966',
          logo: '#337346',
          subtle: 'rgba(0,176,80,0.12)',
        },
        up: '#26A69A',
        down: '#EF5350',
        ticker: {
          bg: '#030406',
          muted: '#8C939E',
          divider: '#191E26',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        arabic: ['var(--font-arabic)', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        pill: '999px',
      },
      boxShadow: {
        card: '0px 4px 16px 0px rgba(0,0,0,0.06)',
        'card-dark': '0px 4px 16px 0px rgba(0,0,0,0.4)',
        'card-lg': '0px 8px 32px 0px rgba(0,0,0,0.08)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'skeleton-pulse': { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.4' } },
        'ticker-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'skeleton-pulse': 'skeleton-pulse 1.5s ease-in-out infinite',
        ticker: 'ticker-scroll 40s linear infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-in',
      },
    },
  },
  plugins: [],
};
