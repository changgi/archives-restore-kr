import HeroSection from '@/components/HeroSection'
import StatsCounter from '@/components/StatsCounter'
import RecordCard from '@/components/RecordCard'
import HomeSectionHeader from '@/components/HomeSectionHeader'
import HomeJourneyCTA from '@/components/HomeJourneyCTA'
import { HomeMobileSeeAll } from '@/components/HomeEducationMore'
import { getAllCases, getStats, getFeaturedStories, getRelatedVideos } from '@/lib/queries'
import Link from 'next/link'
import Image from 'next/image'
import HomeFeatured from './HomeFeatured'
import { Play, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [cases, stats, stories, videos] = await Promise.all([
    getAllCases(),
    getStats(),
    getFeaturedStories(),
    getRelatedVideos(),
  ])
  const recentCases = cases.slice(0, 3)
  const previewVideos = videos.slice(0, 3)

  return (
    <>
      <HeroSection />

      <StatsCounter
        totalCases={stats.totalCases}
        totalOrgs={stats.totalOrganizations}
        yearRange={stats.yearRange}
      />

      {/* Featured Stories */}
      {stories.length > 0 && (
        <section
          className="relative py-16 md:py-24 overflow-hidden"
          style={{ backgroundColor: 'var(--color-bg-secondary)' }}
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
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <HomeSectionHeader variant="featuredExhibitions" href="/stories" />
            <HomeFeatured stories={stories} />
            <HomeMobileSeeAll href="/stories" />
          </div>
        </section>
      )}

      {/* Recent cases section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HomeSectionHeader variant="recentCases" href="/cases" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCases.map((c, i) => (
              <RecordCard key={c.id} record={c} index={i} />
            ))}
          </div>

          <HomeMobileSeeAll href="/cases" />
        </div>
      </section>

      {/* Education Videos */}
      {previewVideos.length > 0 && (
        <section
          className="relative py-16 md:py-24 overflow-hidden"
          style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <HomeSectionHeader variant="conservationEducation" href="/learn" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {previewVideos.map((v) => (
                <Link
                  key={v.id}
                  href="/learn"
                  className="group rounded-xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-gold)]/50 transition-all duration-500"
                  style={{ backgroundColor: 'var(--color-bg-card)' }}
                >
                  <div className="relative aspect-video overflow-hidden">
                    {v.thumbnail_url ? (
                      <Image
                        src={v.thumbnail_url}
                        alt={v.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--color-gold)]/20 to-[var(--color-bg)] flex items-center justify-center">
                        <Play size={32} className="text-[var(--color-gold)]/50" />
                      </div>
                    )}
                    {/* Play overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center border-2 backdrop-blur-sm"
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          borderColor: 'var(--color-gold)',
                        }}
                      >
                        <Play
                          size={22}
                          className="ml-0.5"
                          style={{ color: 'var(--color-gold)' }}
                          fill="currentColor"
                        />
                      </div>
                    </div>
                    {/* Duration badge */}
                    {v.duration_seconds && (
                      <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/80 backdrop-blur-sm flex items-center gap-1">
                        <Clock size={10} className="text-white/80" />
                        <span className="text-[10px] text-white font-medium">
                          {Math.floor(v.duration_seconds / 60)}:
                          {(v.duration_seconds % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold line-clamp-2 group-hover:text-[var(--color-gold)] transition-colors">
                      {v.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
            <HomeMobileSeeAll href="/learn" />
          </div>
        </section>
      )}

      <HomeJourneyCTA
        minYear={stats.yearRange.min}
        maxYear={stats.yearRange.max}
        totalCases={stats.totalCases}
      />
    </>
  )
}
