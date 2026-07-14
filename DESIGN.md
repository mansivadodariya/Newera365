# NewEra365 Design Language — "Terminal Precision"

**This document is the primary reference for ANY design change to any section or page.** Read it before styling anything; extend it when a new pattern is approved. It exists so the site keeps one voice across sessions and contributors.

The thesis: a broker's world is the trading terminal — monospace data, engineered surfaces, one signal color, numbers as the hero. The site should feel like the calm, expensive edge of that world. Big confident type; quiet, disciplined chrome; boldness spent in one place per page.

## 1. Tokens — change things HERE first

| What                | Where                                                                                                       | Notes                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Type scale          | `packages/config/tailwind-preset.js` → `fontSize`                                                           | Semantic fluid tokens (clamp). Retune the whole site in one block.     |
| Colors / surfaces   | `apps/web/src/app/globals.css` → `:root` / `.dark` CSS vars                                                 | Consumed via Tailwind (`bg-background`, `border-border`, `bg-ink`, …). |
| Signature utilities | `apps/web/src/app/globals.css` → `.ink-band`, `.text-sheen`, `.hover-lift`, `.link-underline`, `.tap-scale` | See §3–4.                                                              |

**One typeface site-wide (client direction 2026-07-12, Brdge reference):** Montserrat for Latin with Cairo picked up per-glyph for Arabic (`--font-sans` + `--font-arabic`; Montserrat loads with `adjustFontFallback: false` so its synthetic Arial fallback cannot intercept Arabic glyphs before Cairo). `font-body` is an alias of the same stack — weights differentiate roles, families never do. Heading tokens carry the house cut in the preset (extrabold 800, tracking -0.035 to -0.04em): **never add `font-semibold`/`font-bold` to an element that uses a heading token** — the token weight must win everywhere or pages drift apart (a 21-line sweep removed such overrides).

**Never reintroduce per-component heading clusters** like `text-[32px] … xl:text-[36px]`. A codemod removed ~30 such variants (2026-07-06). Use the semantic tokens:

- `text-display` (44→74px) — page heroes (h1). One per page.
- `text-headline` (34→54px) — main section h2s.
- `text-headline-sm` (28→40px) — support-band h2s (security band, stat strips).
- `text-title` (22→28px) — card titles.
- `text-lead` (17→20px) — hero subtitles / section intros.
- `text-body-lg` (17px) / `text-body` (15px) — copy. **15px is the floor for readable copy.**
- `text-caption` (13px) — fine print, sub-labels.
- `text-eyebrow` (12px, tracking baked) — kickers, always `font-mono uppercase`.
- `text-metric` (48→80px) / `text-metric-sm` (32→46px) — oversized numbers; always `tabular-nums`, latin-glyph values get `dir="ltr"`.

## 2. Color & surfaces

Brand green `accent` #00B050 (+ `accent-bright` #1AD966) is client-approved — never change hue. `up`/`down` (#26A69A/#EF5350) are **chart tick colors only** — never section backgrounds (a teal band on /platform was removed for this).

**Light mode = "paper on signal":** page canvas is green-tinted paper `--background:#F2F5F3`; cards are **white with a visible `border-border`** (`#D7E0DA`) + `shadow-card`. Never white-on-white, never gray `#f2f2f2`/`#fafaf9` card fills (tint instead: `#F0F4F1`-family). Section washes are brand-tinted (`from-[#DCEAE1] to-[#F2F5F3]`), never neutral gray. Body text `text-muted` (#4D5A54).

**Dark mode** is untouched territory (client loves it): canvas #07090d, cards #111–#1a1c22.

**Ink bands** — `--ink`/`--ink-soft` deep green-black via the `.ink-band` utility (grid texture + one soft signal glow). Identical in both themes; they are light mode's dark anchors. Used by: homepage Why-band, accounts matrix, platform devices, and every trade-page dark closer. Dark closers use `.ink-band`, **not `bg-black` and not blue-gray gradients** (`#1F262E` is banned as a surface).

**Ink art cards (card language v2, 2026-07-07)** — the ink system at card scale: a dark plate carrying real photography, sanctioned for signature moments (three-steps triptych, markets grid tiles) while general content cards stay white/bordered. Recipe: `relative overflow-hidden rounded-[20..24px] border border-white/[0.08]` on `#0A130E`, deep soft shadow (`shadow-[0_28px_56px_-28px_rgba(4,16,10,0.55)]`), full-bleed `next/image`, a **green-black scrim** for the text zone (`bg-gradient-to-t from-[#03130B]/[0.92] via-[#03130B]/[0.38] to-[#03130B]/[0.12]`), a hairline inner ring (`ring-1 ring-inset ring-white/[0.06]`), white title / `text-white/[0.72]` body, glass chips (`bg-white/[0.09] border-white/[0.14] backdrop-blur`). Optional editorial details: oversized **ghost numeral** bleeding off the top corner (`text-[96px] text-white/[0.08]`), glass glyph tile (`h-12 w-12 rounded-[14px] bg-white/[0.08] border-white/[0.16]`). Hover on navigating ink cards: border → `accent/45`, shadow deepens, image opacity rises — **never scale/zoom/translate**.

**Imagery art direction** — photography is real and cinematic, never simulated UI and never bright stock-office clichés. The family: dark ground (near-black / deep emerald), one light event (a luminous ridge, glowing terminal bokeh, lit towers), cool green-tinted grade; warm accents only where the subject is naturally warm (gold, bitcoin). Sourced from Unsplash (free commercial license) via the documented Chrome/napi mechanism; files live in `apps/web/public/images/`. **When replacing an image, rename the file** (e.g. `-dark` suffix) — same-name overwrites serve stale next/image + CDN caches. **CMS-media fallbacks are designed, not blank**: when a CMS thumbnail is missing or 404s (`onError`), media cards fall back to a crop of a house art plate — never a flat gradient (see `MediaListingPage`). Current set: `hero-signal-peak.jpg` (hero ink plate, both themes: see §3) + the hero orbit layers `hero-globe-core.png` + `hero-tile-1..5.png` (split from the original flat `hero-globe-orbit.png`, which is retained as the master), `hero-terminal-macro.jpg` (three-steps open card; retired from the hero), `hero-terminal-paper.jpg` (retired light hero plate, kept with its grade pipeline), `steps-silk.jpg` (one artwork cropped as the 3-step triptych via `objectPosition: 0%/50%/100%`), `market-*-dark.jpg` (6 tiles), `edge-flow.jpg` (green light column — ebooks band + media fallbacks).

## 3. Signature elements — spend boldness once

- **Newera Edge proof band** (`FeaturesSection.tsx`): the client's six USPs (USP pitch deck, 2026-07 — execution <15ms · withdrawals 24/7 · A-Book 100% · manager 1-to-1 · regulated Tier-1 · built-for-traders Pro) as oversized `.text-sheen` metrics on an ink band. Claims come from the client's decks — don't invent numbers. `.text-sheen` (white→green clipped gradient) is **reserved for oversized numbers on ink** — never body text, never light surfaces.
- **Hero = the claim on the signal peak** (`HeroSectionDemo.tsx`, client art drop 2026-07-13): the hero is a **full-bleed ink plate in BOTH themes**. Background: `hero-signal-peak.jpg` (glowing price apex over faint candles: atmosphere, not UI) via `next/image` `fill priority`, under three layers: a uniform `bg-black/30` veil so type stays crisp over the glow, an xl-only start-side scrim behind the text column (`bg-gradient-to-r from-[#020704]/[0.72] via-[#020704]/[0.28] to-transparent`, `rtl:bg-gradient-to-l`), and a bottom `h-24` gradient landing into `var(--ink)` so the section seams into the Edge ink band directly below (the dark ticker above seams by itself, both edges are near-black). Content is a two-column grid on xl (`[minmax(0,1fr)_540px]`): the type block sits at the logical start (display headline in white, payoff line and eyebrow in `text-accent-bright`, lead `text-white/[0.78]`, ink-glass secondary CTA, and the hairline "Edge bar" of three claims on ink glass: `border-white/[0.14] bg-white/[0.05] backdrop-blur`), while an **orbit system** holds the end column: the globe core in the centre, SVG orbit rings, and five asset tiles revolving around it. The source `hero-globe-orbit.png` was a FLAT painting (globe + 5 tiles baked in), so it was split offline into `hero-globe-core.png` (the sphere, circle-masked) + `hero-tile-1..5.png` (currency, silver, wheat, oil, bitcoin sprites) via a luminance-separation + connected-components script (kept in the 2026-07-13 session history: dark bodies survive, the bright-green rings drop out, the globe disk is zeroed before labeling so tiles never bridge to it). The tiles ride a perspective-flattened, tilted ellipse (`RX 0.42 / RY 0.27 / TILT -16°` of the square box) driven by one gsap proxy angle (26s, linear, `repeat:-1`): back of the ring (top) sits behind the globe and dims/shrinks, front (bottom) comes forward and brightens, via `sin(theta)` depth → per-tile scale (0.84–1.06), opacity (0.72–1.0), and a z-index swap across the globe (globe z-15, back tiles z-5, front tiles z-25). Tiles only TRANSLATE, never spin (the flat sprites would tip). SSR renders them at `turn=0` (each tile's `a0` is its resting angle from the original art) so there is no flash and reduced-motion/no-JS keeps the arranged orbit static. The rings are redrawn in SVG (two ellipses, matching RX/RY/TILT) so tile paths and rings stay in sync. Column nudged toward the page edge on xl (flips in RTL), dropping under the copy at `w-[min(82vw,400px)]` below xl, on a radial signal glow. Motion elsewhere: the load-stagger word reveal and rise-ins. The **Edge bar** (three claims on ink glass) sits in its OWN full-width row below the grid, never competing with the globe column for width. The aurora mesh CSS was deleted with this pass. **No fake terminal/chart UI in the hero, ever**: static 4K terminal PNG, TradingView panel, and a code-built SVG terminal were all client-rejected in one week ("doesn't match the vibe, doesn't serve a purpose"); both current plates are brand art, not simulated interfaces. Prior treatments are retired: the aurora typographic hero, and the signal-sky photo plate (`hero-terminal-macro.jpg`, now the three-steps open card) with its ink-on-paper light grade (`hero-terminal-paper.jpg`; the per-pixel emission-to-absorption pipeline survives in `apps/web/scripts/grade-hero-paper.js`, full recipe in this section's git history). `HeroTerminal.tsx` is retired from the hero but kept in the package (candidate for /platform).
- **Three-steps cards** (`ThreeStepsClient.tsx`): three ink art cards, one per step. **Imagery (client override, 2026-07-09):** each step carries its OWN relevant dark plate (open on the terminal `hero-terminal-macro.jpg`, fund `edge-flow.jpg`, trade `market-forex-dark.jpg`), replacing the earlier single `steps-silk.jpg` sliced across the three via `objectPosition`. On hover the plate zooms slightly and the card shadow deepens (see §4). Card anatomy: full-bleed slice, green-black scrim, ghost numeral off the top corner, glass glyph tile, white title + `text-white/[0.72]` desc + glass proof chip. The scroll rig is unchanged: desktop-only pinned reveal — 170vh runway with the content itself `position: sticky` at a computed mid-viewport offset (content-height sticky, NEVER an `h-screen` box — that pads a huge gap above the section pre-pin). Native scroll only, no wheel-hijacking: the rail sweeps sideways revealing each card, then the section un-sticks under the user's own momentum. The reveal is **fully reversible and tied to scroll position** — scroll back up and the cards slide out again, so it replays on every pass (not a one-shot). **The runway's height must never change during the page-view** — collapsing it mid-interaction deletes page height under live wheel momentum and catapults the viewport (shipped bug, fixed 2026-07-06); the runway is applied once on mount (`armed`) and stays put. Mobile/reduced-motion get the classic flow.
- **Markets grid tiles** (`MarketsSectionGrid.tsx`): six ink art cards (`h-[150px] xl:h-[176px]`) with the cohesive dark photo set (`market-*-dark.jpg`), scrim-anchored label + mono count, hover = border/`accent`-glow + image sharpens (opacity 0.62 → 0.85) + arrow chip slides in. No zoom, no scale.
- **Kicker system** (`SectionKicker`): every section opens `[accent tick]—[mono 12px uppercase eyebrow]`. On ink: `text-accent-bright` + `bg-accent-bright` tick. This is the page's chapter marker — keep it consistent.
- **Section rhythm**: paper → white/tinted band → ink anchor. Sections round into each other with `rounded-t/-b/-s/-e-[32px]`; the homepage Why-band is deliberately square-edged (full-bleed chapter break).

## 4. Interaction — movement must mean something

Client directive (2026-07-06): animation is _subjective to its purpose_. No decorative motion.

- **Surfaces never levitate.** No `hover:-translate-y-*` on cards — ever. `.hover-lift` (legacy name) now sharpens: border → accent-tint, shadow deepens. No transform.
- **Static info (stat tiles, USP items, testimonials, ledgers): no hover states at all.** Hover feedback on non-interactive elements is noise.
- **Navigating cards/links**: definition + direction — border/color shift, and movement only on the element whose job is direction (arrow nudges inline, `rtl:-scale-x-100`). Approved characterful hovers stay: accounts card green header fade-in, platform/promo/IB card dark-invert.
- **Sanctioned image-zoom (client override, 2026-07-09):** article/research cards, the three-steps cards, and the markets grid tiles MAY zoom their IMAGE on hover (markets also dims the image, opacity 0.62 → 0.5, as a push-in) (`motion-safe:group-hover:scale-[1.03..1.06]` on the `<img>`, clipped by the card's `overflow-hidden`) plus deepen the card shadow. This is the one exception to the no-zoom rule below; the card body itself still never translates or scales.
- **Buttons**: hover = brightness/glow shift; press = `active:scale-[0.98]` (or `.tap-scale`). No hover translate.
- **Purposeful motion is welcome**: entrance reveals (`motion-safe:animate-rise-in`, IO staggers), progress fills (ThreeSteps rail), live ticks (hero terminal flash), scroll-coupled rails. All motion respects `prefers-reduced-motion`; never gate _visibility_ behind motion (see reduced-motion rule in memory).
- **Sections answer the cursor (client directive, 2026-07-12: "many sections look flat, add professional micro interactions").** Two sanctioned responses: (1) `Spotlight` (`Spotlight.tsx`), a cursor-tracked accent glow for ink surfaces (Edge band, stat tiles, arbitrage execution panel, CTA closer), hover-capable pointers only, opacity-only so it is touch and reduced-motion safe; (2) _quiet presence feedback_ on informational tiles and ledger rows: background wash, numeral or glyph color bloom, an accent rule drawing across the hovered tile, icon tiles inverting to solid green. Definition and color, not flight: full-size cards still never translate; small chips and tiles may lift at most 2px. The kicker tick draws itself in per section (`SectionKicker` IO, with a 2.5s bail-out so a broken observer can never keep it hidden), and since 2026-07-13 the eyebrow **types itself out behind a signal-green block caret** once the tick lands (Latin strings only: progressive reveal reshapes Arabic ligatures, so RTL copy renders instantly; SSR/no-JS/reduced-motion stay fully static). Two further terminal-native responses: **`.list-dim`** (globals.css, hover-capable pointers only) makes ledgers and tile grids read like a desk terminal, the hovered row stays lit while siblings recede to 45% (about creed and regions, accounts trading-conditions tiles, platform tool tiles); and the ink matrices answer the cursor as a **grid crosshair**, the hovered ROW takes a faint white wash while the hovered COLUMN keeps its accent tint (accounts feature matrix, platform surface matrix).

## 5. Copy voice

Numbers first, plain verbs, sentence case; specific beats clever ("Spreads from 0.0 pips", not "unbeatable pricing"). Buttons say what happens ("Open Live Account"). **Compliance:** the only regulatory claim allowed is the registered entity (NewEra Capital Markets Pty Ltd · Reg. No. 2024/447619/07) — no FCA/ASIC/CySEC, support is **24/5** (there is no live chat). Every string ships EN + real AR (`messages/en.json` + `ar.json`; check-i18n blocks stubs).

## 6. RTL

Logical utilities only (`ms-/me-/ps-/pe-/start/end`). Directional arrows get `rtl:-scale-x-100`. Latin metric strings (`< 12 ms`, `0.0 pip`) get `dir="ltr"` + `w-fit` (flex-col places them at the logical start — don't add `ms-auto`). Numbers stay `tabular-nums`.

## 7. Anti-patterns (all previously shipped, all removed — don't regress)

Logo pill-soup rows (trust strip is an editorial bare-wordmark ledger now) · floating card hovers · **hover scale/zoom on cards or their images** (except the sanctioned article + three-steps IMAGE-zoom, see §4) · gray section gradients · `bg-black` closers · blue-gray `#1F262E` gradients · teal `#26A69A` surfaces · 13px body copy · 9–10px matrix/table text · per-component px heading clusters · decorative glow-pulse loops · **fixed full-viewport tint layers behind the page** (a `fixed inset-0 -z-10` lime `#67FF59` gradient shipped briefly on 2026-07-07 and drowned the whole paper system — atmosphere belongs to sections, never to a global overlay).

## 8. Life system: motion and card taxonomy (design revamp, 2026-07-09)

The revamp's mandate was to "give it life": every section shows its purpose through purposeful motion and a card body matched to its content. All primitives are reduced-motion safe and never gate content visibility behind motion.

- **`ScrollReveal`** (`ScrollReveal.tsx`, framer `whileInView`): the standard section and card entrance. Props: `index` (stagger), `direction`, `delay`, `className`. Rolled out site-wide. It supersedes bare `animate-rise-in` where a section deserves a staggered reveal; `rise-in` still fits simple items.
- **`CountUp` / `CountUpGroup`** (`CountUp.tsx`): IO-triggered odometer for oversized metrics. It skips non-numeric and `<`-prefixed values automatically (so "< 15 ms" stays static). Use it on the Edge-band USPs, stat strips, and savings or earnings figures. On ink, wrap the number in `.text-sheen`.
- **Marquee**: seamless infinite scroll from two duplicated copies plus a `-50%` `ticker-scroll` loop via `animate-marquee` and the `--marquee-duration` var. Pause on hover, RTL-reversed with `rtl:[animation-direction:reverse]`, reduced-motion falls back to a static wrapping row. Used by the press "featured in" strip (`TrustStripDemo`).
- **TiltReveal** (inside `ThreeStepsClient`): the pinned silk cards settle from `rotateY(8deg) translateZ(-2.5rem)` to flat as the reveal sweeps. It is CSS only on the existing reveal transform, so the fragile scroll-rig JS stays untouched, with `perspective` on the `<li>`. Desktop and motion only.
- **`ReadingProgress`** (`ReadingProgress.tsx`): a thin top scroll-progress bar for the article detail pages.
- **Testimonial carousel** (`TestimonialsSection`): a native snap-scroll track (draggable on touch and trackpad) with auto-advance, pause on hover or focus, and dots plus arrows. RTL handled via `scrollIntoView`.

### Card taxonomy (the anti-samey rule)

Pick the card body by content purpose. Never use one generic white card for everything.

| Purpose                                              | Treatment                                                                                                 |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Data and specs (fees, spreads, matrices, IB rebates) | Terminal ledger: hairline rules, mono `tabular-nums`, no imagery, best or zero values in `text-accent`.   |
| Learning (education, guides, glossary)               | Editorial index: ghost numerals or letters, reading-time or level chips, divider rows, `.link-underline`. |
| Actions (accounts, funding, promos)                  | White bordered cards with the approved characterful hovers.                                               |
| Media (videos, webinars)                             | Ink-art cards.                                                                                            |
| Proof (awards, press, testimonials, stats)           | Bare ledger rows or pull quotes. Never card grids.                                                        |
| Interactive (calculators, estimators)                | Terminal read-out panels with formula chips and CountUp results.                                          |

### New homepage section

The **Two Paths fork band** (`TwoPathsSection.tsx`) sits after the three-steps rig, as the funnel hinge. An ink-art Education card and a white Trade card diverge from a switch line, a deliberate dark-versus-bright contrast: beginners route to Education, veterans route straight to a live account.

### Copy rule (client, 2026-07-09)

NO EM DASHES or en dashes anywhere. Use commas, colons, or periods. This applies to every shipped string (EN and AR) and to this document. Latin metric strings still get `dir="ltr"`.

### Ticker

The TradingView ticker-tape ignores the `backgroundColor` config, so a `contrast(1.32)` filter on the iframe (globals.css) crushes its fixed `#131722` to true black in both themes.
