'use client';

import { useTheme } from '@/lib/theme';

/**
 * ThemeToggle — 3 segment switch
 *
 * [ ☀ ] [ ◐ ] [ ☾ ]
 *  light medium dark
 */

export function ThemeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="inline-flex items-center gap-0 border-hairline border-line rounded-full p-0.5 bg-bg"
    >
      <ToggleButton
        active={mode === 'light'}
        onClick={() => setMode('light')}
        label="Light mode"
      >
        ☀
      </ToggleButton>
      <ToggleButton
        active={mode === 'medium'}
        onClick={() => setMode('medium')}
        label="Medium mode"
      >
        ◐
      </ToggleButton>
      <ToggleButton
        active={mode === 'dark'}
        onClick={() => setMode('dark')}
        label="Dark mode"
      >
        ☾
      </ToggleButton>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`
        w-5 h-5 flex items-center justify-center rounded-full text-[10px] leading-none
        transition-colors duration-200
        ${
          active
            ? 'bg-ink text-bg'
            : 'text-ink-tertiary hover:text-ink-secondary'
        }
      `}
    >
      {children}
    </button>
  );
}
