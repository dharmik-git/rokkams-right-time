'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ExpandSection from '@/components/ui/ExpandSection';
import InfoDot from '@/components/ui/InfoDot';
import DateTag from '@/components/ui/DateTag';
import { formatTime, getPageDayEndMs } from '@/lib/formatTime';
import { computeBusinessSlots, type BusinessSlot } from '@/lib/businessMuhurta';
import type { DayTransitions } from '@/lib/calculations/transitions';

const CLOSE_ALL = 'infodot:closeAll';


interface Props {
  muhurta: Record<string, any>;
  transitions: DayTransitions;
  vara: { index: number; name: string; shortName: string };
  paksha: 'Shukla' | 'Krishna';
  pageDate: string;
  nextSunrise?: string;
  earlyMorningSlots?: BusinessSlot[];
}

// ── Star SVG components ───────────────────────────────────────────────────────
const STAR_PATH = 'M12 2l2.55 7.85H22l-6.27 4.56 2.39 7.37L12 17.27l-6.12 4.51 2.39-7.37L2 9.85h7.45z';
const STAR_STYLE: React.CSSProperties = {
  display: 'inline-block', verticalAlign: '-0.15em',
  filter: 'brightness(var(--star-brightness, 0.95))',
};

function FullStar() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" style={STAR_STYLE} aria-hidden>
      <path d={STAR_PATH} fill="#f5c518" stroke="#f5c518" strokeWidth="0.5" strokeLinejoin="round" />
    </svg>
  );
}

function HalfStar() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" style={STAR_STYLE} aria-hidden>
      <defs>
        <clipPath id="hs-clip">
          <rect x="0" y="0" width="12" height="24" />
        </clipPath>
      </defs>
      <path d={STAR_PATH} fill="none" stroke="#f5c518" strokeWidth="1.5" strokeLinejoin="round" />
      <path d={STAR_PATH} fill="#f5c518" clipPath="url(#hs-clip)" />
    </svg>
  );
}

// ── Star display ──────────────────────────────────────────────────────────────
function StarDisplay({ count, size = '1rem' }: { count: number; size?: string }) {
  const full = Math.floor(count);
  const half = count % 1 >= 0.5;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1px', fontSize: size }}>
      {Array.from({ length: full }, (_, i) => <FullStar key={i} />)}
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

// ── Star legend for the ? popup ───────────────────────────────────────────────
function StarLegend() {
  const rows = [
    { count: 5,   label: 'Excellent',  range: '95+' },
    { count: 4.5, label: 'Very Good',  range: '85–94' },
    { count: 4,   label: 'Good',       range: '75–84' },
    { count: 3,   label: 'Average',    range: '65–74' },
    { count: 2,   label: 'Below Avg',  range: '50–64' },
    { count: 1,   label: 'Poor',       range: '<50' },
  ];
  return (
    <div style={{ lineHeight: 1.9 }}>
      {rows.map(r => (
        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <StarDisplay count={r.count} size="0.7rem" />
          <span style={{ color: 'var(--moonsilver)', fontSize: '0.78rem', flex: 1 }}>{r.label}</span>
          <span style={{ color: 'var(--moonsilver-dim)', fontSize: '0.68rem' }}>{r.range}</span>
        </div>
      ))}
    </div>
  );
}

// ── Popup content ─────────────────────────────────────────────────────────────
function PopupContent({ slot, rank }: { slot: BusinessSlot; rank: number }) {
  const rows: { label: string; value: string; score: number }[] = [
    { label: 'Nakshatra', value: slot.nakshatraName,  score: slot.nakshatraScore },
    { label: 'Tithi',     value: slot.tithiName,      score: slot.tithiScore },
    { label: 'Yoga',      value: slot.yogaName,       score: slot.yogaScore },
    { label: 'Karana',    value: slot.karanaName,     score: slot.karanaScore },
    { label: 'Paksha',    value: slot.paksha,         score: slot.pakshaScore },
    { label: 'Vara',      value: slot.varaName,       score: slot.varaScore },
  ];

  return (
    <div style={{ fontSize: '0.78rem', lineHeight: 1.6 }}>
      {/* Rank + total score */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <span style={{ color: 'var(--gold)', fontFamily: 'Cinzel, serif', fontSize: '1rem', fontWeight: 700 }}>
          #{rank}
        </span>
        <span style={{ color: 'var(--moonsilver)', fontFamily: 'Cinzel, serif', fontSize: '0.78rem', fontWeight: 600 }}>
          Score: <span style={{ color: 'var(--gold-light)' }}>{slot.finalScore}</span>
        </span>
      </div>

      {/* Multiplier row (only if one is active) */}
      {slot.multiplierLabel && (
        <div style={{ marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ color: 'var(--auspicious-text)', fontFamily: 'Cinzel, serif', fontSize: '0.68rem' }}>
            ✦ {slot.multiplierLabel}
          </span>
          <span style={{ color: 'var(--moonsilver-dim)', fontSize: '0.68rem' }}>
            {slot.multiplier.toFixed(2)}X
          </span>
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--night-border)', marginBottom: '0.35rem' }} />

      {rows.map(r => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.1rem' }}>
          <span style={{ color: 'var(--moonsilver-dim)', fontFamily: 'Cinzel, serif', fontSize: '0.68rem', width: 72, flexShrink: 0 }}>
            {r.label}
          </span>
          <span style={{ color: 'var(--moonsilver)', flex: 1 }}>{r.value}</span>
          <StarDisplay count={elementStarCount(r.score)} size="0.7rem" />
        </div>
      ))}

      <div style={{ borderTop: '1px solid var(--night-border)', marginTop: '0.35rem', paddingTop: '0.28rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ color: 'var(--moonsilver-dim)', fontFamily: 'Cinzel, serif', fontSize: '0.68rem' }}>
          Total Score (x) :
        </span>
        <span style={{ color: 'var(--gold-light)', fontFamily: 'Cinzel, serif', fontSize: '0.78rem', fontWeight: 600 }}>
          {slot.baseScore}
        </span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function mergeAdjacent(slots: BusinessSlot[]): BusinessSlot[] {
  const sorted = [...slots].sort((a, b) => a.start - b.start);
  const out: BusinessSlot[] = [];
  for (const slot of sorted) {
    const prev = out[out.length - 1];
    if (prev && Math.abs(prev.end - slot.start) <= 60_000) {
      // Always use the later (current-day) slot's metadata so display fields
      // like varaName reflect the calendar day being viewed, not the prev day.
      // Take the best score of the two windows.
      const finalScore = Math.max(prev.finalScore, slot.finalScore);
      out[out.length - 1] = {
        ...slot,
        start: prev.start,
        finalScore,
        starCount: Math.max(prev.starCount, slot.starCount),
      };
    } else {
      out.push({ ...slot });
    }
  }
  return out;
}

export default function ResultSection({ muhurta, transitions, vara, paksha, pageDate, nextSunrise, earlyMorningSlots }: Props) {
  const pageEndMs = getPageDayEndMs(pageDate);
  const nextSunriseMs = nextSunrise ? new Date(nextSunrise).getTime() : undefined;
  const dayEndMs = nextSunriseMs !== undefined ? Math.min(nextSunriseMs, pageEndMs) : pageEndMs;
  const currentSlots = computeBusinessSlots(transitions, muhurta, vara.index, paksha, dayEndMs);
  const slots = mergeAdjacent([...(earlyMorningSlots ?? []), ...currentSlots])
    .filter(s => s.start < pageEndMs)
    .sort((a, b) => b.finalScore - a.finalScore || a.start - b.start);

  const [popup, setPopup] = useState<{ index: number; pos: { top: number; left: number } } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showAll, setShowAll] = useState(false);
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
      <InfoDot title="" brief="" briefNode={<StarLegend />} descriptionOnly label="?" />
    </span>
  );

  return (
    <ExpandSection title="Result" accentColor="var(--gold-light)" defaultOpen={true} titleExtra={infoIcon}>

      <p style={{
        fontFamily: 'Cinzel, serif', fontSize: 'clamp(0.58rem, 1.6vw, 0.65rem)',
        color: 'var(--moonsilver-dim)', letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: '0.5rem',
      }}>
        for Business / Finance / Contracts
      </p>

      {slots.length === 0 ? (
        <p style={{ color: 'var(--moonsilver-dim)', fontStyle: 'italic', fontSize: '0.88rem' }}>
          No qualifying muhurta windows today.
        </p>
      ) : (
        <>
          {(showAll ? slots : slots.slice(0, 5)).map((slot, i) => {
            const startIso = new Date(slot.start).toISOString();
            const endIso   = new Date(Math.min(slot.end, pageEndMs - 60_000)).toISOString();
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

                <span className="time-range"><DateTag iso={startIso} pageDate={pageDate} />{formatTime(startIso)} — <DateTag iso={endIso} pageDate={pageDate} />{formatTime(endIso)}</span>

                <StarDisplay count={slot.starCount} size="1rem" />
              </div>
            );
          })}

          {slots.length > 5 && (
            <button
              onClick={() => setShowAll(v => !v)}
              style={{
                marginTop: '0.4rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--moonsilver-dim)',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.68rem',
                letterSpacing: '0.08em',
                padding: '0.2rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <span style={{ transform: showAll ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform 0.2s' }}>▾</span>
              {showAll ? 'Show less' : `Show ${slots.length - 5} more`}
            </button>
          )}
        </>
      )}

      {mounted && popup && createPortal(
        <div
          ref={popupRef}
          className="info-popup"
          style={{ top: popup.pos.top, left: popup.pos.left, position: 'fixed', zIndex: 99999, width: 280, minWidth: 220 }}
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
        >
          <PopupContent slot={slots[popup.index]} rank={popup.index + 1} />
        </div>,
        document.body,
      )}
    </ExpandSection>
  );
}
