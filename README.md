# Kim, Dohyeong — Portfolio

도형의 포트폴리오 사이트. Next.js 14 + Tailwind + Pretendard.

---

## 처음 셋업 (한 번만)

```bash
# 1. 의존성 설치
npm install

# 2. 로컬에서 보기
npm run dev
# → http://localhost:3000 에서 확인
```

---

## 사이트 운영 — 자주 바꿀 것들

### 1. Status bar 정보 바꾸기
`lib/site-config.ts` 파일 열어서 수정.
- 현재 작업 중인 프로젝트: `status.nowDesigning`
- 가용 상태 (online/offline): `status.available`
- 사용 툴 리스트: `tools`
- 연락처: `contact`

### 2. 새 프로젝트 추가하기
`content/projects.ts` 파일에 새 객체 추가.
구조는 기존 `acro` 항목 참고하면 됨.

미디어 파일은:
- 영상 → `public/videos/`
- 이미지 → `public/images/`

### 3. About 페이지 텍스트
`app/about/page.tsx` 파일에서 `{/* TODO */}` 부분 직접 수정.

### 4. 이력서 PDF
`public/resume.pdf` 파일로 저장하면 About 페이지 다운로드 버튼이 자동 작동.

---

## 배포 (Vercel)

1. GitHub에 이 폴더 푸시
2. vercel.com 가서 GitHub 저장소 연결
3. 도메인(kimdohyeong.com)을 Vercel에 연결
4. 끝. 이후엔 GitHub에 push만 하면 자동 배포됨.

---

## 디자인 결정 메모

- **폰트**: Pretendard (한국 디자이너 표준) + JetBrains Mono (status bar)
- **컬러**: warm off-white 베이스, 거의 흑백, accent는 status bar의 online green (`#1D9E75`)만
- **다크모드**: 자동 시스템 감지 + 수동 토글 (light / system / dark 3가지 모드). 사용자 선택은 localStorage에 저장됨. 첫 로드 시 깜빡임(FOUC) 방지 스크립트 포함.
- **타이포 스케일**: editorial — 본문 15px / heading은 28px–56px
- **모션**: 절제됨. fade와 hover에만 사용. 과한 애니메이션 없음
- **반응형**: 모바일 우선이지만 데스크탑이 메인 (포트폴리오는 보통 큰 화면에서 봄)

---

## 파일 구조

```
app/
  layout.tsx        — 루트 레이아웃 (status bar + footer 포함)
  page.tsx          — 홈
  work/
    page.tsx        — 프로젝트 인덱스
    [slug]/page.tsx — 케이스 스터디 (동적)
  about/page.tsx
  contact/page.tsx
  globals.css

components/
  layout/
    StatusBar.tsx   — 상단 시그니처 컴포넌트
    Footer.tsx
  case-study/       — 케이스 스터디 전용
  ProjectRow.tsx    — 프로젝트 리스트의 한 행
  HeroVideo.tsx     — 영상 플레이어

content/
  projects.ts       — 모든 프로젝트 데이터 (이거 수정해서 새 프로젝트 추가)

lib/
  site-config.ts    — 사이트 전역 설정 (status bar, 연락처 등)

public/
  videos/           — mp4 파일들
  images/           — 이미지들
  resume.pdf        — 이력서
```
