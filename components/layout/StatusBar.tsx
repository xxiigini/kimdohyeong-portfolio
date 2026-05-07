'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { site } from '@/lib/site-config';
import { ThemeToggle } from './ThemeToggle';

/**
 * StatusBar — 사이트의 시그니처 컴포넌트
 *
 * 상단: 이름 + 메인 네비 + 테마 토글
 * 하단 띠: 위치 좌표 + 실시간 시간 + 사용 툴 + 온라인 상태
 */

function useClock(timezone: string) {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setTime(formatter.format(now));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [timezone]);

  return time;
}

export function StatusBar() {
  const time = useClock(site.location.current.timezone);
  const { origin, current, next } = site.location;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md">
      {/* Top row — branding + nav + theme toggle */}
      <div className="flex items-center justify-between px-6 py-3 border-hairline border-b border-line">
        <Link href="/" className="text-sm font-medium tracking-tight">
          {site.name.en}
        </Link>
        <div className="flex items-center gap-6">
          <nav className="flex gap-6 text-sm">
            <Link href="/work" className="hover:text-ink-secondary transition-colors">
              Work
            </Link>
            <Link href="/about" className="hover:text-ink-secondary transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-ink-secondary transition-colors">
              Contact
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>

      {/* Bottom strip — system data */}
      <div className="flex items-center justify-between px-6 py-1.5 bg-bg-subtle font-mono-tabular text-2xs tracking-mono-wide uppercase text-ink-secondary overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-3">
          <span>{origin.lat} {origin.label}</span>
          <span className="text-ink-tertiary">→</span>
          <span className="text-ink">{current.lat} {current.label}</span>
          <span className="text-ink-tertiary">→</span>
          <span className="text-accent-online">{next.symbol} {next.label}</span>
        </div>

        <div className="flex items-center gap-3">
          <span suppressHydrationWarning>
            {time || '—'} {site.location.current.tzAbbr}
          </span>
          <span className="text-ink-tertiary">·</span>
          <span>◐ {site.tools.join(' · ')}</span>
          {site.status.available && (
            <>
              <span className="text-ink-tertiary">·</span>
              <span className="text-accent-online">● ONLINE</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
