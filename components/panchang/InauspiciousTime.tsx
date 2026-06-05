'use client';
import InfoDot from '@/components/ui/InfoDot';
import ExpandSection from '@/components/ui/ExpandSection';
import { formatTimeWithDate } from '@/lib/formatTime';
import { MUHURTA_INFO } from '@/lib/data/descriptions';

interface Interval { start: string; end: string; }

interface Props {
  date: string;
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

function BadRow({ infoKey, label, intervals, date }: { infoKey: string; label: string; intervals: Interval[]; date: string }) {
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
            {formatTimeWithDate(iv.start, date)} — {formatTimeWithDate(iv.end, date)}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function InauspiciousTime({ muhurta, date }: Props) {
  return (
    <ExpandSection title="Inauspicious Time" accentColor="var(--inauspicious-text)">
      {ORDER.map(({ key, label }) => {
        const raw = (muhurta as any)[key];
        const intervals: Interval[] = Array.isArray(raw) ? raw : [raw];
        return <BadRow key={key} infoKey={key} label={label} intervals={intervals} date={date} />;
      })}
    </ExpandSection>
  );
}
