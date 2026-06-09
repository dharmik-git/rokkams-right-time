'use client';
import InfoDot from '@/components/ui/InfoDot';
import DateTag from '@/components/ui/DateTag';
import ExpandSection from '@/components/ui/ExpandSection';
import { formatTime, getPageDayEndMs } from '@/lib/formatTime';
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
  pageDate: string;
  earlyMorningMuhurta?: Record<string, any>;
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

function MuhurtaRow({ infoKey, label, intervals, pageDate }: { infoKey: string; label: string; intervals: Interval[]; pageDate: string }) {
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
            <DateTag iso={iv.start} pageDate={pageDate} />{formatTime(iv.start)} — <DateTag iso={iv.end} pageDate={pageDate} />{formatTime(iv.end)}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AuspiciousTime({ muhurta, pageDate, earlyMorningMuhurta }: Props) {
  return (
    <ExpandSection title="Auspicious Time" accentColor="var(--auspicious-text)">
      {ORDER.map(({ key, label }) => {
        const raw = (muhurta as any)[key];
        const earlyRaw = earlyMorningMuhurta?.[key];
        const earlyArr: Interval[] = earlyRaw ? (Array.isArray(earlyRaw) ? earlyRaw : [earlyRaw]) : [];
        const pageEndMs = getPageDayEndMs(pageDate);
        const currentIntervals: Interval[] = (raw === null || (Array.isArray(raw) && raw.length === 0))
          ? []
          : (Array.isArray(raw) ? raw : [raw])
              .filter((iv: Interval) => new Date(iv.start).getTime() < pageEndMs)
              .map((iv: Interval) => {
                const endMs = new Date(iv.end).getTime();
                return endMs > pageEndMs ? { ...iv, end: new Date(pageEndMs - 60_000).toISOString() } : iv;
              });
        const intervals: Interval[] = [...earlyArr, ...currentIntervals];
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
        return <MuhurtaRow key={key} infoKey={key} label={label} intervals={intervals} pageDate={pageDate} />;
      })}
    </ExpandSection>
  );
}
