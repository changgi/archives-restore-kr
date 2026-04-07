import type { Metadata } from 'next'
import { getStats } from '@/lib/queries'

export const metadata: Metadata = {
  title: '소개',
  description: '기록유산 복원 아카이브 프로젝트 소개. 국가기록원 데이터를 활용한 디지털 아카이브입니다.',
}

export default async function AboutPage() {
  const stats = await getStats()

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">
          <span style={{ color: 'var(--color-gold)' }}>프로젝트</span> 소개
        </h1>

        <div className="space-y-8">
          {/* About */}
          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-gold)' }}>
              기록유산 복원 아카이브란?
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              본 프로젝트는 국가기록원의 기록물 복원 사업 데이터를 수집, 정리하여 구축한 디지털 아카이브입니다.
              종이류 및 시청각 기록물의 복원 전후 이미지를 비교하고, 연도별 타임라인을 통해
              복원 사업의 흐름을 시각적으로 확인할 수 있습니다.
            </p>
          </section>

          {/* Data */}
          <section
            className="rounded-xl border border-[var(--color-border)] p-6"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
          >
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-gold)' }}>
              데이터 출처
            </h2>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <li className="flex items-start gap-2">
                <span style={{ color: 'var(--color-gold)' }}>-</span>
                <span>국가기록원 (National Archives of Korea, archives.go.kr)</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: 'var(--color-gold)' }}>-</span>
                <span>총 {stats.totalCases}건의 복원 사례 ({stats.yearRange.min}~{stats.yearRange.max}년)</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: 'var(--color-gold)' }}>-</span>
                <span>{stats.totalOrganizations}개 기관의 요청 기록물</span>
              </li>
            </ul>
          </section>

          {/* Tech */}
          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-gold)' }}>
              기술 스택
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: 'Next.js 15', desc: 'App Router' },
                { name: 'TypeScript', desc: '타입 안전성' },
                { name: 'Tailwind CSS', desc: '스타일링' },
                { name: 'Supabase', desc: '데이터베이스' },
                { name: 'Framer Motion', desc: '애니메이션' },
                { name: 'Vercel', desc: '배포' },
              ].map((tech) => (
                <div
                  key={tech.name}
                  className="p-3 rounded-lg border border-[var(--color-border)]"
                  style={{ backgroundColor: 'var(--color-bg-card)' }}
                >
                  <p className="text-sm font-medium">{tech.name}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{tech.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Notice */}
          <section
            className="rounded-xl p-6"
            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
          >
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-gold)' }}>
              유의사항
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              본 사이트는 공공데이터를 활용한 비영리 아카이브 프로젝트로,
              국가기록원과의 직접적인 관계는 없습니다. 모든 데이터 및 이미지의 저작권은
              국가기록원에 있습니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
