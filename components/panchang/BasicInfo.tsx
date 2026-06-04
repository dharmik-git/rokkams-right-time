'use client';
import InfoDot from '@/components/ui/InfoDot';
import ExpandSection from '@/components/ui/ExpandSection';
import { formatTime } from '@/lib/formatTime';
import { ELEMENT_TYPES, TITHIS, NAKSHATRAS, YOGAS, KARANAS, VARAS, PAKSHAS } from '@/lib/data/descriptions';

interface Props { data: any; }

interface Slot {
  name: string;
  paksha?: string;
  pada?: number;
  isAuspicious?: boolean;
  start: string | null;
  end: string | null;
}

function formatSlotTime(start: string | null, end: string | null): string {
  const s = start ? formatTime(start) : '00:00';
  const e = end   ? formatTime(end)   : '23:59';
  return `${s} – ${e}`;
}

function nameColor(isAuspicious: boolean | null | undefined): string | undefined {
  if (isAuspicious === true)  return 'var(--auspicious-text)';
  if (isAuspicious === false) return 'var(--inauspicious-text)';
  return undefined;
}

function borderColor(isAuspicious: boolean | null | undefined): string {
  if (isAuspicious === true)  return 'var(--auspicious-text)';
  if (isAuspicious === false) return 'var(--inauspicious-text)';
  return 'rgba(200,150,26,0.35)';
}

function ElementRow({ label, labelDotKey, slots, getValueInfo, getValueBrief }: {
  label: string;
  labelDotKey?: string;
  slots: Slot[];
  getValueInfo: (name: string) => { isAuspicious: boolean } | null;
  getValueBrief: (name: string) => string | undefined;
}) {
  const labelInfo = labelDotKey ? ELEMENT_TYPES[labelDotKey] : null;

  return (
    <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid rgba(128,100,50,0.1)', marginBottom: '0.1rem' }}>
      {/* Label row — dot BEFORE the label text */}
      <div style={{ display: 'flex', alignItems: 'center', paddingTop: '0.35rem', gap: '0.4rem' }}>
        <div className="info-label" style={{ minWidth: 90, flexShrink: 0 }}>
          {labelInfo && <InfoDot title={labelInfo.label} brief={labelInfo.brief} large />}
          {label}
        </div>
      </div>

      {/* Name LEFT + Timing RIGHT for each slot */}
      {slots.map((slot, i) => {
        const displayName = slot.paksha ? `${slot.paksha} ${slot.name}` : slot.name;
        const vi = getValueInfo(slot.name);
        const brief = getValueBrief(slot.name);
        const timing = formatSlotTime(slot.start, slot.end);
        const color = nameColor(vi?.isAuspicious);
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            gap: '0.5rem',
            paddingLeft: '0.6rem', paddingTop: '0.2rem',
            borderLeft: `2px solid ${borderColor(vi?.isAuspicious)}`,
            marginLeft: '0.3rem', marginTop: '0.15rem',
            minWidth: 0,
          }}>
            <span style={{
              flex: 1, minWidth: 0,
              fontFamily: 'Cinzel, serif',
              fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)',
              fontWeight: 600,
              color: color ?? 'var(--moonsilver)',
              letterSpacing: '0.02em',
              wordBreak: 'break-word',
              display: 'flex', alignItems: 'center', gap: '0.35rem',
            }}>
              {vi && brief && (
                <InfoDot title={displayName} brief={brief} isAuspicious={vi.isAuspicious} />
              )}
              {displayName}
            </span>
            <span style={{
              flexShrink: 0,
              fontFamily: 'Cinzel, serif',
              fontSize: 'clamp(0.7rem, 2vw, 0.78rem)',
              fontWeight: 600,
              color: 'var(--moonsilver-dim)',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
              textAlign: 'right',
            }}>
              {timing}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SunMoonRow({ label, value, noBorder }: { label: string; value: string; noBorder?: boolean }) {
  return (
    <div className="info-row" style={noBorder ? { borderBottom: 'none' } : undefined}>
      <div className="info-label">{label}</div>
      <div className="info-value" style={{ fontFamily: 'Cinzel, serif', fontSize: '0.95rem', color: 'var(--gold-light)' }}>{value}</div>
    </div>
  );
}

function SimpleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <div className="info-label">{label}</div>
      <div className="info-value">{value}</div>
    </div>
  );
}

export default function BasicInfo({ data }: Props) {
  const { tithi, nakshatra, yoga, karana, vara, sunMoonTimes, moonSign, suryaNakshatra, suryaPada, nakshatraPada, transitions } = data;

  const tithiSlots: Slot[] = transitions?.tithi?.length
    ? transitions.tithi
    : [{ name: tithi.name, paksha: tithi.paksha, start: null, end: null }];

  const nakshatraSlots: Slot[] = transitions?.nakshatra?.length
    ? transitions.nakshatra
    : [{ name: nakshatra.name, pada: nakshatra.pada, start: null, end: null }];

  const yogaSlots: Slot[] = transitions?.yoga?.length
    ? transitions.yoga
    : [{ name: yoga.name, isAuspicious: yoga.isAuspicious, start: null, end: null }];

  const karanaSlots: Slot[] = transitions?.karana?.length
    ? transitions.karana
    : [{ name: karana.name, start: null, end: null }];

  return (
    <ExpandSection title="Basic Info" defaultOpen={false}>
      {/* Sun & Moon — no heading; no border between Sunrise/Sunset pair and Moonrise/Moonset pair */}
      <SunMoonRow label="Sunrise"  value={formatTime(sunMoonTimes.sunrise)} noBorder />
      <SunMoonRow label="Sunset"   value={formatTime(sunMoonTimes.sunset)} />
      <SunMoonRow label="Moonrise" value={formatTime(sunMoonTimes.moonrise) || '—'} noBorder />
      <SunMoonRow label="Moonset"  value={formatTime(sunMoonTimes.moonset) || '—'} />

      {/* Order: Tithi, Vara, Nakshatra, Yoga, Karana, Paksha */}
      <ElementRow
        label="Tithi"
        labelDotKey="tithi"
        slots={tithiSlots}
        getValueInfo={name => TITHIS[name] ?? null}
        getValueBrief={name => TITHIS[name]?.idealFor}
      />

      {/* Vara */}
      <div className="info-row">
        <div className="info-label">
          {VARAS[vara.name] && <InfoDot title={ELEMENT_TYPES.vara.label} brief={ELEMENT_TYPES.vara.brief} large />}
          Vara
        </div>
        <div className="info-value">
          {VARAS[vara.name] && <InfoDot title={vara.name} brief={VARAS[vara.name].idealFor} isAuspicious={VARAS[vara.name].isAuspicious} />}
          {vara.name}
        </div>
      </div>

      <ElementRow
        label="Nakshatra"
        labelDotKey="nakshatra"
        slots={nakshatraSlots.map(s => ({ ...s, name: s.pada ? `${s.name} (P${s.pada})` : s.name }))}
        getValueInfo={name => {
          const base = name.replace(/ \(P\d\)$/, '');
          return NAKSHATRAS[base] ?? null;
        }}
        getValueBrief={name => {
          const base = name.replace(/ \(P\d\)$/, '');
          return NAKSHATRAS[base]?.idealFor;
        }}
      />
      <ElementRow
        label="Yoga"
        labelDotKey="yoga"
        slots={yogaSlots}
        getValueInfo={name => YOGAS[name] ?? null}
        getValueBrief={name => YOGAS[name]?.idealFor}
      />
      <ElementRow
        label="Karana"
        labelDotKey="karana"
        slots={karanaSlots}
        getValueInfo={name => KARANAS[name] ?? null}
        getValueBrief={name => KARANAS[name]?.idealFor}
      />

      {/* Paksha */}
      <div className="info-row">
        <div className="info-label">
          {PAKSHAS[tithi.paksha] && <InfoDot title={ELEMENT_TYPES.paksha.label} brief={ELEMENT_TYPES.paksha.brief} large />}
          Paksha
        </div>
        <div className="info-value">
          {PAKSHAS[tithi.paksha] && <InfoDot title={tithi.paksha} brief={PAKSHAS[tithi.paksha].idealFor} isAuspicious={PAKSHAS[tithi.paksha].isAuspicious} />}
          {tithi.paksha}
        </div>
      </div>

      {/* Rashi & Nakshatra */}
      <p className="sub-label" style={{ marginTop: '1rem' }}>☽ Rashi &amp; Nakshatra</p>
      <SimpleRow label="Moon Sign"       value={moonSign} />
      <SimpleRow label="Surya Nakshatra" value={suryaNakshatra} />
      <SimpleRow label="Surya Pada"      value={String(suryaPada)} />
      <SimpleRow label="Chandra Pada"    value={String(nakshatraPada)} />
    </ExpandSection>
  );
}
