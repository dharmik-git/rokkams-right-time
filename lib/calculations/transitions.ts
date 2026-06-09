import * as Astronomy from 'astronomy-engine';
import { tropicalToSidereal } from './ayanamsha';
import { calculateTithi } from './tithi';
import { calculateNakshatra } from './nakshatra';
import { calculateYoga } from './yoga';
import { calculateKarana } from './karana';
import { dateObjectToJDN } from './jdn';

// JDN → UTC Date
function jdnToUTC(jdn: number): Date {
  return new Date((jdn - 2440587.5) * 86400000);
}

// ─── High-accuracy angle samplers using astronomy-engine (VSOP87/ELP2000) ───
// These match DrikPanchang's Swiss Ephemeris to within ~1-2 minutes,
// replacing the Meeus-algorithm functions which were off by 7-15 minutes.

function getSunLng(jdn: number): number {
  return Astronomy.SunPosition(jdnToUTC(jdn)).elon;
}

function getMoonLng(jdn: number): number {
  // GeoMoon returns equatorial vector; Ecliptic() converts to ecliptic coordinates
  const vec = Astronomy.GeoMoon(jdnToUTC(jdn));
  return Astronomy.Ecliptic(vec).elon;
}

function elongation(jdn: number): number {
  const s = getSunLng(jdn);
  const m = getMoonLng(jdn);
  return ((m - s) + 360) % 360;
}

function siderealMoon(jdn: number): number {
  return tropicalToSidereal(getMoonLng(jdn), jdn);
}

function yogaSum(jdn: number): number {
  const s = tropicalToSidereal(getSunLng(jdn), jdn);
  const m = tropicalToSidereal(getMoonLng(jdn), jdn);
  return (s + m) % 360;
}

// ─── Generic transition finder ───────────────────────────────────────────────

interface Segment {
  index: number;
  startJdn: number;
  endJdn: number;
}

/**
 * Sample [jdnStart, jdnEnd] every STEP_MIN minutes for changes in `getIndex`,
 * then binary-search each crossing to within ~4 seconds.
 * Always includes the final partial segment (even if just 1 minute).
 */
function findSegments(
  jdnStart: number,
  jdnEnd: number,
  getIndex: (jdn: number) => number,
): Segment[] {
  const STEP_MIN = 15; // sample every 15 minutes
  const step = STEP_MIN / 1440;
  const MIN_SEGMENT = 10 / 86400; // 10 seconds minimum — accept even 1-minute segments
  const segments: Segment[] = [];

  let prevIdx = getIndex(jdnStart);
  let segStart = jdnStart;

  for (let jdn = jdnStart + step; jdn <= jdnEnd + step * 0.5; jdn += step) {
    const cur = Math.min(jdn, jdnEnd);
    const currIdx = getIndex(cur);

    if (currIdx !== prevIdx) {
      // Binary-search the exact crossing inside [jdn-step, cur]
      let lo = jdn - step, hi = cur;
      for (let i = 0; i < 45; i++) {
        const mid = (lo + hi) / 2;
        if (getIndex(mid) === prevIdx) lo = mid; else hi = mid;
      }
      const crossJdn = (lo + hi) / 2;

      if (crossJdn > segStart + MIN_SEGMENT) {
        segments.push({ index: prevIdx, startJdn: segStart, endJdn: crossJdn });
      }
      segStart = crossJdn;
      prevIdx = currIdx;
    }

    if (cur >= jdnEnd) break;
  }

  // Always push the final segment (from last transition to end of day)
  // This captures the element that's active for the remainder of the day,
  // even if it's only 1 minute before midnight.
  if (jdnEnd > segStart + MIN_SEGMENT) {
    segments.push({ index: prevIdx, startJdn: segStart, endJdn: jdnEnd });
  }

  // ── Extend the boundary segments to their TRUE crossings ──────────────────
  // The first/last segments are pinned to the day boundary above, which hides
  // the element's real start (previous day) and real end (next day). Search
  // past the boundary for the actual index change so callers can display the
  // true cross-midnight time. LOOKAHEAD safely exceeds the max element span (~27h).
  const LOOKAHEAD = 1.5;

  if (segments.length > 0) {
    // True start of the first segment (search backwards before jdnStart)
    const first = segments[0];
    if (first.startJdn <= jdnStart + MIN_SEGMENT) {
      const idx = getIndex(first.startJdn + MIN_SEGMENT);
      for (let jdn = jdnStart - step; jdn >= jdnStart - LOOKAHEAD; jdn -= step) {
        if (getIndex(jdn) !== idx) {
          let lo = jdn, hi = jdn + step;
          for (let i = 0; i < 45; i++) {
            const mid = (lo + hi) / 2;
            if (getIndex(mid) === idx) hi = mid; else lo = mid;
          }
          first.startJdn = (lo + hi) / 2;
          break;
        }
      }
    }

    // True end of the last segment (search forwards past jdnEnd)
    const last = segments[segments.length - 1];
    if (last.endJdn >= jdnEnd - MIN_SEGMENT) {
      const idx = getIndex(last.endJdn - MIN_SEGMENT);
      for (let jdn = jdnEnd + step; jdn <= jdnEnd + LOOKAHEAD; jdn += step) {
        if (getIndex(jdn) !== idx) {
          let lo = jdn - step, hi = jdn;
          for (let i = 0; i < 45; i++) {
            const mid = (lo + hi) / 2;
            if (getIndex(mid) === idx) lo = mid; else hi = mid;
          }
          last.endJdn = (lo + hi) / 2;
          break;
        }
      }
    }
  }

  return segments;
}

// ─── Public interfaces ───────────────────────────────────────────────────────

// startReal/endReal carry the TRUE astronomical boundary times (may fall on the
// previous/next calendar day) for DISPLAY only. start/end keep their null-capped
// semantics so consumers like businessMuhurta are unaffected.
export interface TithiSlot {
  name: string;
  paksha: 'Shukla' | 'Krishna';
  start: string | null; // ISO string; null = started before day
  end: string | null;   // ISO string; null = continues after day
  startReal?: string;   // true start (set when start is null)
  endReal?: string;     // true end (set when end is null)
}

export interface NakshatraSlot {
  name: string;
  pada: number;
  start: string | null;
  end: string | null;
  startReal?: string;
  endReal?: string;
}

export interface YogaSlot {
  name: string;
  isAuspicious: boolean;
  start: string | null;
  end: string | null;
  startReal?: string;
  endReal?: string;
}

export interface KaranaSlot {
  name: string;
  start: string | null;
  end: string | null;
  startReal?: string;
  endReal?: string;
}

export interface DayTransitions {
  tithi:    TithiSlot[];
  nakshatra: NakshatraSlot[];
  yoga:     YogaSlot[];
  karana:   KaranaSlot[];
}

function roundToMinute(jdn: number): Date {
  const ms = (jdn - 2440587.5) * 86400000;
  return new Date(Math.round(ms / 60000) * 60000);
}

/**
 * Derive the four boundary fields for a slot. start/end keep their null-capped
 * semantics (null = crosses the day boundary). When capped, the TRUE boundary
 * time is exposed via startReal/endReal for display.
 */
function boundaryFields(seg: Segment, i: number, jdnStart: number, jdnEnd: number): {
  start: string | null; end: string | null; startReal?: string; endReal?: string;
} {
  const startCapped = i === 0 && seg.startJdn <= jdnStart + 0.001;
  const endCapped   = seg.endJdn >= jdnEnd - 0.001;
  const startIso = roundToMinute(seg.startJdn).toISOString();
  const endIso   = roundToMinute(seg.endJdn).toISOString();
  return {
    start: startCapped ? null : startIso,
    end:   endCapped   ? null : endIso,
    ...(startCapped ? { startReal: startIso } : {}),
    ...(endCapped   ? { endReal:   endIso   } : {}),
  };
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Compute all Tithi / Nakshatra / Yoga / Karana transitions within a day.
 * dayStart / dayEnd are UTC Date objects (typically midnight-to-midnight Muscat).
 */
export function computeTransitions(dayStart: Date, dayEnd: Date): DayTransitions {
  const jdnStart = dateObjectToJDN(dayStart);
  const jdnEnd   = dateObjectToJDN(dayEnd);

  // ── Tithi ──
  const tithiSegs = findSegments(jdnStart, jdnEnd, jdn => {
    return Math.floor(elongation(jdn) / 12);
  });

  const tithiSlots: TithiSlot[] = tithiSegs.map((seg, i) => {
    const midJdn = seg.startJdn + 0.001;
    const t = calculateTithi(getSunLng(midJdn), getMoonLng(midJdn));
    return {
      name:   t.name,
      paksha: t.paksha,
      ...boundaryFields(seg, i, jdnStart, jdnEnd),
    };
  });

  // ── Nakshatra ──
  const nakshatraSegs = findSegments(jdnStart, jdnEnd, jdn => {
    const arc = 360 / 27;
    return Math.floor(siderealMoon(jdn) / arc);
  });

  const nakshatraSlots: NakshatraSlot[] = nakshatraSegs.map((seg, i) => {
    const smid = siderealMoon(seg.startJdn + 0.001);
    const n = calculateNakshatra(smid);
    return {
      name: n.name,
      pada: n.pada,
      ...boundaryFields(seg, i, jdnStart, jdnEnd),
    };
  });

  // ── Yoga ──
  const yogaSegs = findSegments(jdnStart, jdnEnd, jdn => {
    const arc = 360 / 27;
    return Math.floor(yogaSum(jdn) / arc);
  });

  const YOGA_NAMES = [
    'Vishkambha','Priti','Ayushman','Saubhagya','Shobhana',
    'Atiganda','Sukarman','Dhriti','Shula','Ganda',
    'Vriddhi','Dhruva','Vyaghata','Harshana','Vajra',
    'Siddhi','Vyatipata','Variyan','Parigha','Shiva',
    'Siddha','Sadhya','Shubha','Shukla','Brahma',
    'Mahendra','Vaidhriti',
  ];
  const AUS_YOGA = new Set([1,2,3,4,7,10,11,13,15,19,20,21,22,23,24,25]);

  const yogaSlots: YogaSlot[] = yogaSegs.map((seg, i) => ({
    name: YOGA_NAMES[seg.index] ?? `Yoga ${seg.index}`,
    isAuspicious: AUS_YOGA.has(seg.index),
    ...boundaryFields(seg, i, jdnStart, jdnEnd),
  }));

  // ── Karana ──
  const karanaSegs = findSegments(jdnStart, jdnEnd, jdn => {
    return Math.floor(elongation(jdn) / 6);
  });

  const FIXED_K  = ['Kimstughna','Shakuni','Chatushpada','Naga'];
  const REPEAT_K = ['Bava','Balava','Kaulava','Taitila','Garija','Vanija','Vishti'];

  karanaSegs;
  const karanaSlots: KaranaSlot[] = karanaSegs.map((seg, i) => {
    const ki = seg.index;
    let name: string;
    if (ki === 0) name = FIXED_K[0];
    else if (ki >= 57) name = FIXED_K[ki - 56];
    else name = REPEAT_K[(ki - 1) % 7];
    return {
      name,
      ...boundaryFields(seg, i, jdnStart, jdnEnd),
    };
  });

  return { tithi: tithiSlots, nakshatra: nakshatraSlots, yoga: yogaSlots, karana: karanaSlots };
}
