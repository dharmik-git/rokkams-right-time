import type { DayTransitions } from '@/lib/calculations/transitions';

export interface BusinessSlot {
  start: number;
  end: number;
  finalScore: number;
  baseScore: number;
  multiplier: number;
  multiplierLabel: string;
  penaltyLabel: string;
  tithiName: string;
  tithiScore: number;
  nakshatraName: string;
  nakshatraScore: number;
  varaName: string;
  varaScore: number;
  yogaName: string;
  yogaScore: number;
  karanaName: string;
  karanaScore: number;
  paksha: string;
  pakshaScore: number;
  starCount: number;
}

export interface ExcludedPeriod {
  label: string;
  start: string;
  end: string;
}

// ── Score tables ─────────────────────────────────────────────────────────────

const TITHI_INDEX: Record<string, number> = {
  Pratipada: 1, Dwitiya: 2, Tritiya: 3, Chaturthi: 4, Panchami: 5,
  Shashthi: 6, Saptami: 7, Ashtami: 8, Navami: 9, Dashami: 10,
  Ekadashi: 11, Dwadashi: 12, Trayodashi: 13, Chaturdashi: 14,
  Purnima: 15, Amavasya: 15,
};

const TITHI_SCORES: Record<number, number> = {
  1: 80, 2: 100, 3: 80, 4: 20, 5: 100,
  6: 80, 7: 100, 8: 40, 9: 20, 10: 100,
  11: 100, 12: 100, 13: 100, 14: 20,
};

function tithiScore(name: string, paksha: string): number {
  const idx = TITHI_INDEX[name] ?? 0;
  if (idx === 15) return paksha === 'Shukla' ? 60 : 20;
  return TITHI_SCORES[idx] ?? 60;
}

const NAKSHATRA_SCORES: Record<string, number> = {
  Ashwini: 80, Bharani: 20, Krittika: 20, Rohini: 100, Mrigashira: 100,
  Ardra: 40, Punarvasu: 100, Pushya: 80, Ashlesha: 40, Magha: 20,
  'Purva Phalguni': 60, 'Uttara Phalguni': 100, Hasta: 100, Chitra: 100,
  Swati: 80, Vishakha: 60, Anuradha: 100, Jyeshtha: 40, Mula: 20,
  'Purva Ashadha': 60, 'Uttara Ashadha': 100, Shravana: 100,
  Dhanishtha: 100, Shatabhisha: 80, 'Purva Bhadrapada': 60,
  'Uttara Bhadrapada': 100, Revati: 100,
};

// 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
const VARA_SCORES = [60, 80, 20, 100, 100, 100, 40];

const VARA_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const YOGA_SCORES: Record<string, number> = {
  Vishkambha: 80, Priti: 100, Ayushman: 100, Saubhagya: 100, Shobhana: 100,
  Atiganda: 20, Sukarman: 100, Dhriti: 100, Shula: 20, Ganda: 20,
  Vriddhi: 100, Dhruva: 100, Vyaghata: 20, Harshana: 80, Vajra: 40,
  Siddhi: 100, Vyatipata: 20, Variyan: 60, Parigha: 20, Shiva: 100,
  Siddha: 100, Sadhya: 100, Shubha: 100, Shukla: 100, Brahma: 80,
  Mahendra: 80, Vaidhriti: 20,
};

const KARANA_SCORES: Record<string, number> = {
  Bava: 100, Balava: 100, Kaulava: 100, Taitula: 100, Vanija: 100,
  Garaja: 80, Kimstughna: 60, Shakuni: 40,
  Vishti: 20, Chatushpada: 20, Naga: 20,
};

const PAKSHA_SCORES: Record<string, number> = { Shukla: 100, Krishna: 60 };

// ── Multipliers & exclusion keys ─────────────────────────────────────────────

const AUSPICIOUS_KEYS = [
  'brahmaMuhurta', 'abhijitMuhurta', 'godhuliMuhurta', 'amritKalam',
  'pratahSandhya', 'vijayaMuhurta', 'madhyahnaSandhya', 'sayahanaSandhya',
  'nishitaMuhurta',
];

const MULTIPLIERS: Record<string, number> = {
  abhijitMuhurta: 1.15, vijayaMuhurta: 1.15, amritKalam: 1.15,
  godhuliMuhurta: 1.08, brahmaMuhurta: 1.03, pratahSandhya: 1.02,
  madhyahnaSandhya: 0.95, sayahanaSandhya: 0.95, nishitaMuhurta: 0.90,
};

const MULTIPLIER_LABELS: Record<string, string> = {
  abhijitMuhurta: 'Abhijit Muhurta', vijayaMuhurta: 'Vijaya Muhurta',
  amritKalam: 'Amrit Kalam', godhuliMuhurta: 'Godhuli Muhurta',
  brahmaMuhurta: 'Brahma Muhurta', pratahSandhya: 'Pratah Sandhya',
  madhyahnaSandhya: 'Madhyahna Sandhya', sayahanaSandhya: 'Sayahana Sandhya',
  nishitaMuhurta: 'Nishita Muhurta',
};

// Hard exclusions — segment is rejected if any of these overlap at midpoint
const HARD_EXCLUSION_KEYS = ['rahuKalam', 'yamaGanda', 'durMuhurta', 'varjyam', 'bhadra'];

// Penalty periods — 50% score reduction; reject if result < 70
const PENALTY_KEYS = ['gulikaKalam', 'baana', 'vidalYoga'];

const PENALTY_LABELS: Record<string, string> = {
  gulikaKalam: 'Gulika Kalam', baana: 'Baana', vidalYoga: 'Vidal Yoga',
};

const ALL_INAUSPICIOUS_KEYS = [
  'rahuKalam', 'yamaGanda', 'gulikaKalam', 'durMuhurta',
  'varjyam', 'bhadra', 'baana', 'vidalYoga',
];

export const EXCLUDED_PERIOD_LABELS: Record<string, string> = {
  rahuKalam: 'Rahu Kalam', yamaGanda: 'Yama Ganda', gulikaKalam: 'Gulika Kalam',
  durMuhurta: 'Dur Muhurta', varjyam: 'Varjyam', bhadra: 'Bhadra',
  baana: 'Baana', vidalYoga: 'Vidal Yoga',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function starCount(score: number): number {
  if (score >= 95) return 5;
  if (score >= 85) return 4.5;
  if (score >= 75) return 4;
  if (score >= 65) return 3;
  if (score >= 50) return 2;
  return 1;
}

interface Slot { start: string | null; end: string | null; }

function activeAt<T extends Slot>(slots: T[], timeMs: number): T | undefined {
  return slots.find(s => {
    const lo = s.start ? new Date(s.start).getTime() : -Infinity;
    const hi = s.end   ? new Date(s.end).getTime()   :  Infinity;
    return lo <= timeMs && timeMs <= hi;
  });
}

/** Collect all start/end timestamps from a muhurta key (single obj or array). */
function intervalTimes(raw: any): { start: string; end: string }[] {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.filter((iv: any) => iv?.start && iv?.end);
}

/** True if `timeMs` falls inside any interval for the given muhurta key. */
function overlapsAt(muhurta: Record<string, any>, key: string, timeMs: number): boolean {
  return intervalTimes(muhurta[key]).some(iv => {
    const lo = new Date(iv.start).getTime();
    const hi = new Date(iv.end).getTime();
    return lo <= timeMs && timeMs <= hi;
  });
}

// ── Main export ───────────────────────────────────────────────────────────────

export function computeBusinessSlots(
  transitions: DayTransitions,
  muhurta: Record<string, any>,
  varaIndex: number,
  paksha: 'Shukla' | 'Krishna',
): BusinessSlot[] {
  const varaScoreVal = VARA_SCORES[varaIndex] ?? 60;
  const varaName = VARA_NAMES[varaIndex] ?? 'Unknown';
  const pakshaScoreVal = PAKSHA_SCORES[paksha] ?? 60;

  // ── Step 1: collect all boundary timestamps ──────────────────────────────
  const boundaries = new Set<number>();

  for (const arr of [transitions.tithi, transitions.nakshatra, transitions.yoga, transitions.karana]) {
    for (const slot of arr) {
      if (slot.start) boundaries.add(new Date(slot.start).getTime());
      if (slot.end)   boundaries.add(new Date(slot.end).getTime());
    }
  }

  for (const key of [...AUSPICIOUS_KEYS, ...ALL_INAUSPICIOUS_KEYS]) {
    for (const iv of intervalTimes(muhurta[key])) {
      boundaries.add(new Date(iv.start).getTime());
      boundaries.add(new Date(iv.end).getTime());
    }
  }

  const sorted = Array.from(boundaries).sort((a, b) => a - b);

  // ── Steps 2–5: score each interval ──────────────────────────────────────
  const slots: BusinessSlot[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const s = sorted[i], e = sorted[i + 1];
    if (e - s < 60000) continue;

    const mid = (s + e) / 2;

    // Resolve active elements
    const tSlot = activeAt(transitions.tithi, mid);
    const nSlot = activeAt(transitions.nakshatra, mid);
    const ySlot = activeAt(transitions.yoga, mid);
    const kSlot = activeAt(transitions.karana, mid);
    if (!tSlot || !nSlot || !ySlot || !kSlot) continue;

    // Step 3: BaseScore
    const ns = NAKSHATRA_SCORES[nSlot.name] ?? 60;
    const ts = tithiScore(tSlot.name, tSlot.paksha);
    const ys = YOGA_SCORES[ySlot.name] ?? 60;
    const ks = KARANA_SCORES[kSlot.name] ?? 60;
    const baseScore = ns * 0.35 + ts * 0.25 + varaScoreVal * 0.10 + ys * 0.10 + ks * 0.10 + pakshaScoreVal * 0.10;

    // Step 4: auspicious multiplier (highest wins)
    let multiplier = 1.0;
    let multiplierLabel = '';
    for (const key of AUSPICIOUS_KEYS) {
      if (overlapsAt(muhurta, key, mid)) {
        const m = MULTIPLIERS[key] ?? 1.0;
        if (m > multiplier) { multiplier = m; multiplierLabel = MULTIPLIER_LABELS[key]; }
      }
    }

    let finalScore = baseScore * multiplier;

    // Step 5: inauspicious rules
    const inauspiciousCount = ALL_INAUSPICIOUS_KEYS.filter(k => overlapsAt(muhurta, k, mid)).length;

    // Multiple doshas → reject
    if (inauspiciousCount >= 2) continue;

    // Hard exclusion check
    const hardHit = HARD_EXCLUSION_KEYS.find(k => overlapsAt(muhurta, k, mid));
    if (hardHit) continue;

    // Vishti karana special rule
    if (kSlot.name === 'Vishti') continue;

    // Penalty check
    let penaltyLabel = '';
    const penaltyHit = PENALTY_KEYS.find(k => overlapsAt(muhurta, k, mid));
    if (penaltyHit) {
      finalScore *= 0.50;
      penaltyLabel = PENALTY_LABELS[penaltyHit];
      if (finalScore < 70) continue;
    }

    slots.push({
      start: s, end: e,
      finalScore: Math.round(finalScore * 10) / 10,
      baseScore: Math.round(baseScore * 10) / 10,
      multiplier, multiplierLabel, penaltyLabel,
      tithiName: tSlot.name, tithiScore: ts,
      nakshatraName: nSlot.name, nakshatraScore: ns,
      varaName, varaScore: varaScoreVal,
      yogaName: ySlot.name, yogaScore: ys,
      karanaName: kSlot.name, karanaScore: ks,
      paksha, pakshaScore: pakshaScoreVal,
      starCount: starCount(finalScore),
    });
  }

  // ── Step 6: merge adjacent identical segments ─────────────────────────────
  const merged: BusinessSlot[] = [];
  for (const slot of slots) {
    const prev = merged[merged.length - 1];
    if (
      prev && prev.end === slot.start &&
      prev.tithiName === slot.tithiName &&
      prev.nakshatraName === slot.nakshatraName &&
      prev.yogaName === slot.yogaName &&
      prev.karanaName === slot.karanaName &&
      prev.multiplierLabel === slot.multiplierLabel &&
      prev.penaltyLabel === slot.penaltyLabel
    ) {
      prev.end = slot.end;
    } else {
      merged.push({ ...slot });
    }
  }

  // ── Step 7: sort with tie-breaker, return top 5 ───────────────────────────
  const PREMIUM = new Set(['Abhijit Muhurta', 'Vijaya Muhurta', 'Amrit Kalam']);

  return merged
    .sort((a, b) => {
      if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
      if (b.nakshatraScore !== a.nakshatraScore) return b.nakshatraScore - a.nakshatraScore;
      if (b.tithiScore !== a.tithiScore) return b.tithiScore - a.tithiScore;
      if (b.yogaScore !== a.yogaScore) return b.yogaScore - a.yogaScore;
      const aP = PREMIUM.has(a.multiplierLabel) ? 1 : 0;
      const bP = PREMIUM.has(b.multiplierLabel) ? 1 : 0;
      if (bP !== aP) return bP - aP;
      return (b.end - b.start) - (a.end - a.start);
    })
    .slice(0, 5);
}

export function getExcludedPeriods(muhurta: Record<string, any>): ExcludedPeriod[] {
  const result: ExcludedPeriod[] = [];
  for (const key of ALL_INAUSPICIOUS_KEYS) {
    for (const iv of intervalTimes(muhurta[key])) {
      result.push({ label: EXCLUDED_PERIOD_LABELS[key], start: iv.start, end: iv.end });
    }
  }
  return result;
}
