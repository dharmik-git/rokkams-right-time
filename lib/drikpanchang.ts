// Fetches Baana and Bhadra timings directly from DrikPanchang (Muscat).
// Called server-side from the /api/panchang route.

import type { TimeInterval } from '@/types/panchang';

const GEO_ID = '287286'; // Muscat, Oman
const TZ_HOURS = 4;      // UTC+4

// ─── HTML helpers ────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Find the dpTableValue HTML that immediately follows a dpTableKey containing
 * exactly `key`. Returns the raw inner HTML of that value cell, or ''.
 */
function extractValueHtml(pageHtml: string, key: string): string {
  // Match: dpTableKey cell containing key text, followed by dpTableValue cell
  const keyRe = new RegExp(
    `class="dpTableCell dpTableKey"[^>]*>(?:<[^>]+>)*\\s*${key}\\s*(?:</[^>]+>)*\\s*</div>\\s*<div[^>]*class="[^"]*dpTableValue[^"]*"[^>]*>`,
    'i'
  );
  const m = pageHtml.match(keyRe);
  if (!m) return '';
  const afterOpen = pageHtml.indexOf(m[0]) + m[0].length;
  const closeDiv = pageHtml.indexOf('</div>', afterOpen);
  return closeDiv === -1 ? '' : pageHtml.slice(afterOpen, closeDiv);
}

// ─── Time parsing ─────────────────────────────────────────────────────────────

/** Parse "HH:MM AM" or "HH:MM PM" → minutes since midnight. */
function parseHHMM(s: string): number | null {
  const m = s.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12;
  if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

/** Minutes-since-midnight on a given local calendar midnight (UTC Date). */
function minutesToDate(minutes: number, midnight: Date): Date {
  return new Date(midnight.getTime() + minutes * 60000);
}

/**
 * Given a slice of HTML that comes AFTER a time string, return true if it
 * contains a month-name date reference inside a dpInlineBlock span — meaning
 * that time is on the NEXT calendar day.
 */
function nextDayDateFollows(htmlAfterTime: string): boolean {
  return /dpInlineBlock[^>]*>[^<]*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(
    htmlAfterTime.slice(0, 300)
  );
}

// ─── Parsers ─────────────────────────────────────────────────────────────────

function parseBaana(
  pageHtml: string,
  sunrise: Date,
  nextSunrise: Date,
  localMidnight: Date
): TimeInterval[] {
  const raw = extractValueHtml(pageHtml, 'Baana');
  if (!raw || /^\s*(&nbsp;)?\s*$/.test(raw)) return [];

  const text = stripHtml(raw);
  const nextMidnight = new Date(localMidnight.getTime() + 86400000);

  // Extract Baana type name (first word before "upto"/"from"/time)
  const typeMatch = text.match(/^([A-Za-z]+)\s+/);
  const label = typeMatch ? typeMatch[1] : undefined;

  // ── Pattern 1: "TYPE upto HH:MM AM[, Mon DD]" ────────────────────────────
  // Baana was active before sunrise; ends at the given time (possibly next day)
  const uptoM = text.match(/upto\s+(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
  if (uptoM) {
    const mins = parseHHMM(uptoM[1]);
    if (mins === null) return [];
    const posAfterTime = raw.indexOf(uptoM[1]) + uptoM[1].length;
    const isNextDay = nextDayDateFollows(raw.slice(posAfterTime));
    const end = minutesToDate(mins, isNextDay ? nextMidnight : localMidnight);
    const clipEnd = new Date(Math.min(end.getTime(), nextSunrise.getTime()));
    if (clipEnd <= sunrise) return [];
    return [{ start: sunrise, end: clipEnd, label }];
  }

  // ── Pattern 2: "TYPE from HH:MM AM[, Mon DD] to Full Night" ──────────────
  // Baana starts at the given time; continues past the end of the panchang day
  if (/full\s*night/i.test(text)) {
    const fromM = text.match(/from\s+(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
    if (fromM) {
      const mins = parseHHMM(fromM[1]);
      if (mins === null) return [];
      const posAfterTime = raw.indexOf(fromM[1]) + fromM[1].length;
      const isNextDay = nextDayDateFollows(raw.slice(posAfterTime));
      const start = minutesToDate(mins, isNextDay ? nextMidnight : localMidnight);
      const clipStart = new Date(Math.max(start.getTime(), sunrise.getTime()));
      if (clipStart >= nextSunrise) return [];
      return [{ start: clipStart, end: nextSunrise, label }];
    }
  }

  // ── Pattern 3: explicit "HH:MM to HH:MM" range within the day ─────────────
  const times = [...text.matchAll(/(\d{1,2}:\d{2}\s*(?:AM|PM))/gi)];
  if (times.length >= 2) {
    const startMins = parseHHMM(times[0][1]);
    const endMins   = parseHHMM(times[1][1]);
    if (startMins === null || endMins === null) return [];
    const t0pos = raw.indexOf(times[0][1]);
    const t1pos = raw.indexOf(times[1][1], t0pos + times[0][1].length);
    const start = minutesToDate(startMins, nextDayDateFollows(raw.slice(t0pos - 5, t0pos + 100)) ? nextMidnight : localMidnight);
    const end   = minutesToDate(endMins,   nextDayDateFollows(raw.slice(t1pos - 5, t1pos + 100)) ? nextMidnight : localMidnight);
    const clipStart = new Date(Math.max(start.getTime(), sunrise.getTime()));
    const clipEnd   = new Date(Math.min(end.getTime(),   nextSunrise.getTime()));
    if (clipEnd <= clipStart) return [];
    return [{ start: clipStart, end: clipEnd, label }];
  }

  return [];
}

function parseBhadra(
  pageHtml: string,
  sunrise: Date,
  nextSunrise: Date,
  localMidnight: Date
): TimeInterval[] {
  const raw = extractValueHtml(pageHtml, 'Bhadra');
  if (!raw || /^\s*(&nbsp;)?\s*$/.test(raw)) return [];

  const text = stripHtml(raw);
  const nextMidnight = new Date(localMidnight.getTime() + 86400000);

  // "Full Night" end → clips to nextSunrise
  if (/full\s*night/i.test(text)) {
    const m = text.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
    if (!m) return [];
    const mins = parseHHMM(m[1]);
    if (mins === null) return [];
    const posAfter = raw.indexOf(m[1]) + m[1].length;
    const start = minutesToDate(mins, nextDayDateFollows(raw.slice(0, raw.indexOf(m[1]) + 100)) ? nextMidnight : localMidnight);
    const clipStart = new Date(Math.max(start.getTime(), sunrise.getTime()));
    if (clipStart >= nextSunrise) return [];
    return [{ start: clipStart, end: nextSunrise }];
  }

  // "upto HH:MM" → Bhadra started before sunrise, ends here
  const uptoM = text.match(/upto\s+(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
  if (uptoM) {
    const mins = parseHHMM(uptoM[1]);
    if (mins === null) return [];
    const posAfterTime = raw.indexOf(uptoM[1]) + uptoM[1].length;
    const isNextDay = nextDayDateFollows(raw.slice(posAfterTime));
    const end = minutesToDate(mins, isNextDay ? nextMidnight : localMidnight);
    const clipEnd = new Date(Math.min(end.getTime(), nextSunrise.getTime()));
    if (clipEnd <= sunrise) return [];
    return [{ start: sunrise, end: clipEnd }];
  }

  // General "HH:MM to HH:MM" range
  const times = [...text.matchAll(/(\d{1,2}:\d{2}\s*(?:AM|PM))/gi)];
  if (times.length >= 2) {
    const startMins = parseHHMM(times[0][1]);
    const endMins   = parseHHMM(times[1][1]);
    if (startMins === null || endMins === null) return [];
    const t0pos = raw.indexOf(times[0][1]);
    const t1pos = raw.indexOf(times[1][1], t0pos + times[0][1].length);
    const start = minutesToDate(startMins, nextDayDateFollows(raw.slice(Math.max(0, t0pos - 100), t0pos + 50)) ? nextMidnight : localMidnight);
    const end   = minutesToDate(endMins,   nextDayDateFollows(raw.slice(t1pos - 5, t1pos + 200)) ? nextMidnight : localMidnight);
    const clipStart = new Date(Math.max(start.getTime(), sunrise.getTime()));
    const clipEnd   = new Date(Math.min(end.getTime(),   nextSunrise.getTime()));
    if (clipEnd <= clipStart) return [];
    return [{ start: clipStart, end: clipEnd }];
  }

  return [];
}

/**
 * Locate time tokens in the raw HTML, tolerant of the <span> tags DrikPanchang
 * inserts between the digits and the AM/PM marker (e.g. "12:29 <span>PM</span>").
 * Returns minutes-since-midnight plus the start/end character positions so a
 * following date annotation ("…, Jun 25") can be detected for next-day times.
 */
function findTimeTokens(raw: string): { mins: number; startPos: number; endPos: number }[] {
  const re = /(\d{1,2}):(\d{2})(?:\s|<[^>]*>)*?(AM|PM)/gi;
  const out: { mins: number; startPos: number; endPos: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12;
    if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
    out.push({ mins: h * 60 + min, startPos: m.index, endPos: re.lastIndex });
  }
  return out;
}

/**
 * Vidaal Yoga is presented like Bhadra — a time range over the panchang day
 * (e.g. "05:19 AM to 11:46 PM"), possibly crossing into the next day
 * ("…, Jun 25") or "Full Night", and absent when not observed.
 */
function parseVidalYoga(
  pageHtml: string,
  sunrise: Date,
  nextSunrise: Date,
  localMidnight: Date
): TimeInterval[] {
  const raw = extractValueHtml(pageHtml, 'Vidaal Yoga');
  if (!raw || /^\s*(&nbsp;)?\s*$/.test(raw)) return [];

  const text = stripHtml(raw);
  const nextMidnight = new Date(localMidnight.getTime() + 86400000);
  const toks = findTimeTokens(raw);
  if (toks.length === 0) return [];

  // A month-name date annotation within `span` after a time → that time is next-day.
  const nextDayAfter = (fromPos: number, toPos: number) =>
    nextDayDateFollows(raw.slice(fromPos, toPos));

  // "Full Night" end → starts at first time, clips to nextSunrise
  if (/full\s*night/i.test(text)) {
    const t = toks[0];
    const start = minutesToDate(t.mins, nextDayAfter(t.endPos, t.endPos + 220) ? nextMidnight : localMidnight);
    const clipStart = new Date(Math.max(start.getTime(), sunrise.getTime()));
    if (clipStart >= nextSunrise) return [];
    return [{ start: clipStart, end: nextSunrise }];
  }

  // "upto HH:MM" → started before sunrise, single end time
  if (/upto/i.test(text)) {
    const t = toks[0];
    const end = minutesToDate(t.mins, nextDayAfter(t.endPos, t.endPos + 220) ? nextMidnight : localMidnight);
    const clipEnd = new Date(Math.min(end.getTime(), nextSunrise.getTime()));
    if (clipEnd <= sunrise) return [];
    return [{ start: sunrise, end: clipEnd }];
  }

  // "START to END[, Mon DD]" range
  if (toks.length >= 2) {
    const a = toks[0], b = toks[1];
    const startNextDay = nextDayAfter(a.endPos, b.startPos);            // date between the two times → start is next-day
    const endNextDay   = startNextDay || nextDayAfter(b.endPos, b.endPos + 220);
    const start = minutesToDate(a.mins, startNextDay ? nextMidnight : localMidnight);
    const end   = minutesToDate(b.mins, endNextDay   ? nextMidnight : localMidnight);
    const clipStart = new Date(Math.max(start.getTime(), sunrise.getTime()));
    const clipEnd   = new Date(Math.min(end.getTime(),   nextSunrise.getTime()));
    if (clipEnd <= clipStart) return [];
    return [{ start: clipStart, end: clipEnd }];
  }

  return [];
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchDrikInauspicious(
  sunrise: Date,
  nextSunrise: Date
): Promise<{ baana: TimeInterval[]; bhadra: TimeInterval[]; vidalYoga: TimeInterval[] }> {
  // Format the panchang date as DD/MM/YYYY in Muscat local time
  const localDate = new Date(sunrise.getTime() + TZ_HOURS * 3600000);
  const dd = localDate.getUTCDate().toString().padStart(2, '0');
  const mm = (localDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const yyyy = localDate.getUTCFullYear();
  const dateStr = `${dd}/${mm}/${yyyy}`;

  // Local midnight of the panchang calendar day (UTC)
  const localMidnight = new Date(
    Date.UTC(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate())
    - TZ_HOURS * 3600000
  );

  try {
    const res = await fetch(
      `https://www.drikpanchang.com/panchang/day-panchang.html?geoname-id=${GEO_ID}&date=${dateStr}`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PanchangApp/1.0)' },
        next: { revalidate: 86400 },
      }
    );
    if (!res.ok) return { baana: [], bhadra: [], vidalYoga: [] };
    const html = await res.text();

    return {
      baana:     parseBaana(html, sunrise, nextSunrise, localMidnight),
      bhadra:    parseBhadra(html, sunrise, nextSunrise, localMidnight),
      vidalYoga: parseVidalYoga(html, sunrise, nextSunrise, localMidnight),
    };
  } catch {
    return { baana: [], bhadra: [], vidalYoga: [] };
  }
}
