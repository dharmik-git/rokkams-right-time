// Calibration script: determine which nakshatra index maps to which Baana type.
// Uses Baana start/end times collected from DrikPanchang (Muscat) June 5–18, 2026.
// Run: node calib_baana.mjs
import * as Astronomy from 'astronomy-engine';

function lahiriAyanamsha(jdn) {
  const T = (jdn - 2451545.0) / 36525;
  return 23.8521 + 1.3969 * T;
}
function jdnToUTC(jdn) { return new Date((jdn - 2440587.5) * 86400000); }
function getMoonLng(jdn) {
  const v = Astronomy.GeoMoon(jdnToUTC(jdn));
  return Astronomy.Ecliptic(v).elon;
}
function sidMoon(jdn) { return ((getMoonLng(jdn) - lahiriAyanamsha(jdn)) % 360 + 360) % 360; }
const ARC = 360 / 27;
function nakIndex(jdn) { return Math.floor(sidMoon(jdn) / ARC); }

// mc: local Muscat time (UTC+4) → JDN
function mc(y, mo, d, hh, mm) {
  return (Date.UTC(y, mo - 1, d, hh, mm, 0) - 4 * 3600000) / 86400000 + 2440587.5;
}

const NAK = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','P.Phalguni','U.Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','P.Ashadha','U.Ashadha','Shravana','Dhanishtha','Shatabhisha',
  'P.Bhadra','U.Bhadra','Revati'
];

// Each row: [label, JDN of a point firmly inside the Baana period, Baana type]
// Times are "just after Baana starts" (i.e. inside the correct nakshatra).
// All times are local Muscat (UTC+4). Data collected from DrikPanchang Jun 5–27 2026.
const pts = [
  ['Agni-1',    mc(2026,  6,  6,  1, 30), 'Agni'],   // ends Jun 6 1:38 AM
  ['Raja-1',    mc(2026,  6,  7,  3,  0), 'Raja'],   // Jun 7 2:43 AM → Jun 8 3:48 AM
  ['Chora-1',   mc(2026,  6,  9,  5,  0), 'Chora'],  // Jun 9 4:53 AM → Jun 10 5:58 AM
  ['Roga-1',    mc(2026,  6, 11,  7, 30), 'Roga'],   // Jun 11 7:04 AM → Jun 12 8:10 AM
  ['Mrityu-1',  mc(2026,  6, 13,  9, 30), 'Mrityu'], // Jun 13 9:16 AM → Jun 14 10:23 AM
  ['Agni-2',    mc(2026,  6, 14, 11,  0), 'Agni'],   // Jun 14 10:23 AM → Jun 15 11:29 AM
  ['Mrityu-2',  mc(2026,  6, 16, 13,  0), 'Mrityu'], // Jun 16 12:36 PM → Jun 17 1:43 PM
  ['Agni-3',    mc(2026,  6, 17, 14,  0), 'Agni'],   // Jun 17 1:43 PM → Jun 18 2:51 PM
  ['Raja-2',    mc(2026,  6, 19, 16,  0), 'Raja'],   // Jun 19 3:59 PM → Jun 20 5:07 PM
  ['Chora-2',   mc(2026,  6, 21, 18, 30), 'Chora'],  // Jun 21 6:16 PM → Jun 22 7:25 PM
  ['Roga-2',    mc(2026,  6, 23, 21,  0), 'Roga'],   // Jun 23 8:34 PM → Jun 24 9:44 PM
  ['Mrityu-3',  mc(2026,  6, 25, 23,  0), 'Mrityu'], // Jun 25 10:54 PM → Jun 27 0:04 AM
  ['Agni-4',    mc(2026,  6, 27,  0, 15), 'Agni'],   // Jun 27 0:04 AM → Jun 28 1:14 AM
  ['Raja-3',    mc(2026,  6, 29,  3,  0), 'Raja'],   // Jun 29 2:25 AM → Jun 30 ~3:30 AM
  ['Chora-3',   mc(2026,  7,  1,  5,  0), 'Chora'],  // Jul 1 4:46 AM → Jul 2 ~6 AM
];

const result = {}; // nakshatra index → Baana type

console.log('=== Baana calibration (DrikPanchang Muscat, June 2026) ===\n');
for (const [label, jdn, baana] of pts) {
  const idx = nakIndex(jdn);
  console.log(`${label.padEnd(12)} nak=${String(idx).padStart(2)} (${NAK[idx].padEnd(13)}) → ${baana}`);
  if (result[idx] && result[idx] !== baana) {
    console.warn(`  *** CONFLICT: was ${result[idx]}, now ${baana}`);
  }
  result[idx] = baana;
}

console.log('\n=== Nakshatra → Baana type (27 entries, null = no Baana) ===');
const table = Array(27).fill(null);
for (const [idx, type] of Object.entries(result)) {
  table[parseInt(idx)] = type;
}
for (let i = 0; i < 27; i++) {
  console.log(`  [${String(i).padStart(2)}] ${NAK[i].padEnd(13)} → ${table[i] ?? 'null'}`);
}
console.log('\nConst for nakshatraMuhurta.ts:');
console.log('const BAANA_TYPE: (string | null)[] = [');
for (let i = 0; i < 27; i++) {
  const t = table[i] ? `'${table[i]}'` : 'null';
  console.log(`  ${t.padEnd(8)}, // ${i} ${NAK[i]}`);
}
console.log('];');
