# My Tracklist 스크롤 히어로

## 바뀌는 것
- My Tracklist 케이스 스터디 맨 위: 화면이 고정된 채로 스크롤하는 만큼 35곡이 넘어감
- 포스터는 페이드로 바뀌고, 배경은 그 포스터의 대표색 (맨 위는 사이트 배경으로 시작)
- 16번 Saturn(가로)만 화면 전체 폭, 35번 다음은 책 표지로 착지하면서 Browse all 35 tracks, Blurb 링크
- 아래 레일: 클릭하면 그 곡으로 이동, 좌우로 드래그하면 스크럽, 포커스 후 ← → 키
- 동작 줄이기 설정인 사람한테는 색과 페이드 없이 조용하게
- 배경색은 상단바 아래에만 칠함 (상단바 메뉴 글자가 어두운 포스터에 묻히지 않게)
- tracks 페이지: 포스터 alt 텍스트의 em dash 두 군데 수정 ("Poster for ILYSB by LANY" 식)
- 본문, 다른 프로젝트 페이지, 홈 화면은 그대로

## 파일
새로 추가
- components/tracklist/ : 히어로 컴포넌트, 스크롤 엔진, CSS
- content/tracklist.ts : 이미지 폴더, 스크롤 길이, 책 표지 문구 (여기서 수정)
- public/images/tracklist-hero/md/ : 680 × 1020px 포스터 35장 + 책 표지 (약 2.5MB)
- public/images/tracklist-hero/lg/ : 1000 × 1500px 포스터 35장 + 책 표지 (약 5.2MB)
  화면 크기에 맞는 한 세트만 받고, 지금 보는 곡 주변부터 받음

수정
- app/work/[slug]/page.tsx : My Tracklist 전용 히어로 연결
- content/projects.ts : my-tracklist에 showcase: 'tracklist' 추가
- content/tracks.ts : 곡마다 color(배경색) 추가
- app/work/my-tracklist/tracks/page.tsx : alt 텍스트 수정

## 설치
1. zip 풀고 안의 내용물을 레포 루트(package.json 있는 폴더)에 복사, 덮어쓰기
2. git add -A
   git commit -m "My Tracklist: scroll-driven hero"
   git push
3. 2~3분 뒤 kimdohyeong.com/work/my-tracklist 에서 Ctrl+F5

## 조절하고 싶을 때
- 곡별 배경색: content/tracks.ts 의 color (글자색은 밝기 보고 자동으로 정해짐)
- 스크롤 길이: content/tracklist.ts 의 perTrack (지금 1.6, 보통 1, 짧게 0.6)
- 책 표지 문구: content/tracklist.ts 의 book
