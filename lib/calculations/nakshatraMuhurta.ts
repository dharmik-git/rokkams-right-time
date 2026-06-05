import * as Astronomy from 'astronomy-engine';
import { tropicalToSidereal } from './ayanamsha';
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
