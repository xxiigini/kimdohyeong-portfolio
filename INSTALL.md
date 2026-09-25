# Acro 스크롤 히어로 (C안)

## 바뀌는 것
- Acro 케이스 스터디 맨 위: 화면이 고정된 채로 스크롤하는 만큼 로봇이 한 사이클을 움직임
- 동작에 맞춰 캡션이 바뀜 (The cell, Pick, Swing, Place, Return, Live)
- 맨 끝까지 스크롤하면 acro.com에서처럼 실제 속도로 루프 재생 (readout에 "real speed" 표시)
- 흰 배경 카드는 모든 테마에서 흰색 유지 (영상의 white background 그대로)
- 다른 프로젝트 페이지, 홈 화면 카드는 그대로 (acro-final.mp4도 홈에서 계속 씀)

## 파일
새로 추가
- components/acro/ : 히어로 컴포넌트, 스크롤 엔진, CSS
- content/acro.ts : 캡션 문구, 동작 구간, 프레임 목록 (문구는 여기서 수정)
- public/images/acro-frames/md/ : 1024px 프레임 151장 (약 3.0MB)
- public/images/acro-frames/lg/ : 1536px 프레임 151장 (약 4.5MB)
  화면 크기에 맞는 한 세트만 받고, 거친 간격부터 받아서 채워 넣음

수정
- app/work/[slug]/page.tsx : Acro 전용 히어로 연결
- content/projects.ts : acro 프로젝트에 showcase: 'acro' 추가

## 설치
1. zip 풀고 안의 내용물을 레포 루트(package.json 있는 폴더)에 복사, 덮어쓰기
2. git add -A
   git commit -m "Acro: scroll-driven hero (option C)"
   git push
3. 2~3분 뒤 kimdohyeong.com/work/acro 에서 Ctrl+F5

## 조절하고 싶을 때
- 캡션 문구: content/acro.ts 의 ACRO_CAPTIONS
- 끝에서 실제 속도 루프를 끄려면: content/acro.ts 의 ACRO_LIVE_FROM 을 1로
- 스크롤 길이: components/acro/acro.module.css 의 .acro height (지금 420vh, 휴대폰 380vh)
