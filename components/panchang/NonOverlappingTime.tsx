'use client';
import InfoDot from '@/components/ui/InfoDot';
import ExpandSection from '@/components/ui/ExpandSection';
import { formatTime } from '@/lib/formatTime';
import { MUHURTA_INFO } from '@/lib/data/descriptions';

interface Interval { start: string; end: string; }

const AUSPICIOUS_ORDER = [
  { key: 'brahmaMuhurta',   label: 'Brahma Muhurta' },
  { key: 'abhijitMuhurta',  label: 'Abhijit Muhurta' },
  { key: 'godhuliMuhurta',  label: 'Godhuli Muhurta' },
  { key: 'amritKalam',      label: 'Amrit Kalam' },
  { key: 'pratahSandhya',   label: 'Pratah Sandhya' },
  { key: 'vijayaMuhurta',    label: 'Vijaya Muhurta' },
  { key: 'madhyahnaSandhya', label: 'Madhyahna Sandhya' },
  { key: 'sayahanaSandhya',  label: 'Sayahana Sandhya' },
  { key: 'nishitaMuhurta',   label: 'Nishita Muhurta' },
];

const INAUSPICIOUS_ORDER = [
  { key: 'rahuKalam',   label: 'Rahu Kalam' },
  { key: 'gulikaKalam', label: 'Gulika Kalam' },
  { key: 'varjyam',     label: 'Varjyam' },
  { key: 'baana',       label: 'Baana' },
  { key: 'yamaGanda',   label: 'Yama Ganda' },
  { key: 'vidalYoga',   label: 'Vidal Yoga' },
  { key: 'durMuhurta',  label: 'Dur Muhurta' },
  { key: 'bhadra',      label: 'Bhadra' },
];

function toMs(iv: Interval) {
  return { start: new Date(iv.start).getTime(), end: new Date(iv.end).getTime() };
}

function intervalsOverlap(a: Interval, b: Interval): boolean {
  const as = new Date(a.start).getTime(), ae = new Date(a.end).getTime();
  const bs = new Date(b.start).getTime(), be = new Date(b.end).getTime();
  return as < be && ae > bs;
}

function subtractAll(auspicious: Interval, bad: Interval[]): Interval[] {
  let segments = [toMs(auspicious)];
  for (const b of bad) {
    const bms = toMs(b);
    const next: typeof segments = [];
    for (const seg of segments) {
      if (bms.end <= seg.start || bms.start >= seg.end) {
        next.push(seg);
      } else {
        if (bms.start > seg.start) next.push({ start: seg.start, end: bms.start });
        if (bms.end < seg.end) next.push({ start: bms.end, end: seg.end });
      }
    }
    segments = next;
  }
  return segments
    .filter(s => s.end - s.start >= 60000)
    .map(s => ({ start: new Date(s.start).toISOString(), end: new Date(s.end).toISOString() }));
}

// Find which inauspicious periods overlap a given auspicious interval
function findOverlaps(src: Interval, muhurta: Record<string, any>): Array<{ label: string; interval: Interval }> {
  const overlaps: Array<{ label: string; interval: Interval }> = [];
  for (const { key, label } of INAUSPICIOUS_ORDER) {
    const raw = muhurta[key];
    const arr: Interval[] = Array.isArray(raw) ? raw : [raw];
    for (const iv of arr) {
      if (intervalsOverlap(src, iv)) {
        overlaps.push({ label, interval: iv });
      }
    }
  }
  return overlaps;
}

interface Props { muhurta: Record<string, any>; }

export default function NonOverlappingTime({ muhurta }: Props) {
  // Collect all inauspicious intervals (flat list for subtraction)
  const badIntervals: Interval[] = [];
  for (const { key } of INAUSPICIOUS_ORDER) {
    const raw = muhurta[key];
    const arr: Interval[] = Array.isArray(raw) ? raw : [raw];
    badIntervals.push(...arr);
  }

  return (
    <ExpandSection title="Non-Overlapped Auspicious Times" accentColor="var(--auspicious-text)">
      {AUSPICIOUS_ORDER.map(({ key, label }) => {
        const raw = muhurta[key];
        if (raw === null) {
          const info = MUHURTA_INFO[key];
          return (
            <div key={key} className="time-chip" style={{ alignItems: 'center', gap: '0.4rem', flexWrap: 'nowrap' }}>
              {info && <InfoDot title={info.name} brief={info.idealFor ?? ''} isAuspicious={null} />}
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(0.78rem, 2.5vw, 0.92rem)', fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.04em', flex: 1, minWidth: 0, wordBreak: 'break-word', paddingLeft: '0.6em', textIndent: '-0.6em' }}>{label}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--moonsilver-dim)', fontStyle: 'italic', flexShrink: 0 }}>Not available today</span>
            </div>
          );
        }
        const src: Interval[] = Array.isArray(raw) ? raw : [raw];
        const clean: Interval[] = src.flatMap(iv => subtractAll(iv, badIntervals));
        const info = MUHURTA_INFO[key];

        // Find which inauspicious periods cut into this muhurta's original window
        const overlaps = src.flatMap(iv => findOverlaps(iv, muhurta));
        // Deduplicate by label
        const uniqueOverlaps = overlaps.filter((o, i, arr) => arr.findIndex(x => x.label === o.label) === i);

        // Build the dot popup brief text
        let brief = info?.idealFor ?? '';
        if (uniqueOverlaps.length > 0) {
          const cutLines = uniqueOverlaps
            .map(o => `✗ Cut by ${o.label}: ${formatTime(o.interval.start)} – ${formatTime(o.interval.end)}`)
            .join('\n');
          brief = (brief ? brief + '\n\n' : '') + cutLines;
        }

        return (
          <div key={key} className="time-chip" style={{ alignItems: 'center', gap: '0.4rem' }}>
            {info && (
              <InfoDot
                title={info.name}
                brief={brief}
                isAuspicious={null}
              />
            )}
            <span style={{
              fontFamily: 'Cinzel, serif', fontSize: 'clamp(0.78rem, 2.5vw, 0.92rem)',
              fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.04em',
              flex: 1, minWidth: 0, wordBreak: 'break-word',
              paddingLeft: '0.6em', textIndent: '-0.6em',
            }}>{label}</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
              {clean.length === 0 ? (
                <span style={{ fontSize: '0.82rem', color: 'var(--moonsilver-dim)', fontStyle: 'italic' }}>No clean window today</span>
              ) : (
                clean.map((iv, i) => (
                  <span key={i} style={{
                    fontFamily: 'Cinzel, serif', fontSize: 'clamp(0.7rem, 2vw, 0.82rem)',
                    fontWeight: 600, color: 'var(--moonsilver)', whiteSpace: 'nowrap',
                  }}>
                    {formatTime(iv.start)} — {formatTime(iv.end)}
                  </span>
                ))
              )}
            </div>
          </div>
        );
      })}
    </ExpandSection>
  );
}
