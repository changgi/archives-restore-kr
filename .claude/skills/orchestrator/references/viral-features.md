# GitHub 스타 1만개를 위한 바이럴 피처 가이드

## 왜 이 프로젝트가 바이럴될 수 있는가

1. **공공 데이터 활용**: 정부 오픈 데이터를 아름답게 시각화한 사례는 항상 주목받음
2. **Before/After**: 시각적 임팩트가 강한 콘텐츠 (복원 전/후 비교)
3. **문화재/역사**: 글로벌 관심사 (한국 문화 콘텐츠 관심 증가)
4. **기술 쇼케이스**: Next.js + Supabase + Vercel 스택의 레퍼런스 프로젝트

## 핵심 바이럴 요소

### 1. 첫인상 (3초 룰)
- 풀스크린 히어로 with 패럴랙스
- 대형 Before/After 슬라이더가 메인에 즉시 보임
- 다크 테마 기본 (전통/문화재 분위기)
- 금색/적색 포인트 컬러 (동양적 고급감)

### 2. 인터랙티브 쇼케이스
- 드래그 가능한 Before/After 슬라이더 (모바일 터치 지원)
- 연도별 타임라인 시각화 (2009~2025)
- 기관별/유형별 필터링 with 레이아웃 애니메이션
- 풀스크린 갤러리 with 제스처

### 3. 기술적 품질
- Lighthouse 100점 목표 (Performance, SEO, Accessibility)
- 완벽한 다크모드
- 한/영 다국어
- PWA 지원
- 완벽한 반응형

### 4. 개발자 친화적
- 깔끔한 코드 구조 (참조 프로젝트로 활용 가능)
- 잘 정리된 README
- 기여 가이드
- MIT 라이선스
- 데모 사이트 링크

## README 구성 (필수)

```markdown
# 🏛️ Archives Restore Korea

> 국가기록원 기록물 복원 사례를 인터랙티브하게 탐색하세요

[데모](url) | [Contributing](CONTRIBUTING.md)

![hero screenshot](screenshot.png)

## ✨ Features
- 🖼️ Before/After 이미지 비교 슬라이더
- 📅 인터랙티브 타임라인
- 🔍 실시간 검색 & 필터링
- 🌙 다크모드
- 📱 완벽한 반응형
- 🌐 한국어/English

## 🛠️ Tech Stack
Next.js 15 | Supabase | Tailwind CSS | Framer Motion | Vercel

## 🚀 Getting Started
...

## 📊 Data Source
국가기록원 (National Archives of Korea)
```

## SEO & 소셜 미디어 최적화

### OG 이미지
- 각 사례별 동적 OG 이미지 생성 (/api/og)
- Before/After 분할 이미지
- 프로젝트명 + 사례명 텍스트

### 공유 URL 구조
- `/cases/[id]` — 개별 사례 공유 가능
- `/timeline?year=2024` — 특정 연도 공유
- `/gallery` — 갤러리 공유

## 성능 목표
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Total Blocking Time: < 200ms
- Cumulative Layout Shift: < 0.1
