import type { Metadata } from 'next'
import Link from 'next/link'
import { Archive, ExternalLink } from 'lucide-react'
import './globals.css'
import NavigationBar from '@/components/NavigationBar'

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

const footerNav = {
  '탐색': [
    { href: '/cases', label: '복원 사례' },
    { href: '/stories', label: '기획전시' },
    { href: '/learn', label: '보존교육' },
  ],
  '아카이브': [
    { href: '/timeline', label: '타임라인' },
    { href: '/gallery', label: '갤러리' },
    { href: '/about', label: '프로젝트 소개' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <body
        className="min-h-full flex flex-col"
        style={{
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-text)',
        }}
      >
        <NavigationBar />
        <main className="flex-1">{children}</main>

        <footer
          className="relative mt-auto border-t overflow-hidden"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg-secondary)',
          }}
        >
          {/* Decorative dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
          {/* Vertical gold accent */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 opacity-40 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, transparent, var(--color-gold))',
            }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Top grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mb-12">
              {/* Brand */}
              <div className="md:col-span-5">
                <Link
                  href="/"
                  className="inline-flex items-center gap-3 group mb-5"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center border transition-colors"
                    style={{
                      backgroundColor: 'rgba(212, 168, 83, 0.08)',
                      borderColor: 'rgba(212, 168, 83, 0.25)',
                    }}
                  >
                    <Archive
                      size={19}
                      style={{ color: 'var(--color-gold)' }}
                    />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span
                      className="text-[9px] tracking-[0.25em] uppercase font-medium mb-1"
                      style={{ color: 'var(--color-gold)' }}
                    >
                      Archives KR
                    </span>
                    <span className="text-lg font-bold">
                      <span style={{ color: 'var(--color-gold)' }}>기록</span>
                      <span style={{ color: 'var(--color-text)' }}>유산</span>
                      <span
                        className="ml-1 text-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        복원 아카이브
                      </span>
                    </span>
                  </div>
                </Link>
                <p
                  className="text-sm leading-relaxed max-w-md mb-6"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  국가기록원의 기록물 복원 사업을 탐색할 수 있는 디지털
                  아카이브입니다. 훼손된 기록이 되살아나는 과정을, 시간의
                  흐름과 함께 확인하세요.
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href="https://github.com/changgi/archives-restore-kr"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors hover:bg-[var(--color-bg-hover)]"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-secondary)',
                    }}
                    aria-label="GitHub 저장소"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M12 .5C5.65.5.5 5.65.5 12.02c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.69-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.04 11.04 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.4-5.26 5.68.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.13 0 .31.21.68.8.56C20.22 21.4 23.5 17.09 23.5 12.02 23.5 5.65 18.35.5 12 .5Z" />
                    </svg>
                    <span>GitHub</span>
                  </a>
                  <a
                    href="https://www.archives.go.kr"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors hover:bg-[var(--color-bg-hover)]"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <ExternalLink size={13} />
                    <span>국가기록원</span>
                  </a>
                </div>
              </div>

              {/* Nav columns */}
              <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
                {Object.entries(footerNav).map(([heading, links]) => (
                  <div key={heading}>
                    <h3
                      className="text-[10px] tracking-[0.25em] uppercase font-medium mb-4"
                      style={{ color: 'var(--color-gold)' }}
                    >
                      {heading}
                    </h3>
                    <ul className="space-y-3">
                      {links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="text-sm transition-colors hover:text-[var(--color-gold)]"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div>
                  <h3
                    className="text-[10px] tracking-[0.25em] uppercase font-medium mb-4"
                    style={{ color: 'var(--color-gold)' }}
                  >
                    출처
                  </h3>
                  <ul className="space-y-3">
                    <li>
                      <a
                        href="https://www.archives.go.kr/next/newmanager/archivesRestoreData.do"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--color-gold)]"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        <span>복원 데이터</span>
                        <ExternalLink size={11} />
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.archives.go.kr/next/newmanager/archivesRestoreSupports.do"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--color-gold)]"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        <span>복원 지원</span>
                        <ExternalLink size={11} />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div
              className="relative h-px mb-8"
              style={{ backgroundColor: 'var(--color-border)' }}
            >
              <div
                className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--color-gold)', opacity: 0.6 }}
              />
            </div>

            {/* Bottom bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p
                className="text-xs text-center md:text-left"
                style={{ color: 'var(--color-text-muted)' }}
              >
                © {new Date().getFullYear()} 기록유산 복원 아카이브.
                <span className="mx-1.5">·</span>
                공공데이터를 활용한 비영리 아카이브 프로젝트
              </p>
              <p
                className="text-[10px] tracking-[0.2em] uppercase"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Built with Next.js · Supabase · Vercel
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
