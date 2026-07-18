# @newera365/ui

All React components for the Newera365 site. Consumed **as source** by
`apps/web` (listed in its `next.config.mjs` `transpilePackages`) — there is no
build step in this package. The public API is the barrel at `src/index.ts`;
`apps/web` imports only from `@newera365/ui`, never from deep paths.

## Folder taxonomy (`src/`)

| Folder                   | What lives here                                                                                                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/pages/`      | Full route-level page components (`AboutPage`, `SupportPage`, …). Routes in `apps/web/src/app/[locale]/` are thin wrappers around these.                                                                                                    |
| `components/sections/`   | Homepage and reusable page sections (`HeroSectionDemo`, `TestimonialsSection`, CTA banners, `WebinarsSection`). The `Demo` suffix on some names is historical: they were built for the landing-page redesign and promoted to the live site. |
| `components/chrome/`     | Site shell: `HeaderDemo`, `MobileMenuDemo`, `Footer`, `RiskBanner`, `TopLoadingBar`, toasts, auth modal, floating contact.                                                                                                                  |
| `components/primitives/` | Small reusable building blocks: `Accordion`, `Pagination`, `RichText`, `SectionKicker`, `Spotlight`, calculator kits (`CalcKit`, `PivotCalculator`, …).                                                                                     |
| `components/motion/`     | The DESIGN.md §8 "Life" motion primitives: `ScrollReveal`, `CountUp`, `RevealDemo`, `ReadingProgress`. All are `prefers-reduced-motion`-safe and must never gate content visibility.                                                        |
| `components/market/`     | Live-market data widgets: TradingView embeds, `LiveSpark` (MT5 poll), `MarketSessionStrip`, `FocusMap`.                                                                                                                                     |
| `lib/`                   | Non-component helpers and data modules: `safeUrl`, `filterUtils`, `navIcons`, `marketOverviewConfig`, `worldMapData`.                                                                                                                       |

## Rules

- **DESIGN.md at the repo root is binding** for any visual change. Notables:
  no hover translate/levitation on cards, hover hue is green only, dark
  closers use `.ink-band`, every string ships EN + real AR, RTL via logical
  Tailwind utilities, no em/en dashes in copy.
- The barrel must stay a server-safe module — no `'use client'` here (it would
  drag every component into the client bundle). Components declare their own.
- New components go into the folder matching their role and get a barrel
  export in the matching section only if `apps/web` needs them; internal-only
  components (e.g. `ScrollReveal` consumers inside this package) stay
  unexported.
