# 기록유산 복원 아카이브 — 프로젝트 계획서

**Project Name** 기록유산 복원 아카이브 (Archives Restoration Korea)
**Live URL** https://projectrestore.vercel.app
**Repository** https://github.com/changgi/archives-restore-kr
**Status** ✅ Production · v1.0
**Last updated** 2026-04-11

---

## 1. Executive Summary

국가기록원이 공개하는 기록물 복원 사업 데이터를 **대화형 디지털 아카이브**로 재해석하는 오픈소스 프로젝트입니다. 원본 사이트의 정적 테이블에 묻혀 있던 45건의 복원 사례, 4개의 기획전시, 8편의 보존교육 영상, 88장의 Before/After 이미지를 **박물관급 UX**로 재구성했습니다.

> 시간이 훼손한 기록을, 기술로 되살립니다.

- **대상** 역사·기록학 관심 일반인, 대학생·연구자, 기록관리 전공자, 정부·공공기관
- **차별점** Before/After 슬라이더, AI 분석 영상 자막·요약, 기획전시 스토리텔링, 타임라인 시각화
- **기술 기반** Next.js 16 · Supabase · Vercel · TypeScript 5 · Tailwind CSS 4

---

## 2. Problem Statement

### 기존 국가기록원 복원 데이터의 한계

| 문제 | 영향 |
|---|---|
| 정적 테이블 기반 리스트 UI | 사용자가 한눈에 전·후를 비교할 수 없음 |
| 이미지 열람이 복잡한 별도 팝업 | 복원 가치의 시각적 임팩트 상실 |
| 교육 영상에 자막·스크립트 없음 | 청각장애인 접근성 부재, 검색 불가 |
| 연도·기관별 필터 부재 | 특정 시기/주제 탐색 난이도 높음 |
| 모바일 대응 미흡 | 젊은층 유입 장벽 |
| 공유 시 프리뷰 카드 없음 | SNS 바이럴 불가 |

### 해결 방향

> 공공데이터의 **원본성·신뢰성**을 유지하면서, 현대적 UX와 오픈소스 기술로 **재방문·재공유 가능한 자산**으로 변환한다.

---

## 3. Goals & KPIs

### 정성 목표 (North Star)

1. **"복원의 가치"를 감각적으로 전달한다** — 숫자가 아닌 이미지와 이야기로.
2. **원본 사이트의 우회로가 아니라 증폭기(amplifier) 가 된다** — 항상 원본 링크를 노출.
3. **기록관리 표준(ISAD(G), NAK)을 해치지 않는 선에서 재해석한다** — 메타데이터의 충실성 유지.

### 정량 지표 (첫 6개월)

| KPI | Target |
|---|---|
| GitHub stars | **10,000** |
| 프로덕션 트래픽 (MAU) | 20,000+ |
| Core Web Vitals LCP | **< 2.5s** (Good) |
| Core Web Vitals CLS | **< 0.1** (Good) |
| Lighthouse 접근성 | **≥ 95** |
| 평균 체류시간 | ≥ 2분 |
| 소셜 공유 건수 | 월 500+ |
| 검색엔진 노출 (sitemap) | 60+ URL 색인 |

---

## 4. Target Users (Personas)

### 🎓 P1. 대학원생·연구자 (30%)
"논문 자료 수집 중 복원 전후 사진과 메타데이터가 필요하다."
- 니즈: 원본 출처 링크, 메타데이터 정확성, 검색 필터, 인용 가능성
- UX: 브레드크럼브 · 정밀 필터 · 외부 링크 · 고해상도 이미지 뷰어

### 📱 P2. 역사 관심 일반인 (50%)
"인스타에서 공유된 링크로 들어와 '와, 이렇게 복원됐네' 하고 놀라고 싶다."
- 니즈: 즉각적 시각 충격, 짧은 체류시간에도 감동, 공유하기 쉬움
- UX: Before/After 슬라이더 · 큰 이미지 · Share 버튼 · 브랜드 OG 카드

### 🏛 P3. 기록관리 전공생 (15%)
"실제 복원 사례와 국제표준 간 매핑을 배우고 싶다."
- 니즈: 분류 체계 (종이류/시청각), 지원 유형별 분류, 기관별 정리
- UX: 카테고리 필터 · 통계 카운터 · 타임라인

### 🏢 P4. 정부·공공기관 (5%)
"우리 기관의 공공데이터도 이렇게 시각화할 수 있을까?"
- 니즈: 오픈소스 구조, 재활용 가능성, 비용 구조
- UX: GitHub 레포 링크 · 기술 문서 · 라이선스

---

## 5. Scope

### 5.1 In Scope — v1.0 (Shipped ✅)

**콘텐츠 레이어**
- [x] 45건 복원 사례 (종이류 39 + 시청각 6)
- [x] 4개 기획전시 (8개 소장품 + 130장 상세 이미지)
- [x] 8편 보존교육 영상 (~45분) + AI 분석 요약·자막
- [x] 88장 Before/After 이미지
- [x] 7건 원문 문서 뷰어 + 31장 고해상도 스캔

**사용자 경험**
- [x] Before/After 드래그 슬라이더 (키보드·터치 지원)
- [x] 기획전시 스크롤 기반 스토리텔링
- [x] 타임라인 뷰 (연도별 카드 + 비율 인디케이터)
- [x] 마스터 갤러리 (전체/Before/After 탭 + 라이트박스)
- [x] 복원 사례 검색·필터 (카테고리·연도·기관)
- [x] 관련 사례 자동 추천
- [x] 영상 플레이어 (HD/480p 토글 · AI 자막 · 관련 영상 사이드바)

**엔지니어링**
- [x] 모든 주요 이미지 next/image 최적화 (AVIF/WebP)
- [x] 점진적 로딩 (loading.tsx × 5 라우트)
- [x] 에러 경계 (error.tsx)
- [x] 404 페이지
- [x] 동적 OG 이미지 생성 (next/og)
- [x] PWA 매니페스트 + 아이콘 (Android·iOS)
- [x] JSON-LD 구조화 데이터 (CreativeWork / ExhibitionEvent / BreadcrumbList / WebSite)
- [x] 접근성: 포커스 링 · skip-to-content · prefers-reduced-motion
- [x] 키보드 단축키 (`/`, `?`, `g+h/c/s/l/t/a`)
- [x] Vercel Analytics + Speed Insights
- [x] 보안 헤더 (X-Frame-Options, CSP 준비, Permissions-Policy)

### 5.2 Out of Scope (v1.0에서 제외)

- 사용자 계정·즐겨찾기·댓글
- 서버 관리자 페이지 (콘텐츠는 Supabase 직접 관리)
- 결제·기부
- 영어·일본어 번역 (v2 후보)
- 전문(全文) 검색 엔진 (현재는 title + description ILIKE)

---

## 6. Success Metrics — 측정 방법

| Metric | 도구 |
|---|---|
| 페이지뷰·세션 | Vercel Web Analytics |
| Core Web Vitals | Vercel Speed Insights (Real User) |
| 에러율 | Vercel Runtime Logs + error.tsx digest 수집 |
| 검색엔진 인덱싱 | Google Search Console + sitemap.xml (60 URL) |
| 소셜 공유 | OG 프리뷰 + Twitter Card Validator |
| 오픈소스 관심도 | GitHub stars / forks / issues |
| 접근성 | Lighthouse CI |

---

## 7. Risks & Mitigation

| 리스크 | 가능성 | 영향 | 완화 |
|---|---|---|---|
| 원본 사이트 폐쇄·링크 단절 | 중 | 높 | 모든 이미지 Supabase Storage로 백업 가능한 `image-config.ts` 추상화 |
| Supabase Free tier 한도 초과 | 중 | 중 | force-dynamic + 쿼리 캐싱 + RLS 정책 |
| archives.go.kr rate limiting | 낮 | 낮 | 이미지 경로 whitelist + preconnect 힌트 |
| 저작권 민감 자료 | 낮 | 높 | 출처 링크 + 비영리·공공데이터 명시 (footer) |
| 바이럴 이후 트래픽 폭증 | 중 | 중 | Vercel 자동 스케일링 + next/image CDN |

---

## 8. Milestones (History)

| Phase | 기간 | 주요 산출물 |
|---|---|---|
| **M0. 데이터 수집** | 초기 | Python 스크래퍼 · 45 케이스 · 4 스토리 · 8 비디오 |
| **M1. 스키마 + 시딩** | 초기 | Supabase 테이블 9개 · RLS · 시딩 스크립트 |
| **M2. MVP 프론트엔드** | 초기 | Next.js App Router · 기본 페이지 · 배포 |
| **M3. 스토리텔링** | 중기 | 기획전시 · ImageCompareSlider · 원문 뷰어 |
| **M4. AI 미디어 분석** | 중기 | ffmpeg · Whisper · Tesseract OCR · 영상 요약·자막 |
| **M5. 인터랙션 폴리싱** | 후기 | 타임라인 · 갤러리 · 검색 · 필터 · 관련 사례 |
| **M6. 박물관급 디자인 통일** | 후기 | 전체 서피스 뮤지엄 헤더 패턴 · 다크/골드 테마 |
| **M7. 인프라·SEO·PWA** | 후기 | OG 이미지 · JSON-LD · 매니페스트 · 보안 헤더 |
| **M8. 접근성·성능·분석** | 현재 | next/image · 키보드 단축키 · Vercel Analytics |

---

## 9. Deliverables

1. **Live 제품** — https://projectrestore.vercel.app
2. **GitHub 저장소** — 오픈소스, MIT 라이선스 (예정)
3. **기술 문서** — `docs/TECHNICAL.md`
4. **구축 문서** — `docs/BUILD.md`
5. **계획서** (본 문서) — `docs/PLAN.md`
6. **SNS 홍보 카드** — `docs/SOCIAL_CAROUSEL.md`

---

## 10. License & Attribution

- **코드**: MIT License (예정)
- **데이터 출처**: 국가기록원 (https://www.archives.go.kr) — 공공데이터 활용 비영리 프로젝트
- **브랜드**: "기록유산 복원 아카이브" 는 본 프로젝트 고유 명칭 (국가기록원 공식 기관명 아님)
