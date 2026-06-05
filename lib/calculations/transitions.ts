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

  return segments;
}

// ─── Public interfaces ───────────────────────────────────────────────────────

export interface TithiSlot {
  name: string;
  paksha: 'Shukla' | 'Krishna';
  start: string | null; // ISO string; null = started before day
  end: string | null;   // ISO string; null = continues after day
}

export interface NakshatraSlot {
  name: string;
  pada: number;
  start: string | null;
  end: string | null;
}

export interface YogaSlot {
  name: string;
  isAuspicious: boolean;
  start: string | null;
  end: string | null;
}

export interface KaranaSlot {
  name: string;
  start: string | null;
  end: string | null;
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
      start: i === 0 && seg.startJdn <= jdnStart + 0.001 ? null : roundToMinute(seg.startJdn).toISOString(),
      end:   seg.endJdn >= jdnEnd - 0.001 ? null : roundToMinute(seg.endJdn).toISOString(),
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
      start: i === 0 && seg.startJdn <= jdnStart + 0.001 ? null : roundToMinute(seg.startJdn).toISOString(),
      end:   seg.endJdn >= jdnEnd - 0.001 ? null : roundToMinute(seg.endJdn).toISOString(),
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
    start: i === 0 && seg.startJdn <= jdnStart + 0.001 ? null : roundToMinute(seg.startJdn).toISOString(),
    end:   seg.endJdn >= jdnEnd - 0.001 ? null : roundToMinute(seg.endJdn).toISOString(),
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
      start: i === 0 && seg.startJdn <= jdnStart + 0.001 ? null : roundToMinute(seg.startJdn).toISOString(),
      end:   seg.endJdn >= jdnEnd - 0.001 ? null : roundToMinute(seg.endJdn).toISOString(),
    };
  });

  return { tithi: tithiSlots, nakshatra: nakshatraSlots, yoga: yogaSlots, karana: karanaSlots };
}
