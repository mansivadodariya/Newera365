/* eslint-disable no-console */
// Fails if en.json and ar.json have diverging key sets, or if any Arabic value
// still contains an untranslated "__AR__" stub. Keeps missing/placeholder
// translations from silently shipping. Runs as part of `npm run lint`.
const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, '..', 'messages');
const en = JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8'));
const ar = JSON.parse(fs.readFileSync(path.join(messagesDir, 'ar.json'), 'utf8'));

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

const enFlat = flatten(en);
const arFlat = flatten(ar);
const enKeys = new Set(Object.keys(enFlat));
const arKeys = new Set(Object.keys(arFlat));

const errors = [];

for (const k of enKeys) if (!arKeys.has(k)) errors.push(`Missing in ar.json: ${k}`);
for (const k of arKeys) if (!enKeys.has(k)) errors.push(`Extra in ar.json (not in en.json): ${k}`);
for (const [k, v] of Object.entries(arFlat)) {
  if (typeof v === 'string' && v.includes('__AR__')) {
    errors.push(`Untranslated stub in ar.json: ${k}`);
  }
}

if (errors.length) {
  console.error('i18n check failed:\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log('i18n check passed: en/ar key sets match, no __AR__ stubs.');
