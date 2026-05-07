'use client';

import { createContext, useContext, useEffect, useState } from 'react';

/**
 * ThemeProvider
 * =============
 * 3 themes:
 *   - 'light'  — warm off-white (default)
 *   - 'medium' — warm gray (halfway)
 *   - 'dark'   — near-black
 *
 * 사용자 선택은 localStorage에 저장됨.
 * 첫 로드 시 깜빡임(FOUC) 방지를 위해 layout.tsx에 인라인 스크립트 있음.
 */

type ThemeMode = 'light' | 'medium' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'kdh-theme';

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove('light', 'medium', 'dark');
  if (mode === 'medium' || mode === 'dark') {
    root.classList.add(mode);
  }
  // 'light' is default — no class needed
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');

  // 초기 로드: localStorage에서 사용자 선택 복원
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const initialMode: ThemeMode =
      stored === 'medium' || stored === 'dark' || stored === 'light' ? stored : 'light';
    setModeState(initialMode);
    applyTheme(initialMode);
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

/**
 * Inline script — placed in <head> via layout.tsx
 * 페이지 첫 페인트 전에 테마를 적용해서 흰 화면 깜빡임을 막음.
 */
export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('${STORAGE_KEY}');
    if (stored === 'medium') {
      document.documentElement.classList.add('medium');
    } else if (stored === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;
