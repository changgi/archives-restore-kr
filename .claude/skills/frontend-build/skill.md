---
name: frontend-build
description: "Next.js 15 App Router + Tailwind CSS + Supabase 기반 프론트엔드 프로젝트 초기화, 페이지 라우팅, 데이터 페칭, SEO, 다국어(한/영) 지원을 구축하는 스킬. Next.js 프로젝트 설정, 페이지 생성, Supabase 클라이언트 통합, 타입 정의가 필요하면 반드시 이 스킬을 사용할 것."
---

# Frontend Build — Next.js 15 프로젝트 구축

## 기술 스택
- **Framework**: Next.js 15 (App Router, Server Components)
- **Styling**: Tailwind CSS 4 + CSS Variables (다크모드)
- **Database**: Supabase (JS client v2)
- **Animation**: Framer Motion 11
- **Language**: TypeScript 5 strict mode
- **Deployment**: Vercel

## Phase 1: 프로젝트 초기화

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --turbopack
```

### 필수 의존성
```bash
npm install @supabase/supabase-js framer-motion lucide-react
npm install -D @types/node
```

### 프로젝트 구조
```
src/
├── app/
│   ├── layout.tsx          # 루트 레이아웃 (다크모드, 폰트, 메타)
│   ├── page.tsx            # 홈 — 히어로 + 하이라이트 + 통계
│   ├── cases/
│   │   ├── page.tsx        # 복원 사례 목록 (필터/검색/그리드)
│   │   └── [id]/
│   │       └── page.tsx    # 개별 사례 상세 (Before/After 슬라이더)
│   ├── timeline/
│   │   └── page.tsx        # 연도별 타임라인 시각화
│   ├── gallery/
│   │   └── page.tsx        # 전체 갤러리 (Masonry + Lightbox)
│   ├── prevention/
│   │   └── page.tsx        # 훼손예방 사례
│   ├── about/
│   │   └── page.tsx        # 소개 페이지
│   └── api/
│       └── og/
│           └── route.tsx   # OG 이미지 동적 생성
├── components/             # ui-craftsman이 생성
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # 브라우저 클라이언트
│   │   ├── server.ts       # 서버 클라이언트
│   │   └── queries.ts      # 데이터 페칭 함수
│   └── utils.ts            # 유틸리티
├── hooks/                  # 커스텀 훅
├── types/
│   ├── database.ts         # Supabase 자동생성 타입
│   └── index.ts            # 앱 타입 정의
└── styles/
    └── globals.css          # Tailwind + CSS 변수
```

## Phase 2: Supabase 클라이언트 설정

### 환경변수 (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### 데이터 페칭 패턴
Server Component에서 직접 Supabase 쿼리:
```typescript
// src/lib/supabase/queries.ts
import { createClient } from './server'

export async function getRestorationCases(filters?: {
  category?: string
  year?: number
  orgId?: string
}) {
  const supabase = await createClient()
  let query = supabase
    .from('restoration_cases')
    .select('*, organizations(name), case_images(*)')
    .order('support_year', { ascending: false })

  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.year) query = query.eq('support_year', filters.year)
  if (filters?.orgId) query = query.eq('requesting_org_id', filters.orgId)

  const { data, error } = await query
  if (error) throw error
  return data
}
```

## Phase 3: 페이지 구현

### 홈페이지 (/)
- 풀스크린 히어로 (패럴랙스 배경)
- 주요 통계 카운터 (총 복원건수, 참여기관, 연도)
- 최근 복원 사례 3개 카드
- CTA → 전체 사례 보기

### 사례 목록 (/cases)
- 검색바 + 필터 (카테고리, 연도, 기관, 지원유형)
- 그리드/리스트 뷰 전환
- 무한스크롤 또는 페이지네이션
- URL 기반 필터 상태 (searchParams)

### 사례 상세 (/cases/[id])
- Before/After 이미지 비교 슬라이더
- 메타데이터 표시
- 관련 사례 추천
- 공유 버튼 + OG 이미지

### 타임라인 (/timeline)
- 2009~2025 연도별 인터랙티브 타임라인
- 가로 스크롤 + 세로 뷰 전환
- 연도 클릭 → 해당 연도 사례 필터

## Phase 4: SEO & 메타데이터

- 각 페이지에 `generateMetadata` 함수 정의
- 동적 OG 이미지 (사례별)
- `robots.txt`, `sitemap.xml` 자동 생성
- JSON-LD 구조화 데이터

## Phase 5: 성능 최적화

- `next/image`로 모든 이미지 최적화
- Server Component 기본, Client Component 최소화
- `Suspense` 경계로 스트리밍 SSR
- `dynamic(() => import(...))` 으로 무거운 컴포넌트 분리

## 산출물
- 완전한 Next.js 프로젝트 소스 코드
- `_workspace/02_frontend_routes.md` — 페이지 라우트 맵
