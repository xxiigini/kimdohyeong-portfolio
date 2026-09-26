# Soban 비교 히어로 (A안)

## 바뀌는 것
- Soban 케이스 스터디 맨 위: 예전 메뉴판 사진과 새 메뉴판 사진을 겹쳐 두고 세로선으로 비교
- 두 사진은 화면 네 개 모서리 기준으로 원근을 맞춰 둬서, 선을 움직이면 같은 화면이 그 자리에서 바뀜
- 처음 화면에 들어오면 한 번만: 전부 Before → 전부 After → 가운데 (두 사진을 다 받은 다음 시작)
- 사진 아무 데나 드래그하거나, 가운데 동그라미에 포커스 후 ← → 키로 비교
- 휴대폰에서는 세로로 잘라서 가운데 두 화면이 보이고, 위아래 스크롤은 그대로
- 동작 줄이기 설정인 사람한테는 쓸기 없이 가운데에서 시작
- 본문, 다른 프로젝트 페이지, 홈 화면은 그대로 (본문의 before / after 사진도 그대로)

## 파일
새로 추가
- components/soban/ : 히어로 컴포넌트, 비교 엔진, CSS
- content/soban.ts : 사진 경로, alt 텍스트, 사진 아래 문구 (여기서 수정)
- public/images/soban-compare/before.webp : 예전 메뉴판 (새 사진 원근에 맞춰 편 것, 1800 × 720)
- public/images/soban-compare/after.webp : Hales Corners 새 메뉴판 (1800 × 720)

수정
- app/work/[slug]/page.tsx : Soban 전용 히어로 연결
- content/projects.ts : soban에 showcase: 'soban' 추가

## 설치
1. zip 풀고 안의 내용물을 레포 루트(package.json 있는 폴더)에 복사, 덮어쓰기
2. git add -A
   git commit -m "Soban: before/after compare hero (option A)"
   git push
3. 2~3분 뒤 kimdohyeong.com/work/soban 에서 Ctrl+F5

## 조절하고 싶을 때
- 사진 아래 문구, "Drag to compare": content/soban.ts 의 caption, hint
- 휴대폰에서 보이는 위치: components/soban/soban.module.css 의 --op (지금 44% 50%)
- 더 큰 원본 사진으로 바꿀 때는 before를 다시 원근에 맞춰야 함 (그냥 바꿔 넣으면 화면이 어긋남)
