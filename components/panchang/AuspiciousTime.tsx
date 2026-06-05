'use client';
import InfoDot from '@/components/ui/InfoDot';
import ExpandSection from '@/components/ui/ExpandSection';
import { formatTimeWithDate } from '@/lib/formatTime';
import { MUHURTA_INFO } from '@/lib/data/descriptions';

interface Interval { start: string; end: string; }

interface Props {
  date: string;
  muhurta: {
    brahmaMuhurta: Interval;
    abhijitMuhurta: Interval;
    godhuliMuhurta: Interval;
    amritKalam: Interval[];
    pratahSandhya: Interval;
    vijayaMuhurta: Interval;
    madhyahnaSandhya: Interval;
    sayahanaSandhya: Interval;
    nishitaMuhurta: Interval;
  };
}

const ORDER = [
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

function MuhurtaRow({ infoKey, label, intervals, date }: { infoKey: string; label: string; intervals: Interval[]; date: string }) {
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

export default function AuspiciousTime({ muhurta, date }: Props) {
  return (
    <ExpandSection title="Auspicious Time" accentColor="var(--auspicious-text)">
      {ORDER.map(({ key, label }) => {
        const raw = (muhurta as any)[key];
        if (raw === null) {
          // e.g. Abhijit on Wednesday
          return (
            <div key={key} className="time-chip" style={{ alignItems: 'center', gap: '0.4rem', opacity: 0.4 }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(0.78rem, 2.5vw, 0.92rem)', fontWeight: 600, color: 'var(--moonsilver-dim)', letterSpacing: '0.04em', flex: 1, minWidth: 0 }}>{label}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--moonsilver-dim)', fontStyle: 'italic', flexShrink: 0 }}>Not observed today</span>
            </div>
          );
        }
        const intervals: Interval[] = Array.isArray(raw) ? raw : [raw];
        return <MuhurtaRow key={key} infoKey={key} label={label} intervals={intervals} date={date} />;
      })}
    </ExpandSection>
  );
}
