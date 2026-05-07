import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  darkMode: 'class', // 'class' strategy → toggle by adding/removing .dark on <html>
  theme: {
    extend: {
      colors: {
        // 색상은 모두 CSS 변수로 처리 → globals.css에서 light/dark 정의
        bg: {
          DEFAULT: 'var(--bg)',
          subtle: 'var(--bg-subtle)',
          inverse: 'var(--bg-inverse)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          secondary: 'var(--ink-secondary)',
          tertiary: 'var(--ink-tertiary)',
          inverse: 'var(--ink-inverse)',
        },
        line: {
          DEFAULT: 'var(--line)',
          strong: 'var(--line-strong)',
        },
        accent: {
          online: 'var(--accent-online)',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.04em' }],
        'xs': ['11px', { lineHeight: '16px', letterSpacing: '0.02em' }],
        'sm': ['13px', { lineHeight: '20px' }],
        'base': ['15px', { lineHeight: '24px' }],
        'lg': ['17px', { lineHeight: '26px' }],
        'xl': ['20px', { lineHeight: '30px' }],
        '2xl': ['28px', { lineHeight: '36px', letterSpacing: '-0.01em' }],
        '3xl': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em' }],
        '4xl': ['56px', { lineHeight: '62px', letterSpacing: '-0.025em' }],
      },
      letterSpacing: {
        'tightest': '-0.03em',
        'mono-wide': '0.05em',
      },
      transitionTimingFunction: {
        'editorial': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
