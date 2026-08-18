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
        ink: {
          DEFAULT: 'var(--ink)',
          soft: 'var(--ink-soft)',
        },
      },
      // Semantic fluid type scale — one place to retune the whole site.
      // Every role scales with the viewport (clamp), so desktop gets the
      // larger cut automatically without per-breakpoint classes.
      // Heading roles carry the house cut (extrabold, tight tracking — Brdge
      // reference, client direction 2026-07-12): the weight/tracking live HERE,
      // never as per-component font-* overrides, so every page stays uniform.
      fontSize: {
        // Sizes are cut for Montserrat 800, which runs ~7% wider than the old
        // face: caps match the Brdge reference (h1 69px, h2 46px) so headings
        // fit the containers they were designed in instead of orphan-wrapping.
        display: [
          'clamp(2.625rem, 1.85rem + 3.3vw, 4.3125rem)',
          { lineHeight: '1.04', letterSpacing: '-0.04em', fontWeight: '600' },
        ],
        headline: [
          'clamp(2rem, 1.5rem + 2.1vw, 2.875rem)',
          { lineHeight: '1.08', letterSpacing: '-0.04em', fontWeight: '600' },
        ],
        'headline-sm': [
          'clamp(1.625rem, 1.4rem + 1.2vw, 2.25rem)',
          { lineHeight: '1.12', letterSpacing: '-0.035em', fontWeight: '600' },
        ],
        title: [
          'clamp(1.375rem, 1.28rem + 0.5vw, 1.75rem)',
          { lineHeight: '1.2', letterSpacing: '-0.03em', fontWeight: '600' },
        ],
        lead: ['clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)', { lineHeight: '1.55' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.7' }],
        body: ['0.9375rem', { lineHeight: '1.6' }],
        caption: ['0.8125rem', { lineHeight: '1.5' }],
        eyebrow: ['0.75rem', { lineHeight: '1', letterSpacing: '0.16em' }],
        metric: [
          'clamp(3rem, 2.2rem + 3.4vw, 5rem)',
          { lineHeight: '0.95', letterSpacing: '-0.04em', fontWeight: '600' },
        ],
        'metric-sm': [
          'clamp(2rem, 1.7rem + 1.4vw, 2.875rem)',
          { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '600' },
        ],
      },
      // Headings use Outfit (--font-sans, the original display face); body uses
      // Montserrat (--font-body). Cairo (--font-arabic) sits next in both stacks
      // so Arabic glyphs resolve to it whichever Latin face leads.
      fontFamily: {
        sans: ['var(--font-sans)', 'var(--font-arabic)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'var(--font-arabic)', 'system-ui', 'sans-serif'],
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
          '50%': { transform: 'translateY(-3px)' },
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
        // Route-transition top progress bar (TopLoadingBar). The crawl eases to
        // ~92% and holds (loading.tsx unmounts on resolve), so it never needs a
        // 100% frame; the `loading-blip` highlight conveys ongoing activity.
        'loading-bar': {
          '0%': { width: '0%' },
          '55%': { width: '68%' },
          '100%': { width: '92%' },
        },
        'loading-blip': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(450%)' },
        },
        // Slow left-to-right sheen sweep for the "Most Popular" pricing badge —
        // draws the eye to the recommendation, then rests between passes.
        'badge-shine': {
          '0%': { backgroundPosition: '-150% 0' },
          '60%,100%': { backgroundPosition: '250% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'skeleton-pulse': 'skeleton-pulse 1.5s ease-in-out infinite',
        ticker: 'ticker-scroll 40s linear infinite',
        // Seamless logo/press marquee — duration overridable via --marquee-duration.
        marquee: 'ticker-scroll var(--marquee-duration, 40s) linear infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-in',
        'float-y': 'float-y 7s ease-in-out infinite',
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
        'loading-bar': 'loading-bar 1.2s ease-out forwards',
        'loading-blip': 'loading-blip 1s ease-in-out infinite',
        'badge-shine': 'badge-shine 3.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
