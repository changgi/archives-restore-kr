---
name: data-pipeline
description: "국가기록원 기록물 복원 데이터를 웹에서 수집하고 Supabase 데이터베이스에 정규화하여 저장하는 스킬. archives.go.kr 데이터 크롤링, Supabase 스키마 설계, 마이그레이션, 시드 데이터 생성, Storage 이미지 업로드를 수행한다. 데이터 수집, DB 설계, 시딩 작업이 필요하면 반드시 이 스킬을 사용할 것."
---

# Data Pipeline — 국가기록원 복원 데이터 수집 및 DB 구축

## 목표
archives.go.kr의 기록물 복원 사례 데이터를 수집하여 Supabase에 정규화된 형태로 저장한다.

## Phase 1: 데이터 수집

### 대상 페이지
- **복원 사례**: `https://www.archives.go.kr/next/newmanager/archivesRestoreData.do` (42건)
- **훼손예방**: `https://www.archives.go.kr/next/newmanager/damagePreventionCase.do` (8건)
- **소장기록물 복원**: `https://www.archives.go.kr/next/newmanager/archivesRestoreSupports.do`
- **관련 자료**: `https://www.archives.go.kr/next/newmanager/archivesRestorePlus.do` (영상 8건)

### 수집 방법
1. 브라우저 도구(Claude in Chrome 또는 WebFetch)로 페이지 접근
2. HTML에서 구조화된 데이터 추출 (모든 데이터가 서버 렌더링됨, API 없음)
3. 각 사례의 메타데이터 필드 추출:
   - 제목 (title)
   - 의뢰기관 (requesting_org)
   - 지원시기 (support_year)
   - 지원내역 (support_type: 복원/복제/복원.복제/응급복구/디지털화)
   - 수량 (quantity)
   - 설명 (description)
   - 카테고리 (category: 종이/시청각)
   - 복원 전 이미지 URL (before_image_url)
   - 복원 후 이미지 URL (after_image_url)

### 데이터 정제 규칙
- 연도 형식 통일: "2024년" → 2024 (integer)
- 기관명 정규화: 동일 기관의 다른 표기 통합
- 이미지 URL: 상대 경로를 절대 URL로 변환
- HTML 태그 제거, 공백 정규화

## Phase 2: Supabase 스키마 설계

### 테이블 구조

```sql
-- 복원 사례 메인 테이블
CREATE TABLE restoration_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('paper', 'audiovisual')),
  support_type TEXT NOT NULL,
  support_year INTEGER,
  quantity TEXT,
  requesting_org_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 기관 테이블
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_en TEXT,
  case_count INTEGER DEFAULT 0
);

-- 이미지 테이블
CREATE TABLE case_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES restoration_cases(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL CHECK (image_type IN ('before', 'after', 'process')),
  image_url TEXT NOT NULL,
  storage_path TEXT,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0
);

-- 훼손예방 사례
CREATE TABLE prevention_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  keywords TEXT[],
  category TEXT,
  pdf_url TEXT,
  before_image_url TEXT,
  after_image_url TEXT
);

-- 관련 영상
CREATE TABLE related_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  video_url TEXT,
  thumbnail_url TEXT
);
```

### RLS 정책
- 모든 테이블: `SELECT`는 public(anon) 허용 (공공 데이터)
- `INSERT/UPDATE/DELETE`: authenticated + service_role만 허용

### 인덱스
- `restoration_cases(category, support_year)` — 필터링 성능
- `restoration_cases(requesting_org_id)` — 기관별 조회
- `case_images(case_id)` — 사례별 이미지 조회

## Phase 3: 데이터 시딩

1. 수집한 데이터를 JSON으로 구조화 → `_workspace/01_data_seed.json`
2. Supabase MCP 도구로 마이그레이션 적용
3. `execute_sql`로 시드 데이터 삽입
4. 이미지 URL 검증 (접근 가능 여부)

## Phase 4: 검증

- 총 레코드 수 확인 (restoration_cases: 42, prevention_cases: 8)
- 기관 테이블 참조 무결성 확인
- 이미지 URL 접근성 확인
- RLS 정책 동작 확인

## 산출물
- `_workspace/01_data_schema.sql`
- `_workspace/01_data_seed.json`
- `_workspace/01_data_images.json`
- `_workspace/01_data_report.md`
