'use client';
import ExpandSection from '@/components/ui/ExpandSection';
import { formatTime } from '@/lib/formatTime';
import { computeRankedSlots } from '@/lib/rankedSlots';

const BUSINESS_MUHURTAS = new Set(['abhijitMuhurta', 'vijayaMuhurta']);

interface Props {
  muhurta: Record<string, any>;
}

export default function ResultSection({ muhurta }: Props) {
  const ranked = computeRankedSlots(muhurta);

  // Filter to slots where at least one contributing muhurta is business-relevant
  const businessSlots = ranked.filter(slot =>
    slot.labels.some(label =>
      label === 'Abhijit Muhurta' || label === 'Vijaya Muhurta'
    )
  ).slice(0, 3);

  return (
    <ExpandSection title="Result" accentColor="var(--gold-light)" defaultOpen={false}>
      <p style={{
        fontFamily: 'Cinzel, serif', fontSize: 'clamp(0.6rem, 1.8vw, 0.68rem)',
        color: 'var(--moonsilver-dim)', letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: '0.6rem',
      }}>
        Best Times · Business / Finance / Contracts
      </p>

      {businessSlots.length === 0 ? (
        <p style={{ color: 'var(--moonsilver-dim)', fontStyle: 'italic', fontSize: '0.88rem' }}>
          Not available today
        </p>
      ) : (
        businessSlots.map((slot, i) => {
          const startIso = new Date(slot.start).toISOString();
          const endIso   = new Date(slot.end).toISOString();
          return (
            <div key={i} className="time-chip" style={{ alignItems: 'center', gap: '0.6rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 24, height: 24, borderRadius: '50%',
                fontFamily: 'Cinzel, serif', fontSize: '0.75rem', fontWeight: 700,
                flexShrink: 0,
                background: 'rgba(184,204,232,0.1)', color: 'var(--moonsilver-dim)',
              }}>
                {i + 1}
              </span>
              <span className="time-range">
                {formatTime(startIso)} — {formatTime(endIso)}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--moonsilver-dim)', flex: 1 }}>
                {slot.labels.join(' · ')}
              </span>
            </div>
          );
        })
      )}
    </ExpandSection>
  );
}
