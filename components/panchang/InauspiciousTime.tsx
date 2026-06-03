'use client';
import InfoDot from '@/components/ui/InfoDot';
import ExpandSection from '@/components/ui/ExpandSection';
import { formatTime } from '@/lib/formatTime';
import { MUHURTA_INFO } from '@/lib/data/descriptions';

interface Interval { start: string; end: string; }

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

function BadRow({ infoKey, label, intervals }: { infoKey: string; label: string; intervals: Interval[] }) {
  const info = MUHURTA_INFO[infoKey];
  return (
    <div className="time-chip" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%' }}>
        <span style={{ color: '#E07070', fontSize: '0.75rem' }}>✗</span>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', fontWeight: 600, color: '#E07070', letterSpacing: '0.04em', flex: 1 }}>{label}</span>
        {info && <InfoDot title={info.name} brief={info.idealFor} isAuspicious={false} />}
      </div>
      {intervals.map((iv, i) => (
        <div key={i} className="time-range" style={{ paddingLeft: '1rem', fontWeight: 600, color: 'var(--moonsilver-dim)', wordBreak: 'keep-all' }}>
          {formatTime(iv.start)} — {formatTime(iv.end)}
        </div>
      ))}
    </div>
  );
}

export default function InauspiciousTime({ muhurta }: Props) {
  return (
    <ExpandSection title="Inauspicious Time" accentColor="#E07070">
      {ORDER.map(({ key, label }) => {
        const raw = (muhurta as any)[key];
        const intervals: Interval[] = Array.isArray(raw) ? raw : [raw];
        return <BadRow key={key} infoKey={key} label={label} intervals={intervals} />;
      })}
    </ExpandSection>
  );
}
