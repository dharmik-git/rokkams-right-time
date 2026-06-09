'use client';
import InfoDot from '@/components/ui/InfoDot';
import DateTag from '@/components/ui/DateTag';
import MoonCycleTag from '@/components/ui/MoonCycleTag';
import ExpandSection from '@/components/ui/ExpandSection';
import { formatTime, stepDate, formatDateDisplay } from '@/lib/formatTime';
import { ELEMENT_TYPES, TITHIS, NAKSHATRAS, YOGAS, KARANAS, VARAS, PAKSHAS } from '@/lib/data/descriptions';

interface Props { data: any; pageDate: string; }

interface Slot {
  name: string;
  paksha?: string;
  pada?: number;
  isAuspicious?: boolean;
  start: string | null;
  end: string | null;
  startReal?: string;
  endReal?: string;
}

// English weekday names indexed by vara.index (0 = Sunday)
const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function SlotTime({ start, end, startReal, endReal, pageDate }: {
  start: string | null; end: string | null;
  startReal?: string; endReal?: string;
  pageDate: string;
}) {
  // Prefer the true astronomical boundary times; they make DateTag show the
  // next-day "#" hash when the element crosses midnight, instead of capping at 00:00/23:59.
  const startIso = start ?? startReal ?? null;
  const endIso   = end   ?? endReal   ?? null;
  const s = startIso ? formatTime(startIso) : '00:00';
  const e = endIso   ? formatTime(endIso)   : '23:59';
  return (
    <>
      <DateTag iso={startIso} pageDate={pageDate} />{s} – <DateTag iso={endIso} pageDate={pageDate} />{e}
    </>
  );
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

function ElementRow({ label, labelDotKey, slots, getValueInfo, getValueBrief, pageDate, rightOverride }: {
  label: string;
  labelDotKey?: string;
  slots: Slot[];
  getValueInfo: (name: string) => { isAuspicious: boolean } | null;
  getValueBrief: (name: string) => string | undefined;
  pageDate: string;
  rightOverride?: React.ReactNode;
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
              {rightOverride ?? (
                <SlotTime
                  start={slot.start} end={slot.end}
                  startReal={slot.startReal} endReal={slot.endReal}
                  pageDate={pageDate}
                />
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SunMoonRow({ label, iso, pageDate, prefixEl, noBorder }: { label: string; iso: string | null | undefined; pageDate: string; prefixEl?: React.ReactNode; noBorder?: boolean }) {
  return (
    <div className="info-row" style={noBorder ? { borderBottom: 'none' } : undefined}>
      <div className="info-label">{label}</div>
      <div className="info-value" style={{ fontFamily: 'Cinzel, serif', fontSize: '0.95rem', color: 'var(--gold-light)' }}>
        {prefixEl}<DateTag iso={iso} pageDate={pageDate} />{iso ? formatTime(iso) : '—'}
      </div>
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

// Paksha: no timing — the value (Krishna/Shukla) sits where the timing used to be.
function PakshaRow({ value }: { value: string }) {
  const labelInfo = ELEMENT_TYPES['paksha'];
  const vi = PAKSHAS[value];
  const color = nameColor(vi?.isAuspicious);
  return (
    <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid rgba(128,100,50,0.1)', marginBottom: '0.1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.35rem', gap: '0.4rem' }}>
        <div className="info-label" style={{ minWidth: 90, flexShrink: 0 }}>
          {labelInfo && <InfoDot title={labelInfo.label} brief={labelInfo.brief} large />}
          Paksha
        </div>
        <span style={{
          flexShrink: 0,
          fontFamily: 'Cinzel, serif',
          fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)',
          fontWeight: 600,
          color: color ?? 'var(--moonsilver)',
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
          textAlign: 'right',
          display: 'flex', alignItems: 'center', gap: '0.35rem',
        }}>
          {vi?.idealFor && <InfoDot title={value} brief={vi.idealFor} isAuspicious={vi.isAuspicious} />}
          {value}
        </span>
      </div>
    </div>
  );
}

export default function BasicInfo({ data, pageDate }: Props) {
  const { tithi, nakshatra, yoga, karana, vara, sunMoonTimes, moonSign, suryaNakshatra, transitions } = data;

  const { moonrise, moonset } = sunMoonTimes;
  const moonsetFromPrevCycle =
    !!moonset && (!moonrise || new Date(moonset).getTime() < new Date(moonrise).getTime());
  const moonroseOnDate = moonsetFromPrevCycle
    ? formatDateDisplay(stepDate(pageDate, -1))
    : null;

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

  // Vara has no astronomical transition: show its English weekday instead of a time.
  const varaSlots: Slot[] = [{ name: vara.name, start: null, end: null }];

  return (
    <ExpandSection title="Basic Info" defaultOpen={false}>
      {/* Sun & Moon — no heading; no border between Sunrise/Sunset pair and Moonrise/Moonset pair */}
      <SunMoonRow label="Sunrise"  iso={sunMoonTimes.sunrise}  pageDate={pageDate} noBorder />
      <SunMoonRow label="Sunset"   iso={sunMoonTimes.sunset}   pageDate={pageDate} />
      <SunMoonRow label="Moonrise" iso={sunMoonTimes.moonrise} pageDate={pageDate} noBorder />
      <SunMoonRow label="Moonset"  iso={sunMoonTimes.moonset}  pageDate={pageDate} prefixEl={moonroseOnDate ? <MoonCycleTag roseOnDate={moonroseOnDate} /> : undefined} />

      {/* Order: Tithi, Vara, Nakshatra, Yoga, Karana, Paksha */}
      <ElementRow
        label="Tithi"
        labelDotKey="tithi"
        slots={tithiSlots}
        getValueInfo={name => TITHIS[name] ?? null}
        getValueBrief={name => TITHIS[name]?.idealFor}
        pageDate={pageDate}
      />

      <ElementRow
        label="Vara"
        labelDotKey="vara"
        slots={varaSlots}
        getValueInfo={name => VARAS[name] ?? null}
        getValueBrief={name => VARAS[name]?.idealFor}
        pageDate={pageDate}
        rightOverride={WEEKDAYS_EN[vara.index]}
      />

      <ElementRow
        label="Nakshatra"
        labelDotKey="nakshatra"
        slots={nakshatraSlots}
        getValueInfo={name => NAKSHATRAS[name] ?? null}
        getValueBrief={name => NAKSHATRAS[name]?.idealFor}
        pageDate={pageDate}
      />
      <ElementRow
        label="Yoga"
        labelDotKey="yoga"
        slots={yogaSlots}
        getValueInfo={name => YOGAS[name] ?? null}
        getValueBrief={name => YOGAS[name]?.idealFor}
        pageDate={pageDate}
      />
      <ElementRow
        label="Karana"
        labelDotKey="karana"
        slots={karanaSlots}
        getValueInfo={name => KARANAS[name] ?? null}
        getValueBrief={name => KARANAS[name]?.idealFor}
        pageDate={pageDate}
      />

      <PakshaRow value={tithi.paksha} />

      {/* Rashi & Nakshatra */}
      <p className="sub-label" style={{ marginTop: '1rem' }}>☽ Rashi &amp; Nakshatra</p>
      <SimpleRow label="Moon Sign"       value={moonSign} />
      <SimpleRow label="Surya Nakshatra" value={suryaNakshatra} />
    </ExpandSection>
  );
}
