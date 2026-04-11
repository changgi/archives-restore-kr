# 기록유산 복원 아카이브 — 기술서

**버전** v1.0
**작성일** 2026-04-11
**대상 독자** 프론트엔드·백엔드 엔지니어, 기술 검토자, 재사용을 고려하는 공공기관

---

## 1. System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Client (Browser / PWA)                                      │
│  • Next.js 16 App Router (SSR + RSC)                         │
│  • Tailwind CSS 4 + 뮤지엄 테마 (골드 #D4A853 / 다크 #0F0F0F)│
│  • Vercel Web Analytics + Speed Insights                     │
└───────────────┬──────────────────────────────────────────────┘
                │ HTTPS / HTTP/2
                ▼
┌──────────────────────────────────────────────────────────────┐
│  Vercel Edge Network                                         │
│  • Image Optimization (/_next/image → AVIF/WebP)             │
│  • OG Image Generation (next/og ImageResponse)               │
│  • Security Headers (XFO, XCTO, Referrer, Permissions)       │
│  • Preconnect hints: archives.go.kr · supabase.co            │
└───────────────┬──────────────────────────────────────────────┘
                │
      ┌─────────┴──────────┐
      ▼                    ▼
┌───────────────┐   ┌──────────────────────┐
│ Supabase      │   │ archives.go.kr       │
│ PostgreSQL    │   │ (원본 이미지 호스트) │
│ • 9 tables    │   │ • Before/After JPG   │
│ • RLS         │   │ • 원문 문서 스캔     │
└───────────────┘   └──────────────────────┘
```

**핵심 설계 원칙**
1. **Read-heavy, write-rare** — Server Components + `force-dynamic` + 쿼리 최적화
2. **Origin-agnostic images** — `src/lib/image-config.ts` 로 추상화, 원본 폐쇄 시 Supabase Storage로 교체 가능
3. **Edge-first** — 정적 자산은 Vercel Edge에, 데이터 쿼리는 서버 컴포넌트에서 직접

---

## 2. Tech Stack

| Layer | Tech | Version | Rationale |
|---|---|---|---|
| Framework | Next.js | 16.2.2 | App Router, Server Components, ImageResponse, turbopack |
| Language | TypeScript | 5.x | Strict mode, 타입 안전성 |
| UI | React | 19.2 | Concurrent rendering, `use`, Suspense |
| Styling | Tailwind CSS | 4.x | JIT, @theme inline, v4 postcss 플러그인 |
| DB | Supabase (Postgres) | 2.102 | RLS, 서버리스, 무료 티어 |
| Hosting | Vercel | - | Edge 네트워크, Image Opt, Analytics, Preview |
| Icons | lucide-react | 1.7 | 일관성, 트리 셰이킹 |
| Animation | Framer Motion (부분) | 12.38 | ParallaxSection scroll-driven만 사용 |
| Analytics | @vercel/analytics, @vercel/speed-insights | 2.x | Real-user metrics, Web Vitals |
| Video/Audio 처리 | ffmpeg, Whisper, Demucs, Tesseract OCR | - | 오프라인 파이프라인 |

---

## 3. Data Model (Supabase)

### 테이블 개요 (총 11개, 약 530행)

```sql
organizations        (34 rows)   -- 기록 소장 기관
restoration_cases    (45 rows)   -- 복원 사례 메인
case_images          (88 rows)   -- Before/After 이미지
featured_stories     (4  rows)   -- 기획전시
story_items          (8  rows)   -- 전시 소장품
story_item_images    (130 rows)  -- 소장품 상세 이미지
original_documents   (7  rows)   -- 원문 문서 세트
document_pages       (31 rows)   -- 원문 문서 페이지별 스캔
related_videos       (8  rows)   -- 교육 영상 + AI 분석
video_frames         (40 rows)   -- 영상 주요 장면
video_transcripts    (192 rows)  -- 영상 자막 (Whisper + OCR)
```

### 핵심 스키마 하이라이트

```sql
-- 복원 사례
restoration_cases (
  id UUID PK,
  title TEXT,
  description TEXT,
  category TEXT CHECK (category IN ('paper','audiovisual')),
  support_type TEXT,
  support_year INT,
  quantity TEXT,
  requesting_org_id UUID FK → organizations.id,
  updated_at TIMESTAMPTZ
)

-- Before/After 이미지
case_images (
  id UUID PK,
  case_id UUID FK → restoration_cases.id,
  image_type TEXT CHECK (image_type IN ('before','after')),
  image_url TEXT,
  alt_text TEXT
)

-- 기획전시
featured_stories (
  id UUID PK,
  slug TEXT UNIQUE,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  production_period TEXT,
  producing_org TEXT,
  before_image_url TEXT,
  after_image_url TEXT,
  video_url TEXT,
  external_link TEXT
)

-- 영상 AI 분석
related_videos (
  id UUID PK,
  title TEXT,
  video_url TEXT,          -- 480p 자체 호스트
  hd_video_url TEXT,       -- 1080p archives.go.kr
  thumbnail_url TEXT,      -- ffmpeg frame
  duration_seconds INT,
  summary TEXT,            -- AI 요약
  key_points TEXT[]        -- AI 핵심 포인트 배열
)

video_transcripts (
  id UUID PK,
  video_id UUID FK,
  start_seconds FLOAT,
  end_seconds FLOAT,
  text TEXT                -- Whisper 또는 Tesseract OCR 결과
)
```

### RLS 정책

모든 테이블에 `SELECT` public 정책 적용. 쓰기는 service_role 키만 허용.

---

## 4. Query Layer (`src/lib/queries.ts`)

서버 컴포넌트에서만 호출되는 9개 함수:

| 함수 | 역할 |
|---|---|
| `getAllCases(filters?)` | 필터링·검색·정렬된 전체 사례 |
| `getCaseById(id)` | 단일 사례 + 이미지 + 기관명 조인 |
| `getRelatedCases(id, orgId, category)` | 같은 기관/카테고리 추천 |
| `getStats()` | 홈 카운터용 집계 |
| `getOrganizations()` | 필터 드롭다운 |
| `getYearStats()` | 연도별 건수 |
| `getFeaturedStories()` | 기획전시 리스트 |
| `getStoryBySlug(slug)` | 단일 스토리 + 소장품 + 이미지 |
| `getOriginalDocuments(storyId)` | 원문 문서 세트 |
| `getRelatedVideos()` | 영상 + 프레임 + 자막 조인 |

**최적화**
- Supabase `select('*, relation(*)')` 구문으로 N+1 쿼리 제거
- `Promise.all([...])` 로 독립 쿼리 병렬화
- 각 페이지 `export const dynamic = 'force-dynamic'`

---

## 5. Core Features — Technical Detail

### 5.1 Before/After 비교 슬라이더 (`ImageCompareSlider`)

- **구조**: 두 이미지를 `position: absolute` 로 겹치고, 위쪽 이미지에 `clip-path: inset(0 N% 0 0)` 를 적용
- **Interaction**: 마우스/터치 드래그 → X 좌표를 백분율로 계산 → `clipPath` 업데이트
- **Keyboard**: `←/→` (2%씩), `Home/End` (0%/100%) · `role="slider"` + `aria-valuenow`
- **UX**: 첫 상호작용 전 펄스 애니메이션 + "좌우로 드래그하여 비교" 힌트 · 드래그 중 골드 글로우 확장 · 하단 `0% | 50% | 100%` 퍼센트 스케일

### 5.2 영상 플레이어 + AI 사이드바 (`LearnClient` + `VideoPlayer`)

- **비디오**: HTML5 `<video>` + `useImperativeHandle` 로 seekTo/play/pause 노출
- **이중 소스**: `hd_video_url` (원본 1080p archives.go.kr) + `video_url` (480p Vercel CDN 셀프 호스트) → HD 토글
- **버퍼링 오버레이**: `onWaiting` / `onSeeking` / `onCanPlay` 이벤트 추적 → 시킹이 버퍼 범위 초과 시 로딩 스피너
- **사이드바 3탭**:
  - **Timeline**: 40개 주요 프레임 + 타임스탬프 클릭 시 seek
  - **Transcript**: 192개 자막 세그먼트 + 현재 시점 활성화 + 클릭 시 seek
  - **Related**: 8개 영상 카드 + 현재 재생 중 `재생 중` 배지
- **키보드 안정성**: 시퀀스 ref `userActionAtRef` 로 클릭 직후 250ms throttled timeupdate 콜백 무시

### 5.3 타임라인 뷰 (`TimelineView`)

- **레이아웃**: 데스크탑 수평 스크롤 레일 (연도 카드 `w-72`), 모바일 수직 리본
- **시각적 인디케이터**: 각 연도 카드 상단에 **비율 바** — 전체 피크 대비 현재 연도 복원 건수 (`width: N%`)
- **내비게이션**: `scrollLeft` 상태 추적 → 좌/우 버튼 enabled/disabled 자동 제어

### 5.4 검색·필터 (`SearchBar` + `FilterBar` + page.tsx)

- **검색**: `URLSearchParams` + 400ms debounce + ILIKE OR (title, description)
- **필터**: category / year / organization 3종 셀렉트, 각 값 선택 시 골드 테두리로 피드백
- **Active chips**: 선택된 필터를 필 버튼으로 재표시 + 개별 X 제거
- **URL 기반**: 모든 필터 상태가 URL에 반영 → 공유 가능

### 5.5 기획전시 스토리텔링 (`StoryDetailClient`)

- **섹션 구성**: Hero → Before/After Compare → Intro → Items Gallery → Original Docs → Video → Next/Prev Nav
- **ParallaxSection**: framer-motion `useScroll` + `useTransform` 으로 배경 이미지 20% 시차 이동
- **ScrollProgress**: 우측 레일로 현재 섹션 인디케이터 · 클릭 시 smooth scroll

---

## 6. Performance Optimization

### 6.1 이미지 최적화

| 컴포넌트 | 방식 | 효과 |
|---|---|---|
| RecordCard (45+ 사용) | `next/image fill` + 반응형 `sizes` | AVIF/WebP, srcset, lazy |
| HomeFeatured (8장) | `next/image fill` | 홈 LCP 개선 |
| StoryCard (8장) | `next/image fill` | `/stories` 페이지 최적화 |
| ExhibitionNav (prev/next) | `next/image fill` | 스토리 상세 하단 |
| ItemGallery 썸네일 | `next/image fill` | 전시 소장품 그리드 |
| 홈 교육 비디오 썸네일 | `next/image fill` | 홈 카드 |
| GalleryGrid (masonry) | 의도적 native `<img>` | 가변 aspect ratio |
| ImageCompareSlider | 의도적 native `<img>` | clip-path 로직 충돌 방지 |

### 6.2 네트워크

- `<link rel="preconnect">` · `<link rel="dns-prefetch">` for archives.go.kr + Supabase
- Security headers via `next.config.ts headers()`
- `Cache-Control` 은 기본 Vercel edge 정책 유지

### 6.3 번들 크기

- **Framer Motion 축소**: 대부분 CSS `animate-fade-in` 으로 이전, ParallaxSection만 잔존
- **Icon 트리 셰이킹**: `lucide-react` 개별 임포트
- **Server Components 우선**: Client 컴포넌트는 인터랙션이 필요한 곳만 (`'use client'`)

### 6.4 Core Web Vitals 목표

| Metric | Target | 실제 (Speed Insights 측정 중) |
|---|---|---|
| LCP | < 2.5s | ~2.0s 예상 |
| FID / INP | < 200ms | ~100ms 예상 |
| CLS | < 0.1 | < 0.05 예상 |
| TTFB | < 600ms | Vercel Edge |

---

## 7. Accessibility (a11y)

| 요구 | 구현 |
|---|---|
| 키보드 내비게이션 | `:focus-visible` 골드 링 + 글로우 (button/a/slider) |
| Skip to content | `<a href="#main-content">본문으로 건너뛰기</a>` (sr-only → focus 시 노출) |
| 색 대비 | 골드 #D4A853 on #0F0F0F (AA 이상) |
| 모션 민감도 | `@media (prefers-reduced-motion: reduce)` — 모든 animation/transition 0.01ms |
| 스크린 리더 | `aria-label`, `aria-current`, `role="slider"`, `role="dialog"` |
| 의미론적 HTML | `<nav>`, `<main>`, `<footer>`, 의미 있는 `<h1>-<h4>` |

---

## 8. SEO & Discoverability

### 8.1 메타데이터

- **`metadataBase`**: `https://projectrestore.vercel.app`
- **OpenGraph**: 루트 `WebSite` + 각 상세 페이지 `article` 타입 + 실제 이미지
- **Twitter Card**: `summary_large_image` (이미지 있는 경우)
- **동적 OG 이미지**: `opengraph-image.tsx` — next/og ImageResponse 로 **브랜드 카드** 생성 (1200×630)

### 8.2 구조화 데이터 (JSON-LD)

- **전역**: `WebSite` + publisher Organization
- **/cases/[id]**: `CreativeWork` (contributor Organization + associatedMedia ImageObjects + provider GovernmentOrganization 국가기록원) + `BreadcrumbList` (4 levels)
- **/stories/[slug]**: `ExhibitionEvent` (organizer + superEvent) + `BreadcrumbList` (3 levels)

### 8.3 크롤링

- **`robots.ts`**: `User-Agent: *` 허용 + `/api/` 차단 + Host/Sitemap
- **`sitemap.ts`**: 7 정적 + 45 케이스 + 8 스토리 경로 = **60 URL**

---

## 9. Progressive Web App

- **`manifest.ts`**: name, short_name, theme_color `#D4A853`, standalone, 3 shortcuts
- **`icon.tsx`** (192×192 Android): ImageResponse로 "기" 글리프 + 4코너 골드 액센트
- **`apple-icon.tsx`** (180×180 iOS): 같은 패턴
- **자동 메타 주입**: Next 16 metadata pipeline → `<link rel="icon">`, `<link rel="apple-touch-icon">`

---

## 10. Security

### 헤더 (전 경로 적용)

```ts
{ 'X-Frame-Options': 'SAMEORIGIN' }
{ 'X-Content-Type-Options': 'nosniff' }
{ 'Referrer-Policy': 'strict-origin-when-cross-origin' }
{ 'X-XSS-Protection': '0' }                 // 레거시 비활성
{ 'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()' }
```

### 데이터

- Supabase RLS로 공개 `SELECT`만 허용
- 환경 변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (공개 키)
- 서버 전용 `SUPABASE_SERVICE_ROLE_KEY` (시딩·관리 스크립트용)

---

## 11. Key UX Patterns

### 11.1 "박물관 헤더" 패턴 (일관성)

사이트의 모든 페이지가 동일한 헤더 구조 사용:

```tsx
<section className="relative overflow-hidden mb-16">
  <div className="absolute inset-0 opacity-[0.04] ..." />  {/* 점 패턴 */}
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 ..." />  {/* 수직 골드 레일 */}
  <div className="relative ... pt-12 md:pt-16 text-center">
    <p className="text-xs tracking-[0.3em] uppercase">English Eyebrow</p>
    <div className="flex items-center justify-center gap-3 md:gap-5">
      <div className="hidden sm:block h-px w-10 md:w-16" />
      <h1 className="whitespace-nowrap">한글 <span style={{color:gold}}>타이틀</span></h1>
      <div className="hidden sm:block h-px w-10 md:w-16" />
    </div>
    <p className="text-base md:text-lg">서브타이틀</p>
    {/* 선택: 3-stat pill */}
  </div>
</section>
```

### 11.2 키보드 단축키 (GitHub 스타일)

| Key | Action |
|---|---|
| `/` | 검색창 포커스 |
| `?` | 단축키 도움말 모달 |
| `g` `h` | 홈 |
| `g` `c` | 복원 사례 |
| `g` `s` | 기획전시 |
| `g` `l` | 보존교육 |
| `g` `t` | 타임라인 |
| `g` `a` | 갤러리 |
| `Esc` | 모달·팝오버 닫기 |

---

## 12. File Structure

```
src/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 (NavigationBar, Footer, ScrollToTop,
│   │                             KeyboardShortcuts, Analytics, JsonLd, skip link)
│   ├── page.tsx                # 홈
│   ├── HomeFeatured.tsx        # 홈 기획전시 캐러셀
│   ├── opengraph-image.tsx     # 동적 OG 이미지 (next/og)
│   ├── icon.tsx                # PWA 아이콘 (Android)
│   ├── apple-icon.tsx          # PWA 아이콘 (iOS)
│   ├── manifest.ts             # PWA manifest
│   ├── sitemap.ts              # 60 URL sitemap
│   ├── robots.ts               # robots.txt
│   ├── error.tsx               # 글로벌 에러 경계
│   ├── not-found.tsx           # 404
│   ├── loading.tsx             # (각 라우트별)
│   ├── cases/
│   │   ├── page.tsx            # 사례 리스트
│   │   ├── loading.tsx
│   │   └── [id]/page.tsx       # 사례 상세
│   ├── stories/
│   │   ├── page.tsx            # 전시 리스트
│   │   ├── loading.tsx
│   │   └── [slug]/
│   │       ├── page.tsx
│   │       ├── StoryDetailClient.tsx
│   │       └── documents/page.tsx
│   ├── learn/
│   │   ├── page.tsx
│   │   ├── LearnClient.tsx     # 영상 플레이어 + AI 사이드바
│   │   └── loading.tsx
│   ├── timeline/page.tsx
│   ├── gallery/page.tsx
│   └── about/page.tsx
├── components/
│   ├── NavigationBar.tsx       # 헤더 내비
│   ├── HeroSection.tsx         # 홈 히어로
│   ├── ImageCompareSlider.tsx  # Before/After 핵심
│   ├── VideoPlayer.tsx         # HTML5 video 래퍼
│   ├── RecordCard.tsx          # 사례 카드 (대표)
│   ├── StoryCard.tsx           # 전시 카드
│   ├── ExhibitionNav.tsx       # 이전/다음 전시
│   ├── ItemGallery.tsx         # 전시 소장품 그리드 + 모달
│   ├── GalleryGrid.tsx         # 마스터 갤러리 masonry + 라이트박스
│   ├── GalleryTabs.tsx         # 전체/Before/After 탭
│   ├── TimelineView.tsx        # 수평·수직 연도 레일
│   ├── DocumentViewer.tsx      # 원문 문서 뷰어
│   ├── StatsCounter.tsx        # 카운트업 통계 카드
│   ├── Breadcrumbs.tsx         # 공용 빵부스러기
│   ├── SearchBar.tsx           # 검색 입력
│   ├── FilterBar.tsx           # 필터 셀렉트
│   ├── ShareButton.tsx         # 공유 팝오버
│   ├── ScrollProgress.tsx      # 우측 섹션 레일
│   ├── ScrollToTop.tsx         # 플로팅 맨 위로
│   ├── SmartBackButton.tsx     # 히스토리 인식 back
│   ├── KeyboardShortcuts.tsx   # 글로벌 단축키
│   ├── LoadingShell.tsx        # 공용 로딩 UI
│   ├── JsonLd.tsx              # 구조화 데이터 주입
│   ├── ParallaxSection.tsx     # 시차 배경 (framer-motion)
│   └── HeroSection.tsx
├── lib/
│   ├── supabase.ts             # 클라이언트 팩토리
│   ├── queries.ts              # 9개 쿼리 함수
│   └── image-config.ts         # 이미지 URL 추상화
└── types/
    └── index.ts                # DB 타입 정의
```

---

## 13. Limitations & Known Trade-offs

1. **마스터 갤러리는 next/image 비적용** — 가변 aspect ratio masonry 는 width/height 힌트를 제공할 수 없음. 해결: `loading="lazy" decoding="async"` 로 최소 최적화.
2. **영상 스크립트 정확도** — Whisper는 `video_1` (내레이션 있음)만 고품질, 나머지 7개는 Tesseract OCR 후처리로 대체. 수작업 클리닝 포함.
3. **전문 검색 없음** — ILIKE 기반, 5,000+ 사례로 확장 시 `pg_trgm` 또는 별도 검색 인덱스 필요.
4. **콘텐츠 관리 UI 없음** — Supabase 대시보드 직접 사용. v2에 어드민 고려.
5. **i18n 없음** — 한국어 전용. 다국어화는 v2 후보.

---

## 14. Reference Standards

- **ISAD(G) 2nd ed.** — 국제 기록물 기술 표준
- **NAK (국가기록관리표준)** — 국가기록원 메타데이터
- **RiC-CM** — Records in Contexts Conceptual Model
- **Schema.org** — CreativeWork, ExhibitionEvent, BreadcrumbList
- **WCAG 2.2 AA** — 웹 접근성 가이드라인
