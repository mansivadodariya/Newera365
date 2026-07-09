# NewEra365 Design Language — "Terminal Precision"

**This document is the primary reference for ANY design change to any section or page.** Read it before styling anything; extend it when a new pattern is approved. It exists so the site keeps one voice across sessions and contributors.

The thesis: a broker's world is the trading terminal — monospace data, engineered surfaces, one signal color, numbers as the hero. The site should feel like the calm, expensive edge of that world. Big confident type; quiet, disciplined chrome; boldness spent in one place per page.

## 1. Tokens — change things HERE first

| What                | Where                                                                                                       | Notes                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Type scale          | `packages/config/tailwind-preset.js` → `fontSize`                                                           | Semantic fluid tokens (clamp). Retune the whole site in one block.     |
| Colors / surfaces   | `apps/web/src/app/globals.css` → `:root` / `.dark` CSS vars                                                 | Consumed via Tailwind (`bg-background`, `border-border`, `bg-ink`, …). |
| Signature utilities | `apps/web/src/app/globals.css` → `.ink-band`, `.text-sheen`, `.hover-lift`, `.link-underline`, `.tap-scale` | See §3–4.                                                              |

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

**Imagery art direction** — photography is real and cinematic, never simulated UI and never bright stock-office clichés. The family: dark ground (near-black / deep emerald), one light event (a luminous ridge, glowing terminal bokeh, lit towers), cool green-tinted grade; warm accents only where the subject is naturally warm (gold, bitcoin). Sourced from Unsplash (free commercial license) via the documented Chrome/napi mechanism; files live in `apps/web/public/images/`. **When replacing an image, rename the file** (e.g. `-dark` suffix) — same-name overwrites serve stale next/image + CDN caches. **CMS-media fallbacks are designed, not blank**: when a CMS thumbnail is missing or 404s (`onError`), media cards fall back to a crop of a house art plate — never a flat gradient (see `MediaListingPage`). Current set: `hero-terminal-macro.jpg` (dark hero plate), `hero-terminal-paper.jpg` (light hero plate, machine-derived from the dark master — see §3), `steps-silk.jpg` (one artwork cropped as the 3-step triptych via `objectPosition: 0%/50%/100%`), `market-*-dark.jpg` (6 tiles), `edge-flow.jpg` (green light column — ebooks band + media fallbacks).

## 3. Signature elements — spend boldness once

- **Newera Edge proof band** (`FeaturesSection.tsx`): the client's six USPs (USP pitch deck, 2026-07 — execution <15ms · withdrawals 24/7 · A-Book 100% · manager 1-to-1 · regulated Tier-1 · built-for-traders Pro) as oversized `.text-sheen` metrics on an ink band. Claims come from the client's decks — don't invent numbers. `.text-sheen` (white→green clipped gradient) is **reserved for oversized numbers on ink** — never body text, never light surfaces.
- **Hero = the claim over the signal sky** (`HeroSectionDemo.tsx`): full-width centered typographic hero — display headline, lead, CTAs, and the hairline "Edge bar" (three claims in the lattice voice). **No fake terminal/chart UI in the hero — ever.** Three concepts were client-rejected in one week: static 4K terminal PNG, TradingView panel, code-built SVG terminal with live P/L ("doesn't match the vibe, doesn't serve a purpose"). The sanctioned imagery (settled 2026-07-07, after full-bleed + LED-board + duotone-print experiments were all client-rejected) is the **signal-sky plate**: a real PHOTOGRAPH of a trading terminal (tilted macro: price ladder, blurred candles, green glow on black — `hero-terminal-macro.jpg`, atmosphere not UI), anchored to the top band at **≥80% hero coverage** (`h-[560px] md:h-[640px] xl:h-[800px]`), bleeding down from the dark ticker strip and **dissolving into the page canvas near the section's bottom edge** via an alpha mask (`[mask-image:radial-gradient(140%_110%_at_50%_-14%,#000_52%,transparent_92%)]`) + a gradient landing into `var(--background)` + a per-theme radial pocket behind the type block (paper `rgba(242,245,243,0.6)` / ink `rgba(7,9,13,0.52)`, both `58%_54% at 50%_48%`) so the type stays crisp while the flanks keep full punch. Headline keeps theme colours in both modes; the visible plate is `priority` (LCP), the hidden theme's plate stays lazy. **The light plate is the same photograph, printed** (`hero-terminal-paper.jpg`, 2400×3600, served `quality={90}`, same `object-[42%_26%]` crop as dark for pixel-level uniformity): derived from the dark master by the **ink-on-paper grade — NOT lightness inversion** (inversion shipped 2026-07-08 morning and was rejected: emission-on-black doesn't survive an L-flip — near-white glow cores turn olive-mud, colored mids turn pastel photocopy, shadow noise mottles the ground). The model: dark = light **emission** on black, light = ink **absorption** on paper. Per-pixel (sharp `raw()` pass, `apps/web/scripts/grade-hero-paper.js`): emission `max(r,g,b)` → ink alpha with a floor at 0.075 (ground → the site paper `#F2F5F3` exactly) and a knee at 0.55 (mid-brightness glow → full ink, because 30% ink on paper reads far weaker than 30% glow on black), gamma 1.0; ink keeps the pixel's hue, saturation ×1.8 (screen bloom desaturates), lightness 0.20 (neutral ink) → 0.42 (chromatic ink), plus client-tuned hue trims (2026-07-08): greens +0.13 lightness, reds ×0.75 saturation ×0.85 density; composite over paper. All params are the script's defaults — a bare run reproduces the shipped plate. The strongest glow becomes the deepest ink and halos dissolve into paper exactly as they dissolved into black — green stays green, red stays red, whites become near-black ink. Client requirement: light and dark must be the SAME image with the same colours, differing only in exposure — no green-duotone reinterpretations (a Canva Dream Lab re-render was rejected for drifting composition and tinting everything green). Dark plate ships at `opacity-[0.82]` + the ink pocket so the type wins; the dark subtitle uses `dark:text-white/[0.78]` (default `text-muted` was illegible over the plate). To regenerate: `node scripts/grade-hero-paper.js` from `apps/web`, and rename the output (image caches). Full-hero-bleed treatments are retired: at that scale this shallow-focus photo reads as smear, and machine-graded substitutes (sharp duotone print, LED board) read as noise behind the content. `HeroTerminal.tsx` is retired from the hero but kept in the package (candidate for /platform).
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
