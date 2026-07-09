# Partner logos

`PartnersSection.tsx` (packages/ui) renders a brand mark + name lockup when the
item has a `logo` file here, and a name-only card otherwise (Brdge cells render
both ways too).

## Captured (real brand marks, sourced from each brand's official favicon)

scope-markets.ico · finalto.png · amana.png · b2broker.png · lmax.png ·
blueberry.png · cms-prime.png · centroid.png · cregis.png

These are the brand **icon-marks** (not full wordmark logos). They're paired
with the brand name in the card, so the lockup reads as a real logo.

## Still name-only (want a proper logo)

Equiti, MAZI Finance, Spectre Global, FXCubic, Tool For Broker, Epayme,
Think Huge Limited — either no favicon resolved, or I couldn't verify the
domain belonged to the right company (better a clean name than a wrong logo).

To upgrade any cell to a full wordmark logo:

1. Drop the file here (SVG preferred; transparent PNG fine).
2. Set/replace `logo: '<filename>'` on that item in `PARTNER_GROUPS` in
   `packages/ui/src/components/PartnersSection.tsx`.

Suggested source domains: equiti.com, mazifinance.com, spectreglobal.com,
fxcubic.com, toolforbroker.com, epayme.io, thinkhugelimited.com.
