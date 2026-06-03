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
  const e = end   ? formatTime(end)   : null;
  return e ? `${s} – ${e}` : `${s} – end of day`;
}

// A row with element timing slots listed below the header
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
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', paddingTop: '0.35rem', gap: '0.5rem' }}>
        <div className="info-label" style={{ minWidth: 90, flexShrink: 0 }}>
          {label}
          {labelInfo && <InfoDot title={labelInfo.label} brief={labelInfo.brief} />}
        </div>
        {/* If single slot, show name inline; if multiple, they appear below */}
        {slots.length === 1 && (
          <div className="info-value" style={{ flex: 1 }}>
            <span>{slots[0].paksha ? `${slots[0].paksha} ${slots[0].name}` : slots[0].name}</span>
            {(() => {
              const vi = getValueInfo(slots[0].name);
              const brief = getValueBrief(slots[0].name);
              return vi && brief ? (
                <InfoDot title={slots[0].paksha ? `${slots[0].paksha} ${slots[0].name}` : slots[0].name} brief={brief} isAuspicious={vi.isAuspicious} />
              ) : null;
            })()}
          </div>
        )}
        {slots.length > 1 && <div className="info-value" style={{ flex: 1, color: 'var(--moonsilver-dim)', fontSize: '0.78rem' }}>{slots.length} today</div>}
      </div>

      {/* Timing rows for each slot */}
      {slots.map((slot, i) => {
        const displayName = slot.paksha ? `${slot.paksha} ${slot.name}` : slot.name;
        const vi = getValueInfo(slot.name);
        const brief = getValueBrief(slot.name);
        const timing = formatSlotTime(slot.start, slot.end);
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.3rem 0.5rem',
            paddingLeft: '0.6rem', paddingTop: '0.25rem',
            borderLeft: `2px solid ${vi?.isAuspicious === false ? 'rgba(168,16,16,0.5)' : 'rgba(200,150,26,0.35)'}`,
            marginLeft: '0.3rem', marginTop: '0.2rem',
          }}>
            {/* Name + dot — shown for multi-slot rows */}
            {slots.length > 1 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'Cinzel, serif', fontSize: '0.95rem', fontWeight: 600, color: vi?.isAuspicious === false ? '#CC2020' : 'var(--moonsilver)', letterSpacing: '0.02em', minWidth: 0, wordBreak: 'break-word' }}>
                {displayName}
                {vi && brief && <InfoDot title={displayName} brief={brief} isAuspicious={vi.isAuspicious} />}
              </span>
            )}
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', fontWeight: 600, color: 'var(--moonsilver-dim)', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
              {timing}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SunMoonRow({ label, icon, value }: { label: string; icon: string; value: string }) {
  return (
    <div className="info-row">
      <div className="info-label">{icon} {label}</div>
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
  const { tithi, nakshatra, yoga, karana, vara, sunMoonTimes, samvat, moonSign, suryaNakshatra, suryaPada, nakshatraPada, masaName, transitions } = data;

  // Build slots from transitions (fallback to single computed value if no transitions data)
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
    <ExpandSection title="Basic Info" defaultOpen={true}>
      {/* Sun & Moon */}
      <p className="sub-label">☀ Sun &amp; Moon</p>
      <SunMoonRow label="Sunrise"  icon="🌅" value={formatTime(sunMoonTimes.sunrise)} />
      <SunMoonRow label="Sunset"   icon="🌇" value={formatTime(sunMoonTimes.sunset)} />
      <SunMoonRow label="Moonrise" icon="🌕" value={formatTime(sunMoonTimes.moonrise) || '—'} />
      <SunMoonRow label="Moonset"  icon="🌑" value={formatTime(sunMoonTimes.moonset) || '—'} />

      {/* Five Limbs with timings */}
      <p className="sub-label" style={{ marginTop: '1rem' }}>✦ Pancha Anga</p>

      <ElementRow
        label="Tithi"
        labelDotKey="tithi"
        slots={tithiSlots}
        getValueInfo={name => TITHIS[name] ?? null}
        getValueBrief={name => TITHIS[name]?.idealFor}
      />
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

      {/* Vara — no timing transitions (same all day) */}
      <div className="info-row">
        <div className="info-label">
          Vara
          <InfoDot title={ELEMENT_TYPES.vara.label} brief={ELEMENT_TYPES.vara.brief} />
        </div>
        <div className="info-value">
          {vara.name}
          {VARAS[vara.name] && <InfoDot title={vara.name} brief={VARAS[vara.name].idealFor} isAuspicious={VARAS[vara.name].isAuspicious} />}
        </div>
      </div>

      {/* Paksha */}
      <div className="info-row">
        <div className="info-label">
          Paksha
          <InfoDot title={ELEMENT_TYPES.paksha.label} brief={ELEMENT_TYPES.paksha.brief} />
        </div>
        <div className="info-value">
          {tithi.paksha}
          {PAKSHAS[tithi.paksha] && <InfoDot title={tithi.paksha} brief={PAKSHAS[tithi.paksha].idealFor} isAuspicious={PAKSHAS[tithi.paksha].isAuspicious} />}
        </div>
      </div>

      {/* Samvat */}
      <p className="sub-label" style={{ marginTop: '1rem' }}>🗓 Samvat &amp; Calendar</p>
      <SimpleRow label="Vikram Samvat"   value={String(samvat.vikrama)} />
      <SimpleRow label="Shaka Samvat"    value={String(samvat.shaka)} />
      <SimpleRow label="Gujarati Samvat" value={String(samvat.gujarati)} />
      <SimpleRow label="Chandra Masa"    value={masaName} />

      {/* Rashi */}
      <p className="sub-label" style={{ marginTop: '1rem' }}>☽ Rashi &amp; Nakshatra</p>
      <SimpleRow label="Moon Sign"       value={moonSign} />
      <SimpleRow label="Surya Nakshatra" value={suryaNakshatra} />
      <SimpleRow label="Surya Pada"      value={String(suryaPada)} />
      <SimpleRow label="Chandra Pada"    value={String(nakshatraPada)} />
    </ExpandSection>
  );
}
