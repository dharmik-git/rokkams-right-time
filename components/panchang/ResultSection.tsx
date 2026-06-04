'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ExpandSection from '@/components/ui/ExpandSection';
import { formatTime } from '@/lib/formatTime';
import { computeBusinessSlots, type BusinessSlot } from '@/lib/businessMuhurta';
import type { DayTransitions } from '@/lib/calculations/transitions';

const CLOSE_ALL = 'infodot:closeAll';

interface Props {
  muhurta: Record<string, any>;
  transitions: DayTransitions;
  vara: { index: number; name: string; shortName: string };
  paksha: 'Shukla' | 'Krishna';
}

function elementStars(score: number): string {
  if (score >= 95) return '⭐⭐⭐⭐⭐';
  if (score >= 85) return '⭐⭐⭐⭐½';
  if (score >= 75) return '⭐⭐⭐⭐';
  if (score >= 65) return '⭐⭐⭐';
  if (score >= 50) return '⭐⭐';
  return '⭐';
}

function rankClass(i: number) {
  return i < 3 ? `rank-${i + 1}` : 'rank-n';
}

function PopupContent({ slot }: { slot: BusinessSlot }) {
  const rows: { label: string; value: string; stars: string }[] = [
    { label: 'Tithi',     value: slot.tithiName,      stars: elementStars(slot.tithiScore) },
    { label: 'Vara',      value: slot.varaName,        stars: elementStars(slot.varaScore) },
    { label: 'Nakshatra', value: slot.nakshatraName,   stars: elementStars(slot.nakshatraScore) },
    { label: 'Yoga',      value: slot.yogaName,        stars: elementStars(slot.yogaScore) },
    { label: 'Karana',    value: slot.karanaName,      stars: elementStars(slot.karanaScore) },
    { label: 'Paksha',    value: slot.paksha,          stars: elementStars(slot.pakshaScore) },
  ];

  return (
    <div style={{ fontSize: '0.78rem', lineHeight: 1.6 }}>
      {rows.map(r => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.1rem' }}>
          <span style={{ color: 'var(--moonsilver-dim)', fontFamily: 'Cinzel, serif', fontSize: '0.68rem', minWidth: 60 }}>
            {r.label}
          </span>
          <span style={{ color: 'var(--moonsilver)', flex: 1 }}>{r.value}</span>
          <span style={{ fontSize: '0.6rem', filter: 'brightness(0.7)' }}>{r.stars}</span>
        </div>
      ))}

      <div style={{ borderTop: '1px solid var(--night-border)', margin: '0.45rem 0 0.3rem' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--gold)', fontFamily: 'Cinzel, serif', fontSize: '0.72rem', fontWeight: 700 }}>
          {slot.finalScore.toFixed(1)}
        </span>
        <span style={{ fontSize: '0.65rem', filter: 'brightness(0.7)' }}>{slot.starRating}</span>
      </div>
    </div>
  );
}

export default function ResultSection({ muhurta, transitions, vara, paksha }: Props) {
  const slots = computeBusinessSlots(transitions, muhurta, vara.index, paksha);

  const [popup, setPopup] = useState<{ index: number; pos: { top: number; left: number } } | null>(null);
  const [mounted, setMounted] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    function handleCloseAll() { setPopup(null); }
    document.addEventListener(CLOSE_ALL, handleCloseAll);
    return () => document.removeEventListener(CLOSE_ALL, handleCloseAll);
  }, []);

  useEffect(() => {
    if (!popup) return;
    function close() { setPopup(null); }
    function outside(e: MouseEvent) {
      if (popupRef.current?.contains(e.target as Node)) return;
      setPopup(null);
    }
    function touchOutside(e: TouchEvent) {
      if (popupRef.current?.contains(e.target as Node)) return;
      setPopup(null);
    }
    document.addEventListener('mousedown', outside);
    window.addEventListener('scroll', close, true);
    document.addEventListener('touchstart', touchOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', outside);
      window.removeEventListener('scroll', close, true);
      document.removeEventListener('touchstart', touchOutside);
    };
  }, [popup]);

  function openPopup(e: React.MouseEvent, index: number) {
    e.stopPropagation();
    document.dispatchEvent(new CustomEvent(CLOSE_ALL));
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const W = 280, H = 210;
    let left = rect.left;
    if (left + W > window.innerWidth - 8) left = window.innerWidth - W - 8;
    if (left < 8) left = 8;
    let top = rect.bottom + 6;
    if (top + H > window.innerHeight - 8) top = rect.top - H - 6;
    if (top < 8) top = 8;
    setPopup(prev => prev?.index === index ? null : { index, pos: { top, left } });
  }

  return (
    <ExpandSection title="Result" accentColor="var(--gold-light)" defaultOpen={true}>

      <p style={{
        fontFamily: 'Cinzel, serif', fontSize: 'clamp(0.58rem, 1.6vw, 0.65rem)',
        color: 'var(--moonsilver-dim)', letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: '0.5rem',
      }}>
        Top 5 Times for Business / Finance / Contracts
      </p>

      {slots.length === 0 ? (
        <p style={{ color: 'var(--moonsilver-dim)', fontStyle: 'italic', fontSize: '0.88rem' }}>
          No qualifying muhurta windows today.
        </p>
      ) : (
        slots.map((slot, i) => {
          const startIso = new Date(slot.start).toISOString();
          const endIso   = new Date(slot.end).toISOString();
          return (
            <div key={i} className="time-chip" style={{ alignItems: 'center', gap: '0.6rem' }}>
              <span
                className={`rank-badge ${rankClass(i)}`}
                onClick={e => openPopup(e, i)}
                onTouchEnd={e => openPopup(e as any, i)}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer', flexShrink: 0 }}
                onKeyDown={e => e.key === 'Enter' && openPopup(e as any, i)}
              >
                {i + 1}
              </span>

              <span className="time-range">{formatTime(startIso)} — {formatTime(endIso)}</span>

              <span style={{ fontSize: '0.65rem', filter: 'brightness(0.7)', marginLeft: 'auto' }}>
                {slot.starRating}
              </span>
            </div>
          );
        })
      )}

      {mounted && popup && createPortal(
        <div
          ref={popupRef}
          className="info-popup"
          style={{ top: popup.pos.top, left: popup.pos.left, position: 'fixed', zIndex: 99999, width: 280, minWidth: 220 }}
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
        >
          <PopupContent slot={slots[popup.index]} />
        </div>,
        document.body,
      )}
    </ExpandSection>
  );
}
