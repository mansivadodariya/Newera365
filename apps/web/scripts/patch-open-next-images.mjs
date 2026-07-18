// Next 14 has no `images.qualities` config, so @opennextjs/cloudflare bakes the
// default [75] into its image handler and every <Image quality={85}> (the hero
// photo plates) 400s with `"q" parameter (quality) of 85 is not allowed`.
// Patch the compiled handler to allow the qualities the app actually uses.
// ponytail: delete this (and set images.qualities in next.config.mjs) once the
// app is on Next >= 15.3, where qualities is a real config option.
import { readFileSync, writeFileSync } from 'node:fs';

const ALLOWED = '[75, 85]';
const file = new URL('../.open-next/cloudflare/images.js', import.meta.url);
const src = readFileSync(file, 'utf8');
const patched = src.replace(
  /var define_IMAGES_QUALITIES_default = \[[0-9, ]*\];/,
  `var define_IMAGES_QUALITIES_default = ${ALLOWED};`
);
if (patched === src && !src.includes(`define_IMAGES_QUALITIES_default = ${ALLOWED};`)) {
  throw new Error('patch-open-next-images: qualities definition not found — adapter output changed?');
}
writeFileSync(file, patched);
console.log(`patch-open-next-images: allowed image qualities ${ALLOWED}`);
