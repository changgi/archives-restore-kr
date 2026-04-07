---
name: archives-restore-orchestrator
description: "국가기록원 기록물 복원 웹앱 프로젝트의 전체 파이프라인을 오케스트레이션하는 스킬. 데이터 수집 → 프론트엔드 구축 → UI 구현 → QA → 배포까지 에이전트 팀을 구성하고 조율한다. '복원 프로젝트 시작', '프로젝트 빌드', '전체 파이프라인 실행' 요청 시 반드시 이 스킬을 사용할 것."
---

# Archives Restore Orchestrator — 전체 파이프라인 조율

## 실행 모드: 에이전트 팀 (Agent Team)

에이전트 간 실시간 소통이 필요하므로 에이전트 팀 모드를 사용한다. 특히 frontend-architect와 ui-craftsman은 컴포넌트 인터페이스를 실시간으로 조율해야 한다.

## 전체 아키텍처

```
Phase 1: 기반 구축          [data-engineer] 단독
    ↓ (스키마 + 데이터 완료)
Phase 2: 프론트엔드 구축     [frontend-architect] + [ui-craftsman] 병렬 협업
    ↓ (빌드 가능한 앱)
Phase 3: 통합 검증          [qa-engineer] 단독
    ↓ (이슈 수정 완료)
Phase 4: 배포              오케스트레이터 직접 실행
```

## Phase 0: 준비

1. `_workspace/` 디렉토리 생성
2. Supabase 프로젝트 확인 (기존 프로젝트 사용 또는 새로 생성)
3. 프로젝트 루트에 필수 파일 존재 확인

```
mkdir -p _workspace
```

## Phase 1: 데이터 기반 구축

### 팀 구성
- 이 Phase에서는 서브 에이전트 모드 사용 (data-engineer 1명만 필요)

### 실행
```
Agent(
  name: "data-engineer",
  prompt: ".claude/agents/data-engineer.md의 역할에 따라 .claude/skills/data-pipeline/skill.md를 참조하여 실행하라.

  Supabase 프로젝트 ID: {project_id}

  작업:
  1. archives.go.kr에서 복원 사례 데이터 수집
  2. Supabase에 스키마 마이그레이션 적용
  3. 수집한 데이터를 시딩
  4. _workspace/01_data_report.md에 결과 기록",
  model: "opus"
)
```

### 완료 조건
- `_workspace/01_data_report.md` 존재
- Supabase에 restoration_cases 42건 확인
- RLS 정책 적용 확인

## Phase 2: 프론트엔드 구축

### 팀 구성
```
TeamCreate(team_name: "frontend-team")

# 팀원 스폰
Agent(
  name: "frontend-architect",
  team_name: "frontend-team",
  prompt: ".claude/agents/frontend-architect.md의 역할에 따라 작업하라.
  .claude/skills/frontend-build/skill.md를 참조하라.

  Supabase 프로젝트 정보:
  - URL: {supabase_url}
  - Anon Key: {anon_key}

  Phase 1 산출물을 확인하라:
  - _workspace/01_data_schema.sql (DB 스키마)
  - _workspace/01_data_report.md (데이터 현황)

  작업:
  1. Next.js 15 프로젝트 초기화
  2. Supabase 클라이언트 설정
  3. 타입 정의
  4. 페이지 라우트 구조 생성
  5. 데이터 페칭 함수 구현
  6. ui-craftsman에게 필요한 컴포넌트 스펙을 SendMessage로 전달
  7. ui-craftsman이 만든 컴포넌트를 페이지에 통합",
  model: "opus"
)

Agent(
  name: "ui-craftsman",
  team_name: "frontend-team",
  prompt: ".claude/agents/ui-craftsman.md의 역할에 따라 작업하라.
  .claude/skills/ui-craft/skill.md를 참조하라.

  작업:
  1. frontend-architect로부터 컴포넌트 스펙을 수신 대기
  2. 핵심 컴포넌트 구현 (ImageCompareSlider, TimelineView, FilterGrid 등)
  3. 글로벌 스타일 시스템 구축 (다크모드, 폰트, CSS 변수)
  4. 완료된 컴포넌트를 frontend-architect에게 SendMessage로 알림

  우선순위: ImageCompareSlider > HeroSection > NavigationBar > RecordCard > FilterGrid > TimelineView > GalleryLightbox > StatsCounter > SearchBar",
  model: "opus"
)
```

### 작업 생성
```
TaskCreate([
  { title: "Next.js 프로젝트 초기화 + Supabase 설정", owner: "frontend-architect" },
  { title: "타입 정의 + 데이터 페칭 함수", owner: "frontend-architect", depends_on: [1] },
  { title: "글로벌 스타일 + 다크모드 + 폰트", owner: "ui-craftsman" },
  { title: "NavigationBar + HeroSection 컴포넌트", owner: "ui-craftsman", depends_on: [3] },
  { title: "ImageCompareSlider + RecordCard 컴포넌트", owner: "ui-craftsman", depends_on: [3] },
  { title: "FilterGrid + SearchBar 컴포넌트", owner: "ui-craftsman", depends_on: [3] },
  { title: "TimelineView + StatsCounter 컴포넌트", owner: "ui-craftsman", depends_on: [3] },
  { title: "GalleryLightbox 컴포넌트", owner: "ui-craftsman", depends_on: [3] },
  { title: "홈페이지 + 사례목록 페이지 조립", owner: "frontend-architect", depends_on: [2, 4, 5] },
  { title: "사례상세 + 타임라인 + 갤러리 페이지 조립", owner: "frontend-architect", depends_on: [2, 5, 7, 8] },
  { title: "SEO + 메타데이터 + OG 이미지", owner: "frontend-architect", depends_on: [9, 10] },
])
```

### 완료 조건
- `npm run build` 성공
- 모든 페이지 라우트 접근 가능
- 다크모드 전환 동작
- 모바일 뷰포트에서 레이아웃 정상

## Phase 3: 통합 검증

### 팀 재구성
Phase 2 팀 해체 후 QA 에이전트 스폰.

```
TeamDelete()  # Phase 2 팀 정리

Agent(
  name: "qa-engineer",
  prompt: ".claude/agents/qa-engineer.md의 역할에 따라 작업하라.
  .claude/skills/qa-verify/skill.md를 참조하라.

  검증 대상: C:/project_restore/ 전체 프로젝트

  필수 검증:
  1. Supabase 쿼리 결과 shape vs TypeScript 타입 일치
  2. 파일 라우트 vs Link/router 경로 일치
  3. 환경변수 일관성
  4. 컴포넌트 Props 일관성
  5. npm run build 성공
  6. 접근성 기본 검증

  발견된 이슈는 직접 수정하고 _workspace/03_qa_report.md에 기록하라.",
  model: "opus"
)
```

### 완료 조건
- `_workspace/03_qa_report.md` 존재
- Critical 이슈 제로
- `npm run build` 성공

## Phase 4: 배포

오케스트레이터가 직접 실행한다.

### 4-1. GitHub 저장소
```bash
git init
git add .
git commit -m "feat: 국가기록원 기록물 복원 인터랙티브 웹앱 v1.0"
gh repo create archives-restore-kr --public --source=. --push
```

### 4-2. Vercel 배포
```
deploy_to_vercel()
```

### 4-3. 환경변수 설정
Vercel 대시보드에서 Supabase 환경변수 설정 확인.

### 4-4. 최종 확인
- 프로덕션 URL 접근
- 모바일/데스크탑 양쪽 확인
- OG 이미지 동작 확인

## 에러 핸들링

| 에러 유형 | 대응 |
|----------|------|
| 데이터 수집 실패 | HTML 수동 파싱 또는 하드코딩 데이터 사용 |
| Supabase 연결 실패 | 프로젝트 상태 확인, 필요 시 복원 |
| 빌드 실패 | QA 리포트 기반 수정, 최대 3회 재시도 |
| 배포 실패 | 빌드 로그 확인, 환경변수 점검 |
| 팀원 통신 두절 | 해당 에이전트 재스폰 |

## 데이터 전달 프로토콜

| Phase 전환 | 전달 방식 | 전달 내용 |
|-----------|----------|----------|
| 0→1 | 프롬프트 파라미터 | Supabase 프로젝트 ID |
| 1→2 | 파일 기반 | `_workspace/01_*` 파일들 |
| 2→3 | 파일 기반 | 전체 소스 코드 |
| 3→4 | 파일 기반 | 수정된 소스 + QA 리포트 |

## 테스트 시나리오

### 정상 흐름
1. Phase 0: _workspace 생성, Supabase 프로젝트 확인 → 성공
2. Phase 1: 42건 데이터 수집, DB 시딩 → 성공
3. Phase 2: Next.js 앱 구축, 컴포넌트 통합 → 빌드 성공
4. Phase 3: QA 검증, 마이너 이슈 수정 → Critical 제로
5. Phase 4: GitHub + Vercel 배포 → 프로덕션 접근 가능

### 에러 흐름: 사이트 접속 불가
1. Phase 1에서 archives.go.kr 접속 실패
2. 오케스트레이터가 하드코딩 데이터 경로 제공
3. data-engineer가 하드코딩 데이터로 DB 시딩
4. 이후 Phase 정상 진행
