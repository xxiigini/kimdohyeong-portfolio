# LAMY 페이지 업데이트

## 바뀌는 것
- LAMY 케이스 스터디: 10색 라인업 히어로 + 스크롤 분해 섹션 (프리뷰로 본 그대로)
- 다른 프로젝트 페이지는 그대로. 라벨의 em dash만 가운뎃점으로 바뀜 (예: 002 · 3D / Motion)
- 상단바 시계가 뜨기 전 자리표시: --:--:--
- Process 05 이미지: 분해 영상 대신 책상 렌더 (분해는 위 섹션으로 이동)
- 새 패키지 없음. npm install 필요 없음

## 파일
새로 추가
- components/lamy/ : 히어로, 분해 섹션, 애니메이션 엔진, 재색상 렌더러, CSS
- components/case-study/CaseStudyBody.tsx : 본문을 공용 컴포넌트로 분리
- content/lamy.ts : 색 이름, 메모, 치수, 부품 위치 (문구는 여기서 수정)
- public/images/lamy-lineup/ : 10색 펜 + 그림자
- public/images/lamy-exploded/lg, sm : 분해 프레임 89장 (데스크탑 1920 / 모바일 960)

수정
- app/work/[slug]/page.tsx, app/globals.css, content/projects.ts
- components/case-study/CaseStudyHero.tsx, CaseStudySection.tsx
- components/layout/StatusBar.tsx

## 설치
1. zip 풀기
2. 안의 폴더와 파일을 레포 루트(package.json이랑 .git 있는 폴더)에 그대로 복사, 덮어쓰기
   zip 안에는 portfolio 폴더가 없음. 폴더째 넣지 말고 내용물만.
3. 로컬 확인 (선택): npm run dev 후 http://localhost:3000/work/lamy-reverse-engineering
4. 푸시
   git add -A
   git commit -m "LAMY: color lineup hero + interactive exploded view"
   git push

## 정리 (선택, 한 번만)
예전 zip 덮어쓰기 때 잘못 들어간 폴더 두 개. 레포 루트에서:
   Remove-Item -LiteralPath '.\portfolio' -Recurse -Force
   Remove-Item -LiteralPath '.\public\{videos,images}' -Recurse -Force
그다음 위 4번 git 명령 그대로. ({videos,images} 안의 10MB 중복 영상도 같이 빠짐)

## 진짜 렌더로 바꿀 때
지금 10색은 Rhino 렌더 한 장을 재색상한 임시본.
Rhino에서 같은 Named View로 투명 배경, 바닥 그림자 없이 10장 뽑아서 주면
크롭이랑 변환은 맞춰서 다시 줌.
