import type { Metadata } from 'next';
import { StatusBar } from '@/components/layout/StatusBar';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider, themeInitScript } from '@/lib/theme';
import { site } from '@/lib/site-config';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: `${site.name.en} — Designer`,
    template: `%s · ${site.name.en}`,
  },
  description: site.role.en,
  openGraph: {
    title: `${site.name.en} — Designer`,
    description: site.role.en,
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name.en} — Designer`,
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
      </body>
    </html>
  );
}
