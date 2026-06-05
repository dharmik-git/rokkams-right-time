import type { MuhurtaResult, TimeInterval } from '@/types/panchang';

// Rahu Kalam part index (1-based) by weekday (0=Sun)
const RAHU_PART = [8, 2, 7, 5, 6, 4, 3];
// Gulika Kalam part index by weekday
const GULIKA_PART = [7, 6, 5, 4, 3, 2, 1];
// Yama Ganda part index by weekday
const YAMA_GANDA_PART = [5, 4, 3, 2, 1, 7, 6];

// Dur Muhurta positions (muhurta index 1-15) by weekday — calibrated against DrikPanchang.
// Friday has two windows; all other days have one.
const DUR_MUHURTA_POS: number[][] = [
  [14],    // Sun
  [9],     // Mon
  [4],     // Tue
  [8],     // Wed
  [6],     // Thu
  [4, 9],  // Fri
  [1],     // Sat
];

function getPart(sunrise: Date, sunset: Date, partIndex: number): TimeInterval {
  const dayMs = sunset.getTime() - sunrise.getTime();
  const partMs = dayMs / 8;
  const start = new Date(sunrise.getTime() + (partIndex - 1) * partMs);
  const end = new Date(start.getTime() + partMs);
  return { start, end };
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

// Subtract inauspicious intervals from an auspicious interval → array of clean sub-intervals
export function subtractIntervals(auspicious: TimeInterval, inauspicious: TimeInterval[]): TimeInterval[] {
  let remaining: TimeInterval[] = [{ ...auspicious }];
  for (const bad of inauspicious) {
    const next: TimeInterval[] = [];
    for (const seg of remaining) {
      if (bad.end.getTime() <= seg.start.getTime() || bad.start.getTime() >= seg.end.getTime()) {
        next.push(seg);
      } else {
        if (bad.start.getTime() > seg.start.getTime()) {
          next.push({ start: seg.start, end: bad.start });
        }
        if (bad.end.getTime() < seg.end.getTime()) {
          next.push({ start: bad.end, end: seg.end });
        }
      }
    }
    remaining = next;
  }
  return remaining.filter(s => s.end.getTime() - s.start.getTime() > 60000); // drop < 1 min
}

export function calculateMuhurta(
  sunrise: Date,
  sunset: Date,
  solarNoon: Date,
  dayOfWeek: number,
  prevSunset?: Date
): MuhurtaResult {
  const dayMs = sunset.getTime() - sunrise.getTime();
  const muhurtaDurationMs = dayMs / 15;

  // ── Inauspicious ─────────────────────────────────────────────────────────
  const rahuKalam = getPart(sunrise, sunset, RAHU_PART[dayOfWeek]);
  const gulikaKalam = getPart(sunrise, sunset, GULIKA_PART[dayOfWeek]);
  const yamaGanda = getPart(sunrise, sunset, YAMA_GANDA_PART[dayOfWeek]);

  // Dur Muhurta: 1 window most days, 2 on Fridays — positions calibrated against DrikPanchang
  const durMuhurta: TimeInterval[] = DUR_MUHURTA_POS[dayOfWeek].map(d1 => ({
    start: new Date(sunrise.getTime() + (d1 - 1) * muhurtaDurationMs),
    end:   new Date(sunrise.getTime() + d1 * muhurtaDurationMs),
  }));

  // Varjyam: computed nakshatra-based in the API route via computeVarjyam()
  const varjyam: TimeInterval[] = [];

  // Baana: Tara-based inauspicious period (varies by weekday and Tithi)
  // Simplified: 15-min window in early morning based on weekday offset
  const baanaOffsets = [30, 75, 15, 90, 45, 120, 60]; // minutes after sunrise
  const baana: TimeInterval[] = [
    {
      start: addMinutes(sunrise, baanaOffsets[dayOfWeek]),
      end: addMinutes(sunrise, baanaOffsets[dayOfWeek] + 15),
    },
  ];

  // Vidal Yoga: computed nakshatra-based in the API route via computeVidalYoga()
  const vidalYoga: TimeInterval[] = [];

  // Bhadra (Visti Karana): currently-active Visti half-Tithi period
  // Approximated as ~90 min window in the evening (before sunset)
  const bhadra: TimeInterval[] = [
    {
      start: addMinutes(sunset, -90),
      end: addMinutes(sunset, -15),
    },
  ];

  // ── Auspicious ────────────────────────────────────────────────────────────
  // Brahma Muhurta: 14th–15th muhurtas of the night before sunrise
  let brahmaMuhurta: TimeInterval;
  if (prevSunset) {
    const nightMs = sunrise.getTime() - prevSunset.getTime();
    const nightMuhurtaMs = nightMs / 15;
    brahmaMuhurta = {
      start: new Date(sunrise.getTime() - 2 * nightMuhurtaMs),
      end: new Date(sunrise.getTime() - nightMuhurtaMs),
    };
  } else {
    brahmaMuhurta = {
      start: addMinutes(sunrise, -96),
      end: addMinutes(sunrise, -48),
    };
  }

  // Abhijit: 8th of 15 day-muhurtas (absent on Wednesdays — traditional rule)
  const abhijitMuhurta: TimeInterval | null = dayOfWeek === 3 ? null : {
    start: new Date(sunrise.getTime() + 7 * muhurtaDurationMs),
    end: new Date(sunrise.getTime() + 8 * muhurtaDurationMs),
  };

  // Godhuli: just before sunset to ~20 min after (matches DrikPanchang formula)
  const godhuliMuhurta: TimeInterval = {
    start: addMinutes(sunset, -1),
    end: addMinutes(sunset, 20),
  };

  // Amrit Kalam: one primary window ~3 hrs after sunrise (~24 min)
  const amritKalam: TimeInterval[] = [
    {
      start: addMinutes(sunrise, 180),
      end: addMinutes(sunrise, 204),
    },
  ];

  // Pratah Sandhya: 63 min before sunrise → sunrise (matches DrikPanchang)
  const pratahSandhya: TimeInterval = {
    start: addMinutes(sunrise, -63),
    end: sunrise,
  };

  // Vijaya: 11th muhurta of the day (10-11 × muhurtaDuration after sunrise)
  // Matches DrikPanchang: starts at 10 × muhurtaDuration after sunrise
  const vijayaMuhurta: TimeInterval = {
    start: new Date(sunrise.getTime() + 10 * muhurtaDurationMs),
    end: new Date(sunrise.getTime() + 11 * muhurtaDurationMs),
  };

  // Sayahana Sandhya: sunset → 63 min after sunset (matches DrikPanchang)
  const sayahanaSandhya: TimeInterval = {
    start: sunset,
    end: addMinutes(sunset, 63),
  };

  // Nishita Muhurta: 8th of 15 night-muhurtas (midnight)
  // Night = sunset → next sunrise (approx next sunrise = sunrise + 24h)
  const nextSunriseApprox = addMinutes(sunrise, 24 * 60);
  const nightMs2 = nextSunriseApprox.getTime() - sunset.getTime();
  const nightMuhurtaMs2 = nightMs2 / 15;
  const nishitaMuhurta: TimeInterval = {
    start: new Date(sunset.getTime() + 7 * nightMuhurtaMs2),
    end: new Date(sunset.getTime() + 8 * nightMuhurtaMs2),
  };

  // Madhyahna Sandhya: 24-min window centred on solar noon
  const madhyahnaSandhya: TimeInterval = {
    start: addMinutes(solarNoon, -12),
    end: addMinutes(solarNoon, 12),
  };

  return {
    rahuKalam,
    gulikaKalam,
    yamaGanda,
    abhijitMuhurta,
    brahmaMuhurta,
    godhuliMuhurta,
    vijayaMuhurta,
    amritKalam,
    pratahSandhya,
    durMuhurta,
    varjyam,
    sayahanaSandhya,
    nishitaMuhurta,
    madhyahnaSandhya,
    baana,
    vidalYoga,
    bhadra,
  };
}
