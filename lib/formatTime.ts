export const MUSCAT_TZ = 'Asia/Muscat';

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: MUSCAT_TZ,
  });
}

function dateDiffDays(from: string, to: string): number {
  const a = new Date(from + 'T00:00:00');
  const b = new Date(to + 'T00:00:00');
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function formatTimeWithDate(iso: string | null | undefined, pageDate: string): string {
  if (!iso) return '—';
  const timeStr = new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: MUSCAT_TZ,
  });
  const muscatDate = new Intl.DateTimeFormat('en-CA', { timeZone: MUSCAT_TZ }).format(new Date(iso));
  if (Math.abs(dateDiffDays(pageDate, muscatDate)) <= 1) return timeStr;
  const [, m, d] = muscatDate.split('-').map(Number);
  return `${timeStr} [${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}]`;
}

export function formatDateDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

export function getMuscatToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: MUSCAT_TZ }).format(new Date());
}

export function stepDate(dateStr: string, delta: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d + delta);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

export function digitRoot(dateStr: string): number {
  const digits = dateStr.replace(/-/g, '').split('').map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9) {
    sum = String(sum).split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}
