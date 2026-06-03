'use client';
import InfoDot from '@/components/ui/InfoDot';
import ExpandSection from '@/components/ui/ExpandSection';
import { formatTime } from '@/lib/formatTime';
import { TITHIS, YOGAS, NAKSHATRAS, KARANAS, VARAS, PAKSHAS } from '@/lib/data/descriptions';

interface Interval { start: string; end: string; }

const AUSPICIOUS_KEYS = ['brahmaMuhurta','abhijitMuhurta','godhuliMuhurta','amritKalam','pratahSandhya','vijayaMuhurta','sayahanaSandhya','nishitaMuhurta'];
const INAUSPICIOUS_KEYS = ['rahuKalam','gulikaKalam','varjyam','baana','yamaGanda','vidalYoga','durMuhurta','bhadra'];

function computeRankedSlots(muhurta: Record<string, any>): Array<{ start: number; end: number; score: number }> {
  const boundaries = new Set<number>();
  const allAus: Interval[] = [];
  const allBad: Interval[] = [];

  for (const k of AUSPICIOUS_KEYS) {
    const raw = muhurta[k];
    if (raw === null) continue;
    const arr: Interval[] = Array.isArray(raw) ? raw : [raw];
    for (const iv of arr) { allAus.push(iv); boundaries.add(new Date(iv.start).getTime()); boundaries.add(new Date(iv.end).getTime()); }
  }
  for (const k of INAUSPICIOUS_KEYS) {
    const raw = muhurta[k];
    const arr: Interval[] = Array.isArray(raw) ? raw : [raw];
    for (const iv of arr) { allBad.push(iv); boundaries.add(new Date(iv.start).getTime()); boundaries.add(new Date(iv.end).getTime()); }
  }

  const sorted = Array.from(boundaries).sort((a, b) => a - b);
  const slots: Array<{ start: number; end: number; score: number }> = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const s = sorted[i], e = sorted[i + 1];
    if (e - s < 60000) continue;
    const mid = (s + e) / 2;
    const isBad = allBad.some(iv => new Date(iv.start).getTime() <= s && new Date(iv.end).getTime() >= e);
    if (isBad) continue;
    const score = allAus.filter(iv => new Date(iv.start).getTime() <= mid && new Date(iv.end).getTime() >= mid).length;
    if (score === 0) continue;
    slots.push({ start: s, end: e, score });
  }

  const merged: typeof slots = [];
  for (const slot of slots) {
    const prev = merged[merged.length - 1];
    if (prev && prev.end === slot.start && prev.score === slot.score) {
      prev.end = slot.end;
    } else {
      merged.push({ ...slot });
    }
  }

  return merged.sort((a, b) => b.score - a.score || a.start - b.start);
}

function buildQualityBrief(data: any): string {
  const lines: string[] = [];

  const tithiInfo = TITHIS[data.tithi?.name];
  const tithiOk = tithiInfo?.isAuspicious ?? true;
  lines.push(`${tithiOk ? '✅' : '❌'} Tithi (${data.tithi?.name ?? '—'}): ${tithiInfo?.idealFor ?? (tithiOk ? 'Auspicious' : 'Inauspicious')}`);

  const yogaInfo = YOGAS[data.yoga?.name];
  const yogaOk = yogaInfo?.isAuspicious ?? data.yoga?.isAuspicious ?? true;
  lines.push(`${yogaOk ? '✅' : '❌'} Yoga (${data.yoga?.name ?? '—'}): ${yogaInfo?.idealFor ?? (yogaOk ? 'Auspicious' : 'Inauspicious')}`);

  const varaInfo = VARAS[data.vara?.name];
  const varaOk = varaInfo?.isAuspicious ?? true;
  lines.push(`${varaOk ? '✅' : '❌'} Vara (${data.vara?.name ?? '—'}): ${varaInfo?.idealFor ?? (varaOk ? 'Auspicious' : 'Inauspicious')}`);

  const nakshatraInfo = NAKSHATRAS[data.nakshatra?.name];
  const nakshatraOk = nakshatraInfo?.isAuspicious ?? true;
  lines.push(`${nakshatraOk ? '✅' : '❌'} Nakshatra (${data.nakshatra?.name ?? '—'}): ${nakshatraInfo?.idealFor ?? (nakshatraOk ? 'Auspicious' : 'Inauspicious')}`);

  const karanaInfo = KARANAS[data.karana?.name];
  const karanaOk = karanaInfo?.isAuspicious ?? true;
  lines.push(`${karanaOk ? '✅' : '❌'} Karana (${data.karana?.name ?? '—'}): ${karanaInfo?.idealFor ?? (karanaOk ? 'Auspicious' : 'Inauspicious')}`);

  const pakshaInfo = PAKSHAS[data.paksha];
  const pakshaOk = pakshaInfo?.isAuspicious ?? true;
  lines.push(`${pakshaOk ? '✅' : '❌'} Paksha (${data.paksha ?? '—'}): ${pakshaInfo?.idealFor ?? (pakshaOk ? 'Auspicious' : 'Inauspicious')}`);

  return lines.join('\n');
}

function rankClass(i: number) {
  if (i === 0) return 'rank-1';
  if (i === 1) return 'rank-2';
  if (i === 2) return 'rank-3';
  return 'rank-n';
}

interface Props { muhurta: Record<string, any>; panchangData: any; }

export default function RankingTime({ muhurta, panchangData }: Props) {
  const ranked = computeRankedSlots(muhurta);
  const qualityBrief = buildQualityBrief(panchangData);

  return (
    <ExpandSection title="Ranking of Best Auspicious Time" accentColor="var(--gold-light)">
      {ranked.length === 0 ? (
        <p style={{ color: 'var(--moonsilver-dim)', fontStyle: 'italic', fontSize: '0.9rem' }}>No clean auspicious windows today.</p>
      ) : (
        ranked.map((slot, i) => {
          const startIso = new Date(slot.start).toISOString();
          const endIso   = new Date(slot.end).toISOString();
          const stars = '✦'.repeat(Math.min(slot.score, 5));
          return (
            <div key={i} className="time-chip" style={{ alignItems: 'center', gap: '0.6rem' }}>
              <span className={`rank-badge ${rankClass(i)}`}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="time-range">{formatTime(startIso)} — {formatTime(endIso)}</span>
                  <span style={{ color: 'var(--gold)', fontSize: '0.65rem', opacity: 0.7 }}>{stars}</span>
                </div>
              </div>
              <InfoDot
                title={`${formatTime(startIso)} — ${formatTime(endIso)}`}
                brief={qualityBrief}
              />
            </div>
          );
        })
      )}
      {ranked.length > 0 && (
        <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--moonsilver-dim)', fontStyle: 'italic' }}>
          ✦ = number of overlapping auspicious muhurtas · Dot shows today&apos;s quality
        </p>
      )}
    </ExpandSection>
  );
}
