import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { StatusBar } from '@/components/layout/StatusBar';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider, themeInitScript } from '@/lib/theme';
import { site } from '@/lib/site-config';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: `${site.name.en} · Designer`,
    template: `%s · ${site.name.en}`,
  },
  description: site.role.en,
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: `${site.name.en} · Designer`,
    description: site.role.en,
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name.en} · Designer`,
    description: site.role.en,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          첫 페인트 전에 테마를 적용해서 흰 화면 깜빡임(FOUC)을 막음.
          dangerouslySetInnerHTML이 React에서 인라인 스크립트를 넣는 표준 방식.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <StatusBar />
          <main className="pt-20">{children}</main>
          <Footer />
        </ThemeProvider>
        {/*
          Vercel Web Analytics.
          익명 페이지뷰만 수집 (쿠키 없음, GDPR 호환).
          무료 plan: 2,500 events/월.
        */}
        <Analytics />
      </body>
    </html>
  );
}
