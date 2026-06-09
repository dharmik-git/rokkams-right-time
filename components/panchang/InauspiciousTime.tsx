'use client';
import InfoDot from '@/components/ui/InfoDot';
import DateTag from '@/components/ui/DateTag';
import ExpandSection from '@/components/ui/ExpandSection';
import { formatTime, getPageDayEndMs } from '@/lib/formatTime';
import { MUHURTA_INFO } from '@/lib/data/descriptions';

interface Interval { start: string; end: string; label?: string; }

interface Props {
  muhurta: {
    rahuKalam: Interval;
    gulikaKalam: Interval;
    varjyam: Interval[];
    baana: Interval[];
    yamaGanda: Interval;
    vidalYoga: Interval[];
    durMuhurta: Interval[];
    bhadra: Interval[];
  };
  pageDate: string;
}

const ORDER = [
  { key: 'rahuKalam',   label: 'Rahu Kalam' },
  { key: 'gulikaKalam', label: 'Gulika Kalam' },
  { key: 'varjyam',     label: 'Varjyam' },
  { key: 'baana',       label: 'Baana' },
  { key: 'yamaGanda',   label: 'Yama Ganda' },
  { key: 'vidalYoga',   label: 'Vidal Yoga' },
  { key: 'durMuhurta',  label: 'Dur Muhurta' },
  { key: 'bhadra',      label: 'Bhadra' },
];

function BadRow({ infoKey, label, intervals, pageDate }: { infoKey: string; label: string; intervals: Interval[]; pageDate: string }) {
  const info = MUHURTA_INFO[infoKey];
  return (
    <div className="time-chip" style={{ alignItems: 'center', gap: '0.4rem' }}>
      {info && <InfoDot title={info.name} brief={info.idealFor} isAuspicious={null} />}
      <span style={{
        fontFamily: 'Cinzel, serif', fontSize: 'clamp(0.78rem, 2.5vw, 0.92rem)',
        fontWeight: 600, color: 'var(--gold-light)', letterSpacing: '0.04em',
        flex: 1, minWidth: 0, wordBreak: 'break-word',
        paddingLeft: '0.6em', textIndent: '-0.6em',
      }}>{label}</span>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
        {intervals.map((iv, i) => (
          <span key={i} style={{
            fontFamily: 'Cinzel, serif', fontSize: 'clamp(0.7rem, 2vw, 0.82rem)',
            fontWeight: 600, color: 'var(--moonsilver)', whiteSpace: 'nowrap',
          }}>
            {iv.label ? `${iv.label}: ` : ''}<DateTag iso={iv.start} pageDate={pageDate} />{formatTime(iv.start)} — <DateTag iso={iv.end} pageDate={pageDate} />{formatTime(iv.end)}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function InauspiciousTime({ muhurta, pageDate }: Props) {
  return (
    <ExpandSection title="Inauspicious Time" accentColor="var(--inauspicious-text)">
      {ORDER.map(({ key, label }) => {
        const raw = (muhurta as any)[key];
        if (raw === null || (Array.isArray(raw) && raw.length === 0)) {
          const info = MUHURTA_INFO[key];
          return (
            <div key={key} className="time-chip" style={{ alignItems: 'center', gap: '0.4rem', opacity: 0.4 }}>
              {info && <InfoDot title={info.name} brief={info.idealFor} isAuspicious={null} />}
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(0.78rem, 2.5vw, 0.92rem)', fontWeight: 600, color: 'var(--moonsilver-dim)', letterSpacing: '0.04em', flex: 1, minWidth: 0 }}>{label}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--moonsilver-dim)', fontStyle: 'italic', flexShrink: 0 }}>Not observed today</span>
            </div>
          );
        }
        const pageEndMs = getPageDayEndMs(pageDate);
        const intervals: Interval[] = (Array.isArray(raw) ? raw : [raw])
          .filter((iv: Interval) => new Date(iv.start).getTime() < pageEndMs)
          .map((iv: Interval) => {
            const endMs = new Date(iv.end).getTime();
            return endMs > pageEndMs ? { ...iv, end: new Date(pageEndMs - 60_000).toISOString() } : iv;
          });
        if (intervals.length === 0) {
          const info = MUHURTA_INFO[key];
          return (
            <div key={key} className="time-chip" style={{ alignItems: 'center', gap: '0.4rem', opacity: 0.4 }}>
              {info && <InfoDot title={info.name} brief={info.idealFor} isAuspicious={null} />}
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(0.78rem, 2.5vw, 0.92rem)', fontWeight: 600, color: 'var(--moonsilver-dim)', letterSpacing: '0.04em', flex: 1, minWidth: 0 }}>{label}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--moonsilver-dim)', fontStyle: 'italic', flexShrink: 0 }}>Not observed today</span>
            </div>
          );
        }
        return <BadRow key={key} infoKey={key} label={label} intervals={intervals} pageDate={pageDate} />;
      })}
    </ExpandSection>
  );
}
