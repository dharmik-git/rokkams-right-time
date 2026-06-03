'use client';
import DateNavigator from '@/components/panchang/DateNavigator';
import { useTheme } from '@/lib/useTheme';
import { getMuscatToday } from '@/lib/formatTime';

interface Props {
  dateStr: string;
  onDateChange: (d: string) => void;
  numRoot: number;
}

export default function SiteHeader({ dateStr, onDateChange, numRoot }: Props) {
  const { theme, toggle } = useTheme();
  const today = getMuscatToday();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--night-deep)',
      borderBottom: '1px solid var(--night-border)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    }}>
      {/* Top strip: title + location + theme toggle */}
      <div style={{ borderBottom: '1px solid var(--night-border)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.5rem 1rem 0.3rem',
          gap: '0.5rem',
          flexWrap: 'wrap',
          maxWidth: 680, margin: '0 auto',
        }}>
          {/* Left: app name */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', minWidth: 0 }}>
            <span
              className="header-title"
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: 'clamp(0.78rem, 3.5vw, 1.05rem)',
                fontWeight: 700,
                color: 'var(--gold-light)',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
              }}>
              Rokkam&apos;s Right Time
            </span>
            <span style={{
              fontFamily: 'Cinzel, serif', fontSize: 'clamp(0.6rem, 1.8vw, 0.75rem)',
              color: 'var(--moonsilver-dim)', letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              Muscat, Oman
            </span>
          </div>

          {/* Right: location + theme toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} className="header-coords">
              <span style={{ fontSize: '0.75rem' }}>🇴🇲</span>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', color: 'var(--moonsilver-dim)', letterSpacing: '0.06em' }}>
                Muscat · 23.59°N 58.38°E · UTC+4
              </span>
            </div>
            <button
              className="theme-toggle"
              onClick={toggle}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀' : '🌙'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom strip: select date + date nav + numerology + today */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0.4rem 1rem 0.45rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
          gap: '0.6rem',
          flexWrap: 'wrap',
        }}>
          <div style={{
            fontFamily: 'Cinzel, serif', fontSize: 'clamp(0.55rem, 1.6vw, 0.65rem)',
            color: 'var(--moonsilver-dim)', letterSpacing: '0.14em',
            textTransform: 'uppercase', display: 'flex', gap: '0.3rem',
            alignItems: 'center', opacity: 0.55, whiteSpace: 'nowrap',
            flexShrink: 1, minWidth: 0,
          }}>
            <span>SELECT DATE</span>
          </div>
          <div style={{ flex: '1 1 auto' }}>
            <DateNavigator dateStr={dateStr} onChange={onDateChange} />
          </div>
          <div className="num-circle" title={`Numerology digit root of ${dateStr}`}>{numRoot}</div>
          {dateStr !== today && (
            <button
              onClick={() => onDateChange(today)}
              style={{
                background: 'none', border: '1px solid var(--saffron)',
                borderRadius: '2px', color: 'var(--saffron)',
                padding: '0.22rem 0.45rem', cursor: 'pointer',
                fontFamily: 'Cinzel, serif', fontSize: 'clamp(0.55rem, 2vw, 0.6rem)',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {isMobile ? '↺' : 'Today'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
