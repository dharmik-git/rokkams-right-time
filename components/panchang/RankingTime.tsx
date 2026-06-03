'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ExpandSection from '@/components/ui/ExpandSection';
import { formatTime } from '@/lib/formatTime';
import { TITHIS, YOGAS, NAKSHATRAS, KARANAS, VARAS, PAKSHAS } from '@/lib/data/descriptions';

interface Interval { start: string; end: string; }

const CLOSE_ALL = 'infodot:closeAll';

const AUSPICIOUS_KEYS = ['brahmaMuhurta','abhijitMuhurta','godhuliMuhurta','amritKalam','pratahSandhya','vijayaMuhurta','madhyahnaSandhya','sayahanaSandhya','nishitaMuhurta'];
const INAUSPICIOUS_KEYS = ['rahuKalam','gulikaKalam','varjyam','baana','yamaGanda','vidalYoga','durMuhurta','bhadra'];

const KEY_TO_LABEL: Record<string, string> = {
  brahmaMuhurta: 'Brahma Muhurta',
  abhijitMuhurta: 'Abhijit Muhurta',
  godhuliMuhurta: 'Godhuli Muhurta',
  amritKalam: 'Amrit Kalam',
  pratahSandhya: 'Pratah Sandhya',
  vijayaMuhurta: 'Vijaya Muhurta',
  madhyahnaSandhya: 'Madhyahna Sandhya',
  sayahanaSandhya: 'Sayahana Sandhya',
  nishitaMuhurta: 'Nishita Muhurta',
};

function computeRankedSlots(muhurta: Record<string, any>): Array<{ start: number; end: number; score: number; labels: string[] }> {
  const boundaries = new Set<number>();
  const allAus: { iv: Interval; label: string }[] = [];
  const allBad: Interval[] = [];

  for (const k of AUSPICIOUS_KEYS) {
    const raw = muhurta[k];
    if (raw === null) continue;
    const arr: Interval[] = Array.isArray(raw) ? raw : [raw];
    for (const iv of arr) {
      allAus.push({ iv, label: KEY_TO_LABEL[k] ?? k });
      boundaries.add(new Date(iv.start).getTime());
      boundaries.add(new Date(iv.end).getTime());
    }
  }
  for (const k of INAUSPICIOUS_KEYS) {
    const raw = muhurta[k];
    const arr: Interval[] = Array.isArray(raw) ? raw : [raw];
    for (const iv of arr) { allBad.push(iv); boundaries.add(new Date(iv.start).getTime()); boundaries.add(new Date(iv.end).getTime()); }
  }

  const sorted = Array.from(boundaries).sort((a, b) => a - b);
  const slots: Array<{ start: number; end: number; score: number; labels: string[] }> = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const s = sorted[i], e = sorted[i + 1];
    if (e - s < 60000) continue;
    const mid = (s + e) / 2;
    const isBad = allBad.some(iv => new Date(iv.start).getTime() <= s && new Date(iv.end).getTime() >= e);
    if (isBad) continue;
    const contributing = allAus.filter(({ iv }) => new Date(iv.start).getTime() <= mid && new Date(iv.end).getTime() >= mid);
    if (contributing.length === 0) continue;
    slots.push({ start: s, end: e, score: contributing.length, labels: contributing.map(c => c.label) });
  }

  const merged: typeof slots = [];
  for (const slot of slots) {
    const prev = merged[merged.length - 1];
    if (prev && prev.end === slot.start && prev.score === slot.score &&
        JSON.stringify(prev.labels) === JSON.stringify(slot.labels)) {
      prev.end = slot.end;
    } else {
      merged.push({ ...slot });
    }
  }

  return merged.sort((a, b) => b.score - a.score || a.start - b.start);
}

function buildQualityBrief(data: any): string {
  const lines: string[] = [];

  const tithiInfo = TITHIS[data.tithi?.name];
  const tithiOk = tithiInfo?.isAuspicious ?? true;
  lines.push(`${tithiOk ? '✅' : '❌'} Tithi (${data.tithi?.name ?? '—'}): ${tithiInfo?.idealFor ?? (tithiOk ? 'Auspicious' : 'Inauspicious')}`);

  const yogaInfo = YOGAS[data.yoga?.name];
  const yogaOk = yogaInfo?.isAuspicious ?? data.yoga?.isAuspicious ?? true;
  lines.push(`${yogaOk ? '✅' : '❌'} Yoga (${data.yoga?.name ?? '—'}): ${yogaInfo?.idealFor ?? (yogaOk ? 'Auspicious' : 'Inauspicious')}`);

  const varaInfo = VARAS[data.vara?.name];
  const varaOk = varaInfo?.isAuspicious ?? true;
  lines.push(`${varaOk ? '✅' : '❌'} Vara (${data.vara?.name ?? '—'}): ${varaInfo?.idealFor ?? (varaOk ? 'Auspicious' : 'Inauspicious')}`);

  const nakshatraInfo = NAKSHATRAS[data.nakshatra?.name];
  const nakshatraOk = nakshatraInfo?.isAuspicious ?? true;
  lines.push(`${nakshatraOk ? '✅' : '❌'} Nakshatra (${data.nakshatra?.name ?? '—'}): ${nakshatraInfo?.idealFor ?? (nakshatraOk ? 'Auspicious' : 'Inauspicious')}`);

  const karanaInfo = KARANAS[data.karana?.name];
  const karanaOk = karanaInfo?.isAuspicious ?? true;
  lines.push(`${karanaOk ? '✅' : '❌'} Karana (${data.karana?.name ?? '—'}): ${karanaInfo?.idealFor ?? (karanaOk ? 'Auspicious' : 'Inauspicious')}`);

  const pakshaInfo = PAKSHAS[data.paksha];
  const pakshaOk = pakshaInfo?.isAuspicious ?? true;
  lines.push(`${pakshaOk ? '✅' : '❌'} Paksha (${data.paksha ?? '—'}): ${pakshaInfo?.idealFor ?? (pakshaOk ? 'Auspicious' : 'Inauspicious')}`);

  return lines.join('\n');
}

function rankClass(i: number) {
  return i < 3 ? `rank-${i + 1}` : 'rank-n';
}

// Inline popup trigger — used for rank badge and stars
function PopupTrigger({ children, brief, myId, style }: {
  children: React.ReactNode;
  brief: string;
  myId: React.MutableRefObject<number>;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    function handleCloseAll(e: Event) {
      const ce = e as CustomEvent;
      if (ce.detail?.except !== myId.current) setOpen(false);
    }
    document.addEventListener(CLOSE_ALL, handleCloseAll);
    return () => document.removeEventListener(CLOSE_ALL, handleCloseAll);
  }, [myId]);

  function show(e: React.MouseEvent | React.TouchEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (!triggerRef.current) return;
    document.dispatchEvent(new CustomEvent(CLOSE_ALL, { detail: { except: myId.current } }));
    const rect = triggerRef.current.getBoundingClientRect();
    const W = 268, H = 180;
    let left = rect.left;
    if (left + W > window.innerWidth - 8) left = window.innerWidth - W - 8;
    if (left < 8) left = 8;
    let top = rect.bottom + 6;
    if (top + H > window.innerHeight - 8) top = rect.top - H - 6;
    if (top < 8) top = 8;
    setPos({ top, left });
    setOpen(v => !v);
  }

  useEffect(() => {
    if (!open) return;
    function outside(e: MouseEvent) {
      const t = e.target as Node;
      if (popupRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, [open]);

  useEffect(() => {
    if (!open || !popupRef.current || !triggerRef.current) return;
    const r = popupRef.current.getBoundingClientRect();
    const tr = triggerRef.current.getBoundingClientRect();
    let { left, top } = pos;
    if (left + r.width > window.innerWidth - 8) left = window.innerWidth - r.width - 8;
    if (left < 8) left = 8;
    if (top + r.height > window.innerHeight - 8) top = tr.top - r.height - 6;
    if (top < 8) top = 8;
    if (left !== pos.left || top !== pos.top) setPos({ top, left });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <span
        ref={triggerRef}
        onClick={show}
        onTouchEnd={e => show(e)}
        role="button"
        tabIndex={0}
        aria-label="More info"
        onKeyDown={e => e.key === 'Enter' && show(e as any)}
        style={{ cursor: 'pointer', ...style }}
      >
        {children}
      </span>
      {mounted && open && createPortal(
        <div
          ref={popupRef}
          className="info-popup"
          style={{ top: pos.top, left: pos.left, position: 'fixed', zIndex: 99999, width: 'auto', maxWidth: 268, minWidth: 160 }}
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
        >
          <div style={{ fontSize: '0.82rem', color: 'var(--moonsilver)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{brief}</div>
        </div>,
        document.body
      )}
    </>
  );
}

interface Props { muhurta: Record<string, any>; panchangData: any; }

export default function RankingTime({ muhurta, panchangData }: Props) {
  const ranked = computeRankedSlots(muhurta);
  const qualityBrief = buildQualityBrief(panchangData);
  // Shared ID namespace so PopupTriggers participate in the same close-all event
  const badgeIds = useRef(ranked.map(() => Math.random()));
  const starIds = useRef(ranked.map(() => Math.random()));

  // Regenerate IDs if ranked length changes (different date)
  if (badgeIds.current.length !== ranked.length) {
    badgeIds.current = ranked.map(() => Math.random());
    starIds.current = ranked.map(() => Math.random());
  }

  return (
    <ExpandSection title="Ranking of Best Auspicious Time" accentColor="var(--gold-light)">
      {ranked.length === 0 ? (
        <p style={{ color: 'var(--moonsilver-dim)', fontStyle: 'italic', fontSize: '0.9rem' }}>No clean auspicious windows today.</p>
      ) : (
        ranked.map((slot, i) => {
          const startIso = new Date(slot.start).toISOString();
          const endIso   = new Date(slot.end).toISOString();
          const stars = '✦'.repeat(Math.min(slot.score, 5));
          const badgeIdRef = { current: badgeIds.current[i] };
          const starIdRef  = { current: starIds.current[i] };
          return (
            <div key={i} className="time-chip" style={{ alignItems: 'center', gap: '0.6rem' }}>
              {/* Rank number — clickable, shows quality brief */}
              <PopupTrigger brief={qualityBrief} myId={badgeIdRef}>
                <span className={`rank-badge ${rankClass(i)}`}>{i + 1}</span>
              </PopupTrigger>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="time-range">{formatTime(startIso)} — {formatTime(endIso)}</span>
                  {/* Stars — clickable, shows which muhurtas overlap */}
                  <PopupTrigger brief={slot.labels.join('\n')} myId={starIdRef}>
                    <span style={{ color: 'var(--gold)', fontSize: '0.65rem', opacity: 0.7 }}>{stars}</span>
                  </PopupTrigger>
                </div>
              </div>
            </div>
          );
        })
      )}
    </ExpandSection>
  );
}

export { computeRankedSlots, KEY_TO_LABEL, AUSPICIOUS_KEYS };
