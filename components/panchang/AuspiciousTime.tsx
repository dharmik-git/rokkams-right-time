'use client';
import InfoDot from '@/components/ui/InfoDot';
import ExpandSection from '@/components/ui/ExpandSection';
import { formatTime } from '@/lib/formatTime';
import { MUHURTA_INFO } from '@/lib/data/descriptions';

interface Interval { start: string; end: string; }

interface Props {
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

function MuhurtaRow({ infoKey, label, intervals }: { infoKey: string; label: string; intervals: Interval[] }) {
  const info = MUHURTA_INFO[infoKey];
  return (
    <div className="time-chip" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%' }}>
        <span style={{ color: '#4EC08A', fontSize: '0.75rem' }}>✦</span>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', fontWeight: 600, color: 'var(--gold-light)', letterSpacing: '0.04em', flex: 1 }}>{label}</span>
        {info && <InfoDot title={info.name} brief={info.idealFor} isAuspicious={true} descriptionOnly />}
      </div>
      {intervals.map((iv, i) => (
        <div key={i} className="time-range" style={{ paddingLeft: '1rem', fontWeight: 600, color: 'var(--moonsilver)', wordBreak: 'keep-all' }}>
          {formatTime(iv.start)} — {formatTime(iv.end)}
        </div>
      ))}
    </div>
  );
}

export default function AuspiciousTime({ muhurta }: Props) {
  return (
    <ExpandSection title="Auspicious Time" accentColor="#4EC08A">
      {ORDER.map(({ key, label }) => {
        const raw = (muhurta as any)[key];
        if (raw === null) {
          // e.g. Abhijit on Wednesday
          return (
            <div key={key} className="time-chip" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem', opacity: 0.4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: 'var(--moonsilver-dim)', fontSize: '0.75rem' }}>—</span>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.78rem', color: 'var(--moonsilver-dim)', letterSpacing: '0.04em' }}>{label}</span>
              </div>
              <div style={{ paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--moonsilver-dim)', fontStyle: 'italic' }}>Not observed today</div>
            </div>
          );
        }
        const intervals: Interval[] = Array.isArray(raw) ? raw : [raw];
        return <MuhurtaRow key={key} infoKey={key} label={label} intervals={intervals} />;
      })}
    </ExpandSection>
  );
}
