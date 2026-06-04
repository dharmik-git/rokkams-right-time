'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ExpandSection from '@/components/ui/ExpandSection';
import { formatTime } from '@/lib/formatTime';
import {
  computeBusinessSlots,
  getExcludedPeriods,
  type BusinessSlot,
} from '@/lib/businessMuhurta';
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
    { label: 'Nakshatra', value: slot.nakshatraName, stars: elementStars(slot.nakshatraScore) },
    { label: 'Tithi',     value: slot.tithiName,     stars: elementStars(slot.tithiScore) },
    { label: 'Vara',      value: slot.varaName,       stars: elementStars(slot.varaScore) },
    { label: 'Yoga',      value: slot.yogaName,       stars: elementStars(slot.yogaScore) },
    { label: 'Karana',    value: slot.karanaName,     stars: elementStars(slot.karanaScore) },
    { label: 'Paksha',    value: slot.paksha,         stars: elementStars(slot.pakshaScore) },
  ];

  return (
    <div style={{ fontSize: '0.78rem', lineHeight: 1.6 }}>
      {rows.map(r => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.1rem' }}>
          <span style={{ color: 'var(--moonsilver-dim)', fontFamily: 'Cinzel, serif', fontSize: '0.68rem', minWidth: 60 }}>
            {r.label}
          </span>
          <span style={{ color: 'var(--moonsilver)', flex: 1 }}>{r.value}</span>
          <span style={{ fontSize: '0.6rem' }}>{r.stars}</span>
        </div>
      ))}

      <div style={{ borderTop: '1px solid var(--night-border)', margin: '0.4rem 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--moonsilver-dim)', fontSize: '0.72rem' }}>
        <span>Base Score</span>
        <span style={{ color: 'var(--moonsilver)' }}>{slot.baseScore.toFixed(1)}</span>
      </div>

      {slot.multiplierLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gold-dim)', fontSize: '0.72rem' }}>
          <span>{slot.multiplierLabel}</span>
          <span>×{slot.multiplier.toFixed(2)}</span>
        </div>
      )}

      {slot.penaltyLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--inauspicious-text, #E07070)', fontSize: '0.72rem' }}>
          <span>{slot.penaltyLabel} (penalty)</span>
          <span>×0.50</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
        <span style={{ color: 'var(--gold)', fontFamily: 'Cinzel, serif', fontSize: '0.72rem', fontWeight: 700 }}>
          Final Score
        </span>
        <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.78rem' }}>
          {slot.finalScore.toFixed(1)} {slot.starRating}
        </span>
      </div>
    </div>
  );
}

export default function ResultSection({ muhurta, transitions, vara, paksha }: Props) {
  const slots = computeBusinessSlots(transitions, muhurta, vara.index, paksha);
  const excluded = getExcludedPeriods(muhurta);

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
    const W = 280, H = 220;
    let left = rect.left;
    if (left + W > window.innerWidth - 8) left = window.innerWidth - W - 8;
    if (left < 8) left = 8;
    let top = rect.bottom + 6;
    if (top + H > window.innerHeight - 8) top = rect.top - H - 6;
    if (top < 8) top = 8;
    setPopup(prev => prev?.index === index ? null : { index, pos: { top, left } });
  }

  return (
    <ExpandSection title="Best Muhurta" accentColor="var(--gold-light)" defaultOpen={false}>

      {/* ── Section A: Excluded Periods ─────────────────────────────────── */}
      <p style={{
        fontFamily: 'Cinzel, serif', fontSize: 'clamp(0.58rem, 1.6vw, 0.65rem)',
        color: 'var(--moonsilver-dim)', letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: '0.4rem',
      }}>
        Excluded Periods
      </p>

      <div style={{ marginBottom: '1rem' }}>
        {excluded.map((ep, i) => (
          <div key={i} style={{
            display: 'flex', gap: '0.5rem', alignItems: 'center',
            padding: '0.18rem 0.4rem', marginBottom: '0.15rem',
            borderRadius: '2px', background: 'rgba(139,26,26,0.06)',
          }}>
            <span style={{
              fontFamily: 'Cinzel, serif', fontSize: '0.65rem',
              color: 'var(--moonsilver-dim)', letterSpacing: '0.04em', minWidth: 90,
            }}>
              {ep.label}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--moonsilver-dim)' }}>
              {formatTime(ep.start)} – {formatTime(ep.end)}
            </span>
          </div>
        ))}
      </div>

      {/* ── Section B: Top 5 Business Slots ────────────────────────────── */}
      <p style={{
        fontFamily: 'Cinzel, serif', fontSize: 'clamp(0.58rem, 1.6vw, 0.65rem)',
        color: 'var(--moonsilver-dim)', letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: '0.5rem',
      }}>
        Top 5 · Business / Finance / Contracts
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
            <div key={i} className="time-chip" style={{ alignItems: 'flex-start', gap: '0.6rem', paddingTop: '0.35rem', paddingBottom: '0.35rem' }}>
              <span
                className={`rank-badge ${rankClass(i)}`}
                onClick={e => openPopup(e, i)}
                onTouchEnd={e => openPopup(e as any, i)}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer', marginTop: '0.1rem', flexShrink: 0 }}
                onKeyDown={e => e.key === 'Enter' && openPopup(e as any, i)}
              >
                {i + 1}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Time + score + stars */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="time-range">{formatTime(startIso)} — {formatTime(endIso)}</span>
                  <span style={{ color: 'var(--gold)', fontFamily: 'Cinzel, serif', fontSize: '0.72rem', fontWeight: 700 }}>
                    {slot.finalScore.toFixed(1)}
                  </span>
                  <span style={{ fontSize: '0.65rem' }}>{slot.starRating}</span>
                </div>

                {/* Sub-line */}
                <div style={{ fontSize: '0.72rem', color: 'var(--moonsilver-dim)', marginTop: '0.15rem', lineHeight: 1.4 }}>
                  {slot.nakshatraName} · {slot.tithiName}
                  {slot.multiplierLabel && (
                    <span style={{ color: 'var(--gold-dim)' }}> · {slot.multiplierLabel}</span>
                  )}
                  {slot.penaltyLabel && (
                    <span style={{ color: 'var(--inauspicious-text, #E07070)' }}> · {slot.penaltyLabel} −50%</span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* ── Popup portal ────────────────────────────────────────────────── */}
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
