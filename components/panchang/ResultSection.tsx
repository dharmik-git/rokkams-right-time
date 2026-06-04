'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ExpandSection from '@/components/ui/ExpandSection';
import InfoDot from '@/components/ui/InfoDot';
import { formatTime } from '@/lib/formatTime';
import { computeBusinessSlots, type BusinessSlot } from '@/lib/businessMuhurta';
import type { DayTransitions } from '@/lib/calculations/transitions';

const CLOSE_ALL = 'infodot:closeAll';

const STAR_LEGEND =
  '⭐⭐⭐⭐⭐  Excellent   (95+)\n' +
  '⭐⭐⭐⭐½  Very Good  (85–94)\n' +
  '⭐⭐⭐⭐     Good        (75–84)\n' +
  '⭐⭐⭐        Average    (65–74)\n' +
  '⭐⭐           Below Avg (50–64)\n' +
  '⭐              Poor        (<50)';

interface Props {
  muhurta: Record<string, any>;
  transitions: DayTransitions;
  vara: { index: number; name: string; shortName: string };
  paksha: 'Shukla' | 'Krishna';
}

// ── Half-star SVG ─────────────────────────────────────────────────────────────
// Standard 5-point star path, clipped so left half is gold-filled and
// right half shows only the outline — matching the half-star image.
function HalfStar() {
  const id = 'hs-clip';
  // Star path centred at 12,12 in a 24×24 viewBox
  const path = 'M12 2l2.55 7.85H22l-6.27 4.56 2.39 7.37L12 17.27l-6.12 4.51 2.39-7.37L2 9.85h7.45z';
  return (
    <svg
      width="1em" height="1em" viewBox="0 0 24 24"
      style={{ display: 'inline-block', verticalAlign: '-0.15em', filter: 'brightness(0.7)' }}
      aria-hidden
    >
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width="12" height="24" />
        </clipPath>
      </defs>
      {/* Outline star (full) */}
      <path d={path} fill="none" stroke="#f5c518" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Filled left half */}
      <path d={path} fill="#f5c518" clipPath={`url(#${id})`} />
    </svg>
  );
}

// ── Star display ──────────────────────────────────────────────────────────────
function StarDisplay({ count }: { count: number }) {
  const full = Math.floor(count);
  const half = count % 1 >= 0.5;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1px', fontSize: '0.65em' }}>
      {'⭐'.repeat(full)}
      {half && <HalfStar />}
    </span>
  );
}

// ── Per-element stars in popup ────────────────────────────────────────────────
function elementStarCount(score: number): number {
  if (score >= 95) return 5;
  if (score >= 85) return 4.5;
  if (score >= 75) return 4;
  if (score >= 65) return 3;
  if (score >= 50) return 2;
  return 1;
}

function rankClass(i: number) {
  return i < 3 ? `rank-${i + 1}` : 'rank-n';
}

// ── Popup content ─────────────────────────────────────────────────────────────
function PopupContent({ slot }: { slot: BusinessSlot }) {
  const rows: { label: string; value: string; score: number }[] = [
    { label: 'Tithi',     value: slot.tithiName,     score: slot.tithiScore },
    { label: 'Vara',      value: slot.varaName,       score: slot.varaScore },
    { label: 'Nakshatra', value: slot.nakshatraName,  score: slot.nakshatraScore },
    { label: 'Yoga',      value: slot.yogaName,       score: slot.yogaScore },
    { label: 'Karana',    value: slot.karanaName,     score: slot.karanaScore },
    { label: 'Paksha',    value: slot.paksha,         score: slot.pakshaScore },
  ];

  return (
    <div style={{ fontSize: '0.78rem', lineHeight: 1.6 }}>
      {rows.map(r => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.1rem' }}>
          <span style={{ color: 'var(--moonsilver-dim)', fontFamily: 'Cinzel, serif', fontSize: '0.68rem', minWidth: 60 }}>
            {r.label}
          </span>
          <span style={{ color: 'var(--moonsilver)', flex: 1 }}>{r.value}</span>
          <StarDisplay count={elementStarCount(r.score)} />
        </div>
      ))}

      <div style={{ borderTop: '1px solid var(--night-border)', margin: '0.45rem 0 0.3rem' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--gold)', fontFamily: 'Cinzel, serif', fontSize: '0.72rem', fontWeight: 700 }}>
          {slot.finalScore.toFixed(1)}
        </span>
        <StarDisplay count={slot.starCount} />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
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
    const W = 280, H = 230;
    let left = rect.left;
    if (left + W > window.innerWidth - 8) left = window.innerWidth - W - 8;
    if (left < 8) left = 8;
    let top = rect.bottom + 6;
    if (top + H > window.innerHeight - 8) top = rect.top - H - 6;
    if (top < 8) top = 8;
    setPopup(prev => prev?.index === index ? null : { index, pos: { top, left } });
  }

  const infoIcon = (
    <span onClick={e => e.stopPropagation()}>
      <InfoDot title="" brief={STAR_LEGEND} descriptionOnly />
    </span>
  );

  return (
    <ExpandSection title="Result" accentColor="var(--gold-light)" defaultOpen={true} titleExtra={infoIcon}>

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

              <span style={{ marginLeft: 'auto', fontSize: '1rem' }}>
                <StarDisplay count={slot.starCount} />
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
