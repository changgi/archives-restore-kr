# 기록유산 복원 아카이브 — 구축서

**작성 목적** 프로젝트를 **처음부터 동일하게 재현**하거나, 다른 공공데이터에 **응용**하려는 개발자를 위한 상세 빌드 가이드.

---

## 0. Prerequisites

```bash
# 런타임
Node.js >= 20
npm / pnpm / bun
Git

# 데이터 파이프라인 (선택, 시딩 시만 필요)
Python 3.11+
ffmpeg
OpenAI Whisper (pip install openai-whisper)
Tesseract OCR 5.x (+ kor.traineddata)
Demucs (pip install demucs)  # 배경음 분리

# 서비스
Supabase 계정 (Free tier OK)
Vercel 계정 (Hobby tier OK)
GitHub 계정
```

---

## 1. Project Setup (15분)

```bash
# 1. Next.js 16 프로젝트 생성
npx create-next-app@latest project_restore \
  --typescript --tailwind --app --src-dir --no-eslint
cd project_restore

# 2. 핵심 의존성 추가
npm install @supabase/supabase-js lucide-react framer-motion
npm install @vercel/analytics @vercel/speed-insights

# 3. 환경변수 (.env.local)
cat > .env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key  # 서버 전용, 시딩용
EOF

# 4. 실행
npm run dev
```

---

## 2. Supabase 스키마 생성

Supabase Dashboard > SQL Editor 에서 실행:

```sql
-- 1. Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Restoration Cases
CREATE TABLE restoration_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('paper','audiovisual')),
  support_type TEXT,
  support_year INT,
  quantity TEXT,
  requesting_org_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Case Images (Before/After)
CREATE TABLE case_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES restoration_cases(id) ON DELETE CASCADE,
  image_type TEXT CHECK (image_type IN ('before','after')),
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT DEFAULT 0
);

-- 4. Featured Stories (기획전시)
CREATE TABLE featured_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  production_period TEXT,
  producing_org TEXT,
  before_image_url TEXT,
  after_image_url TEXT,
  video_url TEXT,
  external_link TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Story Items (소장품)
CREATE TABLE story_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES featured_stories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  year TEXT,
  repository TEXT,
  thumbnail_url TEXT,
  detail_link TEXT,
  sort_order INT DEFAULT 0
);

-- 6. Story Item Images
CREATE TABLE story_item_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_item_id UUID REFERENCES story_items(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT DEFAULT 0
);

-- 7. Original Documents (원문 문서)
CREATE TABLE original_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES featured_stories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source_url TEXT,
  sort_order INT DEFAULT 0
);

-- 8. Document Pages
CREATE TABLE document_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES original_documents(id) ON DELETE CASCADE,
  page_number INT NOT NULL,
  image_url TEXT NOT NULL
);

-- 9. Related Videos
CREATE TABLE related_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  hd_video_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INT,
  summary TEXT,
  key_points TEXT[]
);

-- 10. Video Frames
CREATE TABLE video_frames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES related_videos(id) ON DELETE CASCADE,
  timestamp_percent INT,
  frame_url TEXT,
  caption TEXT
);

-- 11. Video Transcripts
CREATE TABLE video_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES related_videos(id) ON DELETE CASCADE,
  start_seconds FLOAT NOT NULL,
  end_seconds FLOAT,
  text TEXT NOT NULL,
  source TEXT CHECK (source IN ('whisper','ocr','manual'))
);

-- RLS 정책 (public read)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON organizations FOR SELECT USING (true);

-- 모든 테이블에 반복:
-- ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "public read" ON ... FOR SELECT USING (true);
```

---

## 3. 데이터 수집 파이프라인

### 3.1 스크래핑 (Python)

```python
# scripts/scrape_cases.py
import httpx
from bs4 import BeautifulSoup
from supabase import create_client

SOURCE = "https://www.archives.go.kr/next/newmanager/archivesRestoreData.do"
sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def scrape_and_insert():
    html = httpx.get(SOURCE).text
    soup = BeautifulSoup(html, "html.parser")
    rows = soup.select("table.tbl_list tbody tr")
    for row in rows:
        title = row.select_one("td.title").text.strip()
        year  = int(row.select_one("td.year").text)
        # ... 나머지 필드
        sb.table("restoration_cases").insert({
            "title": title,
            "support_year": year,
            # ...
        }).execute()
```

### 3.2 이미지 다운로드 + 백업 (선택)

원본 사이트 폐쇄 대비:

```bash
# public/backup/ 에 전체 이미지 저장
node scripts/backup-images.js
# 그 후 Supabase Storage로 업로드:
node scripts/upload-to-supabase-storage.js
# image_config.ts 의 IMAGE_BASE_URL 교체
```

---

## 4. 영상 처리 파이프라인

### 4.1 480p 재인코딩 (Vercel CDN 호스트용)

```bash
# 원본 3.5GB → 49MB 수준 압축
for i in 1 2 3 4 5 6 7 8; do
  ffmpeg -i raw/video_${i}.mp4 \
    -vf "scale=-2:480" \
    -c:v libx264 -preset slow -crf 23 \
    -c:a aac -b:a 96k \
    -movflags +faststart \
    public/videos/video_${i}.mp4
done
```

### 4.2 썸네일 추출 (2초 프레임)

```bash
for i in 1 2 3 4 5 6 7 8; do
  ffmpeg -ss 2 -i public/videos/video_${i}.mp4 \
    -vframes 1 -q:v 2 \
    public/thumbnails/video_0${i}.jpg
done
```

### 4.3 타임라인 프레임 추출 (10/30/50/70/90%)

```bash
# Python 스크립트로 각 영상의 duration 계산 후 5개 지점 캡처
python scripts/extract_frames.py
```

### 4.4 AI 자막 생성

**Option A: Whisper (오디오에 내레이션 있을 때)**

```bash
whisper public/videos/video_1.mp4 \
  --language ko --model large-v3 \
  --condition_on_previous_text False \
  --output_format json
```

`condition_on_previous_text False` 는 Whisper 환각 현상(Hallucination) 방지에 핵심.

**Option B: Tesseract OCR (화면 자막만 있을 때)**

```bash
# 1. 3fps로 전체 프레임 캡처
ffmpeg -i video_5.mp4 -vf fps=3 frames/%04d.png

# 2. Tesseract로 한국어 OCR
for f in frames/*.png; do
  tesseract "$f" - -l kor+eng --psm 6 > "${f%.png}.txt"
done

# 3. Python 후처리: 중복 제거, 단편 제거, 클러스터링
python scripts/clean_ocr.py > transcripts/video_5.json
```

**후처리 핵심 (`clean_ocr.py`)**:
- 한글 한 글자 고아 제거 (`로 `, `스 ` 등)
- Latin 1-4자 파편 드롭
- `MIN_HANGUL_RATIO >= 0.6` 필터
- 연속 중복 제거
- 시간 클러스터링 (2초 간격)

### 4.5 배경음 분리 (선택, Whisper 품질 향상용)

```bash
demucs --two-stems=vocals public/videos/video_3.mp4
# → separated/htdemucs/video_3/vocals.wav
whisper separated/htdemucs/video_3/vocals.wav --language ko
```

### 4.6 Supabase 시딩

```bash
# 각 영상의 transcripts JSON을 video_transcripts 테이블에 insert
node scripts/insert_transcripts.mjs
```

---

## 5. 프론트엔드 구현 순서

### 5.1 M1: 기본 구조 (1일)

1. `src/lib/supabase.ts` — 클라이언트 팩토리
2. `src/lib/queries.ts` — `getAllCases`, `getCaseById`
3. `src/types/index.ts` — DB 타입 정의
4. `app/layout.tsx` — 루트 레이아웃 + 다크 테마
5. `app/page.tsx` — 홈 (케이스 리스트)
6. `app/cases/[id]/page.tsx` — 상세

### 5.2 M2: 박물관 디자인 언어 (2일)

1. `globals.css` — 골드 / 다크 / Pretendard 폰트 · focus-visible · reduced-motion
2. `components/NavigationBar.tsx` — 로고 + 7개 링크 + 테마 토글
3. `components/HeroSection.tsx` — 홈 히어로
4. 박물관 헤더 패턴을 모든 페이지에 적용

### 5.3 M3: Before/After 인터랙션 (1일)

1. `components/ImageCompareSlider.tsx` — clip-path 슬라이더
2. `components/RecordCard.tsx` — 카드 레이아웃
3. `components/StatsCounter.tsx` — rAF 카운트업
4. `app/cases/page.tsx` — 리스트 + 필터

### 5.4 M4: 스토리텔링 + 영상 (3일)

1. `components/ParallaxSection.tsx`
2. `components/ItemGallery.tsx` — 전시 소장품 모달
3. `components/ExhibitionNav.tsx` — 이전/다음
4. `app/stories/[slug]/StoryDetailClient.tsx` — 전체 섹션 구성
5. `components/VideoPlayer.tsx` — seek·HD 토글·버퍼링
6. `app/learn/LearnClient.tsx` — 사이드바 3탭 (Timeline/Transcript/Related)

### 5.5 M5: 타임라인 · 갤러리 (1일)

1. `components/TimelineView.tsx` — 비율 바 인디케이터
2. `components/GalleryGrid.tsx` + `GalleryTabs.tsx` — masonry + 탭
3. `app/timeline/page.tsx`, `app/gallery/page.tsx`

### 5.6 M6: 폴리싱 (지속)

- 검색/필터
- 로딩 상태 (`loading.tsx`)
- 에러 경계 (`error.tsx`)
- 404 페이지
- 브레드크럼브 + 이전/다음 케이스 내비
- 공유 버튼 + Web Share API fallback
- 키보드 단축키 `/` `?` `g+X`
- next/image 마이그레이션 (컴포넌트별 점진적)

### 5.7 M7: 인프라 (1일)

- `manifest.ts`, `icon.tsx`, `apple-icon.tsx` — PWA
- `opengraph-image.tsx` — 브랜드 OG (next/og)
- `sitemap.ts`, `robots.ts` — SEO
- `JsonLd` 컴포넌트 + WebSite/CreativeWork/ExhibitionEvent/BreadcrumbList
- `next.config.ts` headers() — 보안 헤더
- `@vercel/analytics`, `@vercel/speed-insights`
- Preconnect/DNS-prefetch

---

## 6. Deployment (Vercel)

### 6.1 최초 배포

```bash
# 1. GitHub에 푸시
git init && git add -A && git commit -m "initial"
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin master

# 2. Vercel 연결
npx vercel
# → 프로젝트 연결 후 환경변수 3개 입력
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY

# 3. 프로덕션 배포
npx vercel --prod
```

### 6.2 next.config.ts — 필수 설정

```ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.archives.go.kr', pathname: '/next/images/**' },
      { protocol: 'https', hostname: 'YOUR_PROJECT.supabase.co', pathname: '/storage/**' },
    ],
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
      ],
    }]
  },
}
```

### 6.3 배포 체크리스트

- [ ] 모든 데이터-페이지에 `export const dynamic = 'force-dynamic'`
- [ ] 환경변수 3개 Vercel 프로젝트에 등록
- [ ] `next.config.ts` `remotePatterns` 이미지 호스트 허용
- [ ] `robots.ts`, `sitemap.ts` 의 baseUrl 프로덕션 URL로 설정
- [ ] `layout.tsx` `metadataBase` 설정
- [ ] OG 이미지 `opengraph-image.tsx` Satori 호환 (다자식 `div` 는 `display: flex` 필수)

---

## 7. Monitoring & Maintenance

### 7.1 실시간 모니터링

| 도구 | 위치 |
|---|---|
| Real user analytics | Vercel Dashboard → Analytics |
| Web Vitals | Vercel Dashboard → Speed Insights |
| Runtime logs | Vercel Dashboard → Logs |
| Build logs | Vercel Dashboard → Deployments |

### 7.2 데이터 갱신 루틴

```bash
# 월 1회: 새 복원 사례 확인
python scripts/scrape_cases.py --since 2026-01-01 --dry-run
python scripts/scrape_cases.py --since 2026-01-01 --apply

# Supabase에 반영되면 프로덕션이 force-dynamic 이므로 즉시 반영
```

### 7.3 백업

- **DB**: Supabase 자체 자동 백업 (Free tier 7일)
- **이미지**: 옵션으로 Supabase Storage 또는 S3 미러
- **코드**: GitHub

---

## 8. Troubleshooting

| 증상 | 원인 | 해결 |
|---|---|---|
| Vercel 빌드 실패: "impure function during render" | React 19 lint 규칙 | `react-hooks/purity` 의 경우 `Date.now()` 읽기는 effect 내부로 이동 또는 disable |
| 빌드 실패: Satori `display: flex` | `opengraph-image.tsx` | 다중 자식 `<div>` 모두 `display:'flex'` 추가 |
| 404 on /_next/image | remotePatterns 누락 | `next.config.ts` 에 호스트 추가 |
| 이미지가 깨짐 (gray) | Supabase CORS | Supabase Storage 버킷을 public 으로 |
| 영상 재생이 frozen | 미버퍼 범위 시킹 | `VideoPlayer` 의 `pendingSeekRef` + `onCanPlay` 핸들러 확인 |
| OG 이미지가 블랭크 | next/og 에서 지원 안 되는 CSS | flex + 명시적 width/height, background-image 주의 |
| Whisper 환각 ("이 영상은 유료 광고...") | BGM만 있는 구간 | `condition_on_previous_text False` + Tesseract OCR로 fallback |
| Tesseract 파편 ("로 ", "스 ") | 단일 글자 고아 | 후처리 `MIN_HANGUL_RATIO 0.6` + 단일 글자 필터 |

---

## 9. Cost Estimate (Free Tier 기준)

| 서비스 | 사용 | 비용 |
|---|---|---|
| Vercel Hobby | 배포 · Edge · Image Opt · Analytics | $0 |
| Supabase Free | Postgres 500MB · Storage 1GB · 2GB 대역폭 | $0 |
| GitHub | 코드 호스팅 | $0 |
| Domain | vercel.app 서브도메인 | $0 |
| 커스텀 도메인 | (선택) | $10~15/년 |
| **Total** | | **$0-15/year** |

---

## 10. Remixing for Other Public Datasets

이 프로젝트를 다른 공공데이터에 적용할 때 교체할 것:

1. **스키마** (`docs/BUILD.md §2`) — 도메인에 맞게 테이블 재정의
2. **쿼리** (`src/lib/queries.ts`) — 새 모델에 맞게 함수 교체
3. **타입** (`src/types/index.ts`)
4. **페이지 구조** (`app/cases`, `app/stories` 등) — 네이밍과 필드
5. **브랜드** — 색상 (globals.css `--color-gold`), 로고 (NavigationBar `Archive` 아이콘 + "Archives KR"), OG 이미지 (`opengraph-image.tsx`)
6. **콘텐츠 카피** (한글 문구)
7. **메타데이터** — 설명, OG, manifest

박물관 헤더 패턴, 필터 UI, 타임라인, 갤러리, 공유, 접근성 레이어는 대부분 **그대로 재사용** 가능합니다.

---

**Happy restoring!** 🏛✨
