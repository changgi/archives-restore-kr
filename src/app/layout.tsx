import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import NavigationBar from '@/components/NavigationBar'
import ScrollToTop from '@/components/ScrollToTop'
import JsonLd from '@/components/JsonLd'
import KeyboardShortcuts from '@/components/KeyboardShortcuts'
import LanguageProvider from '@/i18n/LanguageProvider'
import AppFooter from '@/components/AppFooter'
import SkipToContent from '@/components/SkipToContent'

export const metadata: Metadata = {
  metadataBase: new URL('https://projectrestore.vercel.app'),
  title: {
    default: '기록유산 복원 아카이브',
    template: '%s | 기록유산 복원 아카이브',
  },
  description:
    '국가기록원 기록물 복원 사업의 전과 후를 기록하는 디지털 아카이브. 종이류, 시청각 기록물의 복원 사례를 확인하세요.',
  keywords: [
    '기록물 복원',
    '국가기록원',
    '문화재',
    '아카이브',
    '보존',
    '복원',
    '디지털 아카이브',
    '복원 전후',
  ],
  authors: [{ name: 'Archives Restoration Korea' }],
  creator: 'Archives Restoration Korea',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: '기록유산 복원 아카이브',
    title: '기록유산 복원 아카이브',
    description:
      '국가기록원 기록물 복원 사업의 전과 후를 기록하는 디지털 아카이브',
    url: '/',
  },
  twitter: {
    card: 'summary',
    title: '기록유산 복원 아카이브',
    description:
      '국가기록원 기록물 복원 사업의 전과 후를 기록하는 디지털 아카이브',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const BASE_URL = 'https://projectrestore.vercel.app'
  const websiteLd = {
    '@type': 'WebSite',
    name: '기록유산 복원 아카이브',
    alternateName: 'Archives Restoration Korea',
    url: BASE_URL,
    inLanguage: 'ko',
    description:
      '국가기록원 기록물 복원 사업의 전과 후를 기록하는 디지털 아카이브',
    publisher: {
      '@type': 'Organization',
      name: 'Archives Restoration Korea',
      url: BASE_URL,
    },
  }

  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Preconnect to origins we always hit to cut DNS/TLS cost on LCP */}
        <link rel="preconnect" href="https://www.archives.go.kr" />
        <link rel="dns-prefetch" href="https://www.archives.go.kr" />
        <link rel="preconnect" href="https://qdhkeiblhqprsghvyoqe.supabase.co" />
        <link rel="dns-prefetch" href="https://qdhkeiblhqprsghvyoqe.supabase.co" />
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-text)',
        }}
      >
        <JsonLd data={websiteLd} />

        <LanguageProvider>
          <SkipToContent />
          <NavigationBar />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <ScrollToTop />
          <KeyboardShortcuts />
          <AppFooter />
        </LanguageProvider>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
