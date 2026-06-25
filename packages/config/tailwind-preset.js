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
        // Demo landing-page motion (additive — used only by *Demo components)
        'float-y': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'draw-line': {
          from: { strokeDashoffset: '1' },
          to: { strokeDashoffset: '0' },
        },
        'chip-pulse': {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.78)' },
        },
        'glow-pulse': {
          '0%,100%': { opacity: '0.45' },
          '50%': { opacity: '0.85' },
        },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // Quote-tick flash for the live hero terminal
        'flash-up': {
          from: { backgroundColor: 'rgba(38,166,154,0.28)' },
          to: { backgroundColor: 'transparent' },
        },
        'flash-down': {
          from: { backgroundColor: 'rgba(239,83,80,0.28)' },
          to: { backgroundColor: 'transparent' },
        },
        // Scroll-progress connector fill (three-steps section)
        'grow-y': {
          from: { transform: 'scaleY(0)' },
          to: { transform: 'scaleY(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'skeleton-pulse': 'skeleton-pulse 1.5s ease-in-out infinite',
        ticker: 'ticker-scroll 40s linear infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-in',
        'float-y': 'float-y 4s ease-in-out infinite',
        'draw-line': 'draw-line 1.6s ease-out forwards',
        'chip-pulse': 'chip-pulse 1.8s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 5s ease-in-out infinite',
        // `both` (not `forwards`) is required: these entrance animations are used
        // with a staggered `animation-delay`. With `forwards` the `from` (opacity:0)
        // state is NOT applied during the delay window, so a delayed element paints
        // fully visible, then snaps to 0 the instant its animation starts and fades
        // back in — a flicker. `backwards`/`both` back-fills the 0% state during the
        // delay so it stays hidden until it fades in. (Reduced motion is unaffected:
        // these are applied via `motion-safe:animate-rise-in`.)
        'rise-in': 'rise-in 0.6s ease-out both',
        'flash-up': 'flash-up 0.7s ease-out',
        'flash-down': 'flash-down 0.7s ease-out',
      },
    },
  },
  plugins: [],
};
