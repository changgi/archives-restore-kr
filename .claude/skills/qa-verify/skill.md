---
name: qa-verify
description: "프론트엔드-백엔드 경계면 교차 검증, Supabase 타입 정합성, Next.js 라우트 일관성, 빌드 성공 검증을 수행하는 스킬. 코드 통합 검증, 빌드 테스트, 타입 체크, 경계면 불일치 탐지가 필요하면 반드시 이 스킬을 사용할 것."
---

# QA Verify — 통합 품질 검증

## 검증 철학
개별 파일이 "존재하는가"가 아니라 **"연결이 올바른가"**를 검증한다. 대부분의 버그는 두 모듈이 만나는 경계면에서 발생한다.

## 필수 검증 체크리스트

### 1. Supabase 응답 shape vs TypeScript 타입
```bash
# 1. Supabase에서 실제 쿼리 결과 shape 확인
# 2. src/types/database.ts의 타입 정의와 비교
# 3. src/lib/supabase/queries.ts의 select 절과 타입 매칭 확인
```

**주요 확인 포인트:**
- `.select('*, organizations(name)')` 의 조인 결과가 타입에 반영되는가
- `case_images`가 배열로 오는가, 단일 객체로 오는가
- nullable 필드가 타입에 `| null`로 표현되는가

### 2. 파일 라우트 vs 링크 경로
```bash
# src/app/ 하위 폴더 구조에서 URL 패턴 추출
# 모든 Link href, router.push(), redirect() 값 수집
# 불일치 항목 리포트
```

### 3. 환경변수 일관성
```bash
# .env.local (또는 .env.example) 변수 목록
# process.env.NEXT_PUBLIC_* 참조 목록
# 누락된 변수 탐지
```

### 4. 컴포넌트 Props 일관성
```bash
# 컴포넌트 정의의 Props 인터페이스
# 해당 컴포넌트를 사용하는 곳에서 전달하는 props
# 타입 불일치, 누락된 필수 props 탐지
```

### 5. 빌드 검증
```bash
npm run build
```
- 타입 에러 제로
- 빌드 경고 최소화
- 이미지 도메인 설정 확인 (`next.config.ts`의 `images.remotePatterns`)

### 6. 접근성 기본 검증
- 모든 이미지에 `alt` 속성
- 인터랙티브 요소에 키보드 접근 가능
- 색상 대비 충분 (다크/라이트 모두)

## 검증 실행 순서

1. **타입 체크**: `npx tsc --noEmit` 실행
2. **경계면 교차 비교**: Supabase 쿼리 ↔ 타입 ↔ 컴포넌트 props
3. **라우트 일관성**: 폴더 구조 ↔ Link/router 사용처
4. **환경변수**: .env ↔ 코드 참조
5. **빌드 테스트**: `npm run build`
6. **수정**: 발견된 이슈 직접 수정 (가능한 경우)
7. **리포트**: `_workspace/03_qa_report.md`에 결과 기록

## 이슈 리포트 형식

```markdown
## QA Report — [날짜]

### Critical (빌드 실패 유발)
- [ ] `src/app/cases/[id]/page.tsx:15` — `case.organizations.name` 접근하지만
      `queries.ts`에서 `organizations(name)`을 select하지 않음

### Warning (런타임 에러 가능)
- [ ] `src/components/ImageCompareSlider.tsx:42` — `beforeImage` prop이 nullable이지만
      null 체크 없이 사용

### Info (개선 권장)
- [ ] `src/app/page.tsx` — `generateMetadata` 누락
```

## 산출물
- `_workspace/03_qa_report.md`
- 직접 수정된 코드 파일들
