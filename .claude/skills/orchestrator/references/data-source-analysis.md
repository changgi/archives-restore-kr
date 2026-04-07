# 국가기록원 복원 데이터 소스 분석

## 대상 URL 목록

| 페이지 | URL | 데이터 건수 | 비고 |
|-------|-----|-----------|------|
| 대외 복원처리 지원사례 | `/next/newmanager/archivesRestoreData.do` | 42건 (종이 39 + 시청각 3) | 메인 데이터 |
| 훼손예방사례 | `/next/newmanager/damagePreventionCase.do` | 8건 | PDF 포함 |
| 소장기록물 복원사례 | `/next/newmanager/archivesRestoreSupports.do` | 동영상 기반 | 카드형 |
| 관련 자료 | `/next/newmanager/archivesRestorePlus.do` | 8건 영상 | 임베드 |
| 보존복원 소개 | `/next/newmanager/archivesRestore.do` | - | 정적 소개 |

## 메인 데이터 필드 상세 (archivesRestoreData.do)

### 복원 사례 메타데이터
- **제목**: 기록물명 (괄호 안에 연도 포함되는 경우 있음)
- **의뢰기관**: 복원을 요청한 기관명
- **지원시기**: 연도 (2009~2025)
- **지원내역**: 복원 / 복제 / 복원.복제 / 응급 복구 / 디지털화.디지털복원
- **수량**: "2건", "1건 234매" 등 자유형식
- **설명**: 1~3문단 자유형식 텍스트
- **이미지**: 복원 전/후 각 1장 (일부 사례는 다수)

### 카테고리 구조
```
종이 기록물 (paper) — 39건
├── 복원처리 — 22건
└── 복제처리 — 나머지

시청각 기록물 (audiovisual) — 3건
```

### 의뢰기관 분포
```
독립기념관: 5건
단국대학교 석주선기념박물관: 4건
민족문제연구소: 2건
영화진흥위원회: 2건
철도박물관: 2건
기타 (각 1건): ~25개 기관
```

### 연도별 분포
```
2009: 1건
2010: 2건
2011: 2건
2012: 1건
2013: 2건
2014: 2건
2015: 1건
2016: 2건
2017: 3건
2018: 3건
2019: 2건
2020: 2건
2021: 2건
2022: 2건
2023: 3건
2024: 7건
2025: 5건
```

## 이미지 경로 패턴
- 기본: `/next/images/site2/archives_restore/`
- 팝업: `/next/images/site2/archives_popup/`
- 형식: JPG/PNG
- 접근: 인증 불필요 (공개)

## HTML 구조 (데이터 추출용)

### 사례 카드 구조
```html
<div class="con-wrap">
  <div class="conTab1-wrap tab-wrap">
    <ul class="conTab1 tabNav">
      <li>종이 기록물</li>
      <li>시청각 기록물</li>
    </ul>
    <div class="tabContents">
      <!-- 각 사례 -->
      <div class="restore-item">
        <em>제목</em>
        <dl>
          <dt>의뢰기관</dt><dd>기관명</dd>
          <dt>지원시기</dt><dd>2024년</dd>
          <dt>지원내역</dt><dd>복원</dd>
          <dt>수량</dt><dd>2건</dd>
        </dl>
        <p>설명 텍스트...</p>
        <div class="img-wrap">
          <img src="복원전.jpg" alt="복원 전">
          <img src="복원후.jpg" alt="복원 후">
        </div>
      </div>
    </div>
  </div>
</div>
```

## 기술 스택 (현재 사이트)
- Server: Java Spring MVC (.do endpoints)
- Frontend: jQuery 1.12.4, jQuery UI, Swiper 8.4.2
- 렌더링: 서버사이드 (SSR, no API)
- 모든 데이터가 HTML에 하드코딩됨
