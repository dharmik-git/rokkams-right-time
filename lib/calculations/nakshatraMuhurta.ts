import * as Astronomy from 'astronomy-engine';
import { tropicalToSidereal } from './ayanamsha';
import { sunLongitude, moonLongitude, normalize360 } from './astronomy';
import type { TimeInterval } from '@/types/panchang';

// ─────────────────────────────────────────────────────────────────────────────
// Amrit Kalam — nakshatra-based, matching DrikPanchang.
//
// Each nakshatra is the Moon traversing 13°20' of sidereal longitude. That span
// is conceptually divided into 60 nadis (ghatis). Within it, Amrit Kalam is a
// fixed 4-nadi window beginning at a per-nakshatra start nadi. The clock times
// are obtained by mapping that nadi window onto the actual time the Moon takes to
// cross the nakshatra (entry → exit), which varies day to day with lunar speed.
//
// The AMRITA_START values below were calibrated directly against DrikPanchang's
// published Amrit Kalam timings for Muscat across a full lunar month (every value
// reproduces DrikPanchang to within a minute). Index 0 = Ashwini … 26 = Revati.
// ─────────────────────────────────────────────────────────────────────────────

const AMRITA_START_NADI = [
  42, // Ashwini
  48, // Bharani
  54, // Krittika
  52, // Rohini
  38, // Mrigashira
  35, // Ardra
  54, // Punarvasu
  44, // Pushya
  56, // Ashlesha
  54, // Magha
  44, // Purva Phalguni
  42, // Uttara Phalguni
  45, // Hasta
  44, // Chitra
  38, // Swati
  38, // Vishakha
  34, // Anuradha
  38, // Jyeshtha
  44, // Mula
  48, // Purva Ashadha
  44, // Uttara Ashadha
  34, // Shravana
  34, // Dhanishtha
  42, // Shatabhisha
  40, // Purva Bhadrapada
  48, // Uttara Bhadrapada
  54, // Revati
];

const AMRITA_DURATION_NADI = 4;
const NAK_ARC = 360 / 27;

function jdnToUTC(jdn: number): Date {
  return new Date((jdn - 2440587.5) * 86400000);
}
function dateToJdn(d: Date): number {
  return d.getTime() / 86400000 + 2440587.5;
}

function siderealMoon(jdn: number): number {
  const vec = Astronomy.GeoMoon(jdnToUTC(jdn));
  const elon = Astronomy.Ecliptic(vec).elon;
  return tropicalToSidereal(elon, jdn);
}

function nakIndex(jdn: number): number {
  return Math.floor(siderealMoon(jdn) / NAK_ARC);
}

// Binary-search the exact nakshatra boundary inside [lo, hi] (indices differ).
function findBoundary(lo: number, hi: number): number {
  const loIdx = nakIndex(lo);
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (nakIndex(mid) === loIdx) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

interface NakOccurrence { index: number; entryJdn: number; exitJdn: number; }

/**
 * Find every nakshatra occurrence whose span overlaps [scanStart, scanEnd],
 * returning each one's true entry/exit boundary (extended beyond the scan
 * window as needed so the nadi mapping is exact).
 */
function findNakOccurrences(scanStartJdn: number, scanEndJdn: number): NakOccurrence[] {
  const stepMin = 30;
  const step = stepMin / 1440;
  const occ: NakOccurrence[] = [];

  let prevIdx = nakIndex(scanStartJdn);
  // Walk back to this occurrence's true entry.
  let entry = scanStartJdn;
  while (nakIndex(entry - step) === prevIdx) entry -= step;
  entry = findBoundary(entry - step, entry);

  for (let jdn = scanStartJdn + step; jdn <= scanEndJdn + step; jdn += step) {
    const curIdx = nakIndex(jdn);
    if (curIdx !== prevIdx) {
      const boundary = findBoundary(jdn - step, jdn);
      occ.push({ index: prevIdx, entryJdn: entry, exitJdn: boundary });
      entry = boundary;
      prevIdx = curIdx;
    }
  }
  // Final occurrence: extend forward to its true exit.
  let exit = scanEndJdn;
  while (nakIndex(exit + step) === prevIdx) exit += step;
  exit = findBoundary(exit, exit + step);
  occ.push({ index: prevIdx, entryJdn: entry, exitJdn: exit });

  return occ;
}

// ─────────────────────────────────────────────────────────────────────────────
// Varjyam (Nakshatra Thyajyam / Visha Ghati)
//
// Same nadi-mapping mechanism as Amrit Kalam, but uses the Visha (inauspicious)
// nadi table.  Some nakshatras produce two or three Varjyam windows per transit;
// VISHA_START_NADI is therefore an array-of-arrays.
//
// All values calibrated directly against DrikPanchang for Muscat across a full
// lunar month; each reproduces DrikPanchang to within one minute.
// Index 0 = Ashwini … 26 = Revati.
// ─────────────────────────────────────────────────────────────────────────────

const VISHA_START_NADI: number[][] = [
  [50],         // Ashwini
  [24],         // Bharani
  [10, 30],     // Krittika
  [40],         // Rohini
  [14],         // Mrigashira
  [21],         // Ardra
  [24, 30],     // Punarvasu
  [20],         // Pushya
  [32],         // Ashlesha
  [30],         // Magha
  [20],         // Purva Phalguni
  [18],         // Uttara Phalguni
  [21],         // Hasta
  [20],         // Chitra
  [14],         // Swati
  [14, 40],     // Vishakha
  [10],         // Anuradha
  [14],         // Jyeshtha
  [20, 56],     // Mula
  [5, 24],      // Purva Ashadha
  [20],         // Uttara Ashadha
  [10],         // Shravana
  [10],         // Dhanishtha
  [18],         // Shatabhisha
  [16],         // Purva Bhadrapada
  [24],         // Uttara Bhadrapada
  [30],         // Revati
];

const VISHA_DURATION_NADI = 4;

/**
 * Compute Varjyam window(s) that begin within the panchang day [sunrise, nextSunrise).
 * Mirrors computeAmritKalam: maps fixed per-nakshatra Visha nadi positions onto
 * the actual time the Moon takes to cross each nakshatra.
 */
export function computeVarjyam(sunrise: Date, nextSunrise: Date): TimeInterval[] {
  const dayStart = dateToJdn(sunrise);
  const dayEnd   = dateToJdn(nextSunrise);

  const occurrences = findNakOccurrences(dayStart - 1.3, dayEnd + 0.2);

  const out: TimeInterval[] = [];
  for (const o of occurrences) {
    const durJdn = o.exitJdn - o.entryJdn;
    const nadi   = durJdn / 60;
    for (const startNadi of VISHA_START_NADI[o.index]) {
      const startJdn = o.entryJdn + startNadi * nadi;
      const endJdn   = startJdn + VISHA_DURATION_NADI * nadi;
      if (startJdn >= dayStart && startJdn < dayEnd) {
        out.push({ start: jdnToUTC(startJdn), end: jdnToUTC(endJdn) });
      }
    }
  }
  out.sort((a, b) => a.start.getTime() - b.start.getTime());
  return out;
}

// Nakshatra indices (0=Ashwini…26=Revati) that form Vidal Yoga.
// Calibrated directly against DrikPanchang: Vidal Yoga runs for the full
// duration of each of these nakshatras, clipped to the panchang day.
const VIDAL_YOGA_NAKSHATRAS = new Set([2, 6, 8, 11, 14, 16, 17, 19, 21, 26]);

/**
 * Compute Vidal Yoga interval(s) for the panchang day [sunrise, nextSunrise).
 * Each Vidaal nakshatra active during the day contributes one window equal to
 * the nakshatra's span clipped to [sunrise, nextSunrise]. Multiple windows are
 * possible if two Vidaal nakshatras both transit within the same day.
 */
export function computeVidalYoga(sunrise: Date, nextSunrise: Date): TimeInterval[] {
  const dayStart = dateToJdn(sunrise);
  const dayEnd = dateToJdn(nextSunrise);

  const occurrences = findNakOccurrences(dayStart - 0.1, dayEnd + 0.1);

  const out: TimeInterval[] = [];
  for (const o of occurrences) {
    if (!VIDAL_YOGA_NAKSHATRAS.has(o.index)) continue;
    const windowStart = Math.max(o.entryJdn, dayStart);
    const windowEnd   = Math.min(o.exitJdn,  dayEnd);
    if (windowEnd > windowStart) {
      out.push({ start: jdnToUTC(windowStart), end: jdnToUTC(windowEnd) });
    }
  }
  out.sort((a, b) => a.start.getTime() - b.start.getTime());
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bhadra (Vishti Karana)
//
// A Karana = half a Tithi = 6° of Moon–Sun separation. There are 60 Karanas
// per lunar month. Vishti Karana occupies position 7 in the 7-movable Karana
// cycle and repeats 8 times through the month (karana_index 7,14,21,28,35,42,49,56).
//
// karana_index = floor(((moonTropical − sunTropical) mod 360) / 6) mod 60
// Ayanamsha cancels in the difference, so tropical longitudes suffice.
//
// Bhadra is shown only on days where Vishti is active, spanning the exact
// Vishti Karana interval clipped to [sunrise, nextSunrise] — matching DrikPanchang.
// ─────────────────────────────────────────────────────────────────────────────

const VISHTI_KARANA_INDICES = new Set([7, 14, 21, 28, 35, 42, 49, 56]);

function karanaIndex(jdn: number): number {
  const diff = normalize360(moonLongitude(jdn) - sunLongitude(jdn));
  return Math.floor(diff / 6) % 60;
}

function isVishti(jdn: number): boolean {
  return VISHTI_KARANA_INDICES.has(karanaIndex(jdn));
}

/**
 * Compute Vishti Karana (Bhadra) interval(s) that overlap the panchang day
 * [sunrise, nextSunrise). Returns empty array when Vishti is not active that day.
 */
export function computeBhadra(sunrise: Date, nextSunrise: Date): TimeInterval[] {
  const dayStart = dateToJdn(sunrise);
  const dayEnd   = dateToJdn(nextSunrise);
  const step = 1 / 1440; // 1 minute in JDN

  const out: TimeInterval[] = [];

  // Scan wide enough to catch Vishti that starts before sunrise or ends after nextSunrise.
  // A Vishti Karana lasts ~6/360 × 29.5 days ≈ 0.49 days.
  let jdn = dayStart - 0.6;
  const scanEnd = dayEnd + 0.1;

  let prev = isVishti(jdn);
  let segStart = prev ? jdn : NaN;

  while (jdn < scanEnd) {
    jdn += step;
    const cur = isVishti(jdn);
    if (cur !== prev) {
      let lo = jdn - step, hi = jdn;
      for (let i = 0; i < 50; i++) {
        const mid = (lo + hi) / 2;
        if (isVishti(mid) === prev) lo = mid; else hi = mid;
      }
      const boundary = (lo + hi) / 2;

      if (!prev) {
        segStart = boundary;
      } else {
        if (!isNaN(segStart)) {
          const clipStart = Math.max(segStart, dayStart);
          const clipEnd   = Math.min(boundary,  dayEnd);
          if (clipEnd > clipStart) {
            out.push({ start: jdnToUTC(clipStart), end: jdnToUTC(clipEnd) });
          }
        }
        segStart = NaN;
      }
      prev = cur;
    }
  }

  if (prev && !isNaN(segStart)) {
    const clipStart = Math.max(segStart, dayStart);
    if (dayEnd > clipStart) {
      out.push({ start: jdnToUTC(clipStart), end: jdnToUTC(dayEnd) });
    }
  }

  out.sort((a, b) => a.start.getTime() - b.start.getTime());
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Baana (Nakshatra Arrow)
//
// Each of the 27 nakshatras is assigned one of five Baana types (Agni, Raja,
// Chora, Roga, Mrityu) or null (no Baana). The Baana period = the Moon's
// entire transit through a Baana nakshatra, clipped to [sunrise, nextSunrise].
//
// Table calibrated directly against DrikPanchang for Muscat across
// June–July 2026 using 15 confirmed data points.  Index 0 = Ashwini … 26 = Revati.
// ─────────────────────────────────────────────────────────────────────────────

const BAANA_TYPE: (string | null)[] = [
  'Roga',   // 0  Ashwini
  null,     // 1  Bharani
  'Mrityu', // 2  Krittika
  'Agni',   // 3  Rohini
  null,     // 4  Mrigashira
  'Mrityu', // 5  Ardra
  null,     // 6  Punarvasu
  'Agni',   // 7  Pushya
  null,     // 8  Ashlesha
  'Raja',   // 9  Magha
  null,     // 10 P.Phalguni
  'Chora',  // 11 U.Phalguni
  null,     // 12 Hasta
  'Roga',   // 13 Chitra
  null,     // 14 Swati
  'Mrityu', // 15 Vishakha
  'Agni',   // 16 Anuradha
  null,     // 17 Jyeshtha
  'Raja',   // 18 Mula
  'Chora',  // 19 P.Ashadha
  null,     // 20 U.Ashadha
  'Agni',   // 21 Shravana
  'Raja',   // 22 Dhanishtha
  null,     // 23 Shatabhisha
  'Chora',  // 24 P.Bhadra
  null,     // 25 U.Bhadra
  null,     // 26 Revati
];

/**
 * Compute Baana (Nakshatra Arrow) interval(s) for the panchang day
 * [sunrise, nextSunrise). Returns the Moon's transit window through each
 * Baana nakshatra, clipped to the day. Returns empty array on days where
 * the Moon is in a null nakshatra — matching DrikPanchang.
 */
export function computeBaana(sunrise: Date, nextSunrise: Date): TimeInterval[] {
  const dayStart = dateToJdn(sunrise);
  const dayEnd   = dateToJdn(nextSunrise);

  const occurrences = findNakOccurrences(dayStart - 0.1, dayEnd + 0.1);

  const out: TimeInterval[] = [];
  for (const o of occurrences) {
    const type = BAANA_TYPE[o.index];
    if (!type) continue;
    const clipStart = Math.max(o.entryJdn, dayStart);
    const clipEnd   = Math.min(o.exitJdn,  dayEnd);
    if (clipEnd > clipStart) {
      out.push({ start: jdnToUTC(clipStart), end: jdnToUTC(clipEnd), label: type });
    }
  }
  out.sort((a, b) => a.start.getTime() - b.start.getTime());
  return out;
}

/**
 * Compute the Amrit Kalam window(s) that begin within the panchang day
 * [sunrise, nextSunrise). Returns an empty array on days where Amrit Kalam is
 * not observed (its window starts outside the day) — matching DrikPanchang,
 * which simply omits it on such days.
 */
export function computeAmritKalam(sunrise: Date, nextSunrise: Date): TimeInterval[] {
  const dayStart = dateToJdn(sunrise);
  const dayEnd = dateToJdn(nextSunrise);

  // Pad the scan so we catch any nakshatra whose Amrit starts inside the day
  // even though the Moon entered the nakshatra well before sunrise.
  const occurrences = findNakOccurrences(dayStart - 1.3, dayEnd + 0.2);

  const out: TimeInterval[] = [];
  for (const o of occurrences) {
    const durJdn = o.exitJdn - o.entryJdn;
    const nadi = durJdn / 60;
    const startJdn = o.entryJdn + AMRITA_START_NADI[o.index] * nadi;
    const endJdn = startJdn + AMRITA_DURATION_NADI * nadi;
    // Include only if it begins within the panchang day.
    if (startJdn >= dayStart && startJdn < dayEnd) {
      out.push({ start: jdnToUTC(startJdn), end: jdnToUTC(endJdn) });
    }
  }
  out.sort((a, b) => a.start.getTime() - b.start.getTime());
  return out;
}
