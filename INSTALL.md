# Out of Plane 3D 히어로 업데이트

## 바뀌는 것
- Out of Plane 케이스 스터디 맨 위: 조인트가 화면 밖에서 모이고, 도웰이 가운데부터 이어지는 3D 히어로 (미리보기로 본 그대로)
- 스크롤하면 정면에서 옆모습으로, 드래그로 돌려보기, 조인트/도웰에 마우스 올리면 정보
- 예전 맨 위 사진(oop-gallery.jpg)은 Process 05 Installation 첫 이미지로 옮김 (캡션: Gallery view)
- 다른 프로젝트 페이지는 그대로. three.js는 이 페이지에서만 따로 불러와서 다른 페이지 용량은 안 늘어남

## 파일
새로 추가
- components/oop/ : 히어로 컴포넌트, 3D 엔진, CSS
- content/oop.ts : 스크롤 캡션 문구 (여기서 수정)
- public/models/oop-hero.bin : 조인트 + 도웰 모델 (665KB)

수정
- app/work/[slug]/page.tsx, content/projects.ts
- package.json, package-lock.json : three.js 추가 (0.159.0)

## 설치
1. zip 풀기
2. 안의 폴더와 파일을 레포 루트(package.json이랑 .git 있는 폴더)에 그대로 복사, 덮어쓰기
3. 푸시
   git add -A
   git commit -m "Out of Plane: 3D hero (joints gather, dowels connect)"
   git push
4. Vercel이 three.js를 알아서 설치하고 배포함 (1~2분)

## 로컬에서 볼 때 (선택)
새 패키지가 생겨서 처음 한 번은 npm install 필요
   npm install
   npm run dev
그다음 http://localhost:3000/work/out-of-plane
