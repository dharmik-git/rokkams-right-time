'use client';
import InfoDot from '@/components/ui/InfoDot';
import { MUSCAT_TZ } from '@/lib/formatTime';

function muscatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: MUSCAT_TZ }).format(new Date(iso));
}

function timeOnly(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: MUSCAT_TZ,
  });
}

function fullDate(iso: string): string {
  // e.g. "Fri, 12 Jun 2026"
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: MUSCAT_TZ,
  });
}

/**
 * Renders a single time (HH:MM in Muscat tz). If that time actually falls on a
 * day other than the page being viewed, a small "i" info icon is shown beside
 * it; tapping it reveals the real date and time the item lands on.
 */
export default function TimeValue({ iso, date }: { iso: string | null | undefined; date: string }) {
  if (!iso) return <>—</>;
  const t = timeOnly(iso);
  if (muscatDate(iso) === date) return <>{t}</>;

  const brief = `Falls on ${fullDate(iso)} at ${t}`;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25em', whiteSpace: 'nowrap' }}>
      {t}
      <InfoDot title="" brief={brief} descriptionOnly label="i" />
    </span>
  );
}
