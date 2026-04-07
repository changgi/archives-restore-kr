import type { Metadata } from 'next'
import './globals.css'
import NavigationBar from '@/components/NavigationBar'

export const metadata: Metadata = {
  title: {
    default: '기록유산 복원 아카이브',
    template: '%s | 기록유산 복원 아카이브',
  },
  description: '국가기록원 기록물 복원 사업의 전과 후를 기록하는 디지털 아카이브. 종이류, 시청각 기록물의 복원 사례를 확인하세요.',
  keywords: ['기록물 복원', '국가기록원', '문화재', '아카이브', '보존', '복원'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: '기록유산 복원 아카이브',
    title: '기록유산 복원 아카이브',
    description: '국가기록원 기록물 복원 사업의 전과 후를 기록하는 디지털 아카이브',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
        <NavigationBar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[var(--color-border)] py-8" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-sm font-medium" style={{ color: 'var(--color-gold)' }}>기록유산 복원 아카이브</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  데이터 출처: 국가기록원 (archives.go.kr)
                </p>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                본 사이트는 공공데이터를 활용한 비영리 아카이브 프로젝트입니다.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
