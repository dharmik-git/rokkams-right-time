import { NextRequest, NextResponse } from 'next/server';
import { computePanchang } from '@/lib/calculations/panchang';
import { calculateMuhurta } from '@/lib/calculations/muhurta';
import { computeTransitions } from '@/lib/calculations/transitions';
import { computeAmritKalam, computeVidalYoga } from '@/lib/calculations/nakshatraMuhurta';
import { MUSCAT } from '@/lib/muscat';

function getUTCOffsetMinutes(date: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  }).formatToParts(date);
  const tzStr = parts.find(p => p.type === 'timeZoneName')?.value ?? 'GMT+0';
  const match = tzStr.match(/GMT([+-]?)(\d+)?(?::(\d+))?/);
  if (!match) return 0;
  const sign = match[1] === '-' ? -1 : 1;
  return sign * ((parseInt(match[2] ?? '0')) * 60 + parseInt(match[3] ?? '0'));
}

function localDateStringToUTC(dateStr: string, timezone: string): Date {
  const noonUTC = new Date(dateStr + 'T12:00:00Z');
  const offsetMin = getUTCOffsetMinutes(noonUTC, timezone);
  return new Date(noonUTC.getTime() - offsetMin * 60000);
}

function roundMin(d: Date | null | undefined): string | null {
  if (!d) return null;
  const sec = d.getSeconds() + d.getMilliseconds() / 1000;
  const rounded = new Date(d.getTime() - sec * 1000 + (sec >= 30 ? 60000 : 0));
  rounded.setMilliseconds(0);
  return rounded.toISOString();
}

function serializeInterval(iv: { start: Date; end: Date }) {
  return { start: roundMin(iv.start)!, end: roundMin(iv.end)! };
}

function serializeMuhurta(m: ReturnType<typeof computePanchang>['muhurta']) {
  return {
    rahuKalam:       serializeInterval(m.rahuKalam),
    gulikaKalam:     serializeInterval(m.gulikaKalam),
    yamaGanda:       serializeInterval(m.yamaGanda),
    abhijitMuhurta:  m.abhijitMuhurta ? serializeInterval(m.abhijitMuhurta) : null,
    brahmaMuhurta:   serializeInterval(m.brahmaMuhurta),
    godhuliMuhurta:  serializeInterval(m.godhuliMuhurta),
    vijayaMuhurta:   serializeInterval(m.vijayaMuhurta),
    pratahSandhya:   serializeInterval(m.pratahSandhya),
    sayahanaSandhya: serializeInterval(m.sayahanaSandhya),
    nishitaMuhurta:  serializeInterval(m.nishitaMuhurta),
    madhyahnaSandhya: serializeInterval(m.madhyahnaSandhya),
    amritKalam:      m.amritKalam.map(serializeInterval),
    durMuhurta:      m.durMuhurta.map(serializeInterval),
    varjyam:         m.varjyam.map(serializeInterval),
    baana:           m.baana.map(serializeInterval),
    vidalYoga:       m.vidalYoga.map(serializeInterval),
    bhadra:          m.bhadra.map(serializeInterval),
  };
}

function serializePanchang(data: ReturnType<typeof computePanchang>) {
  return {
    ...data,
    date: data.date.toISOString(),
    sunMoonTimes: {
      sunrise:   roundMin(data.sunMoonTimes.sunrise),
      sunset:    roundMin(data.sunMoonTimes.sunset),
      solarNoon: roundMin(data.sunMoonTimes.solarNoon),
      moonrise:  roundMin(data.sunMoonTimes.moonrise),
      moonset:   roundMin(data.sunMoonTimes.moonset),
    },
    muhurta: serializeMuhurta(data.muhurta),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date: dateInput } = body;

    if (!dateInput || !/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      return NextResponse.json({ error: 'date (YYYY-MM-DD) is required' }, { status: 400 });
    }

    const dateStr: string = dateInput;
    const date = localDateStringToUTC(dateStr, MUSCAT.timezone);

    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
    }

    // Compute panchang for this date
    const data = computePanchang(date, MUSCAT);

    // Get yesterday's sunset for accurate Brahma Muhurta
    const yesterday = new Date(date.getTime() - 86400000);
    const prevData = computePanchang(yesterday, MUSCAT);
    const prevSunset = prevData.sunMoonTimes.sunset;

    // Recompute muhurta with yesterday's sunset
    const sunrise = data.sunMoonTimes.sunrise;
    const sunset = data.sunMoonTimes.sunset;
    const solarNoon = data.sunMoonTimes.solarNoon;
    const muhurta = calculateMuhurta(sunrise, sunset, solarNoon, date.getDay(), prevSunset ?? undefined);

    // Amrit Kalam: nakshatra-based (DrikPanchang method), spanning this
    // panchang day from sunrise to next sunrise. May be empty (not observed).
    const tomorrow = new Date(date.getTime() + 86400000);
    const nextData = computePanchang(tomorrow, MUSCAT);
    const nextSunrise = nextData.sunMoonTimes.sunrise;
    muhurta.amritKalam = computeAmritKalam(sunrise, nextSunrise);
    muhurta.vidalYoga  = computeVidalYoga(sunrise, nextSunrise);

    // Compute element transition times for the full Muscat calendar day (midnight → midnight)
    const offsetMin = getUTCOffsetMinutes(date, MUSCAT.timezone);
    const midnightUTC = new Date(new Date(dateStr + 'T00:00:00Z').getTime() - offsetMin * 60000);
    const nextMidnightUTC = new Date(midnightUTC.getTime() + 86400000);
    const transitions = computeTransitions(midnightUTC, nextMidnightUTC);

    const result = { ...data, muhurta, transitions };
    return NextResponse.json(serializePanchang(result));
  } catch (err) {
    console.error('Panchang API error:', err);
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 });
  }
}
