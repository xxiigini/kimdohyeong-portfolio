# Out of Plane 업데이트 — 설치 방법

이 압축파일에는:

1. **`portfolio/content/projects.ts`** — Out of Plane 케이스 스터디 추가 (003번)
2. **`portfolio/lib/site-config.ts`** — status bar의 "now designing" 텍스트 → "Open to new projects"
3. **`portfolio/public/images/`** — Out of Plane 이미지 5장 (웹 최적화 jpg)
   - `oop-gallery.jpg` — 갤러리 mockup (히어로)
   - `oop-grasshopper.jpg` — Grasshopper 정의
   - `oop-labeling.jpg` — 셀 라벨링 다이어그램
   - `oop-hangers.jpg` — PLA-CF hanger parts
   - `oop-installed.jpg` — 실제 설치 사진 (임시, 나중에 교체)

## 설치 (Soban 때랑 똑같음)

1. 이 zip 압축 풀기
2. 안의 `portfolio` 폴더 내용물을 너의 기존 `portfolio` 폴더에 복사 (덮어쓰기)
3. PowerShell에서 사이트 켜져 있으면 자동 새로고침
   - 안 켜져 있으면: `cd "$env:USERPROFILE\Downloads\portfolio-setup-v2\portfolio"` 후 `npm run dev`
4. 브라우저에서 `localhost:3000` 새로고침

## 확인 사항

홈페이지에 3개 프로젝트 다 보여야 해:
- 001 Acro Automation Systems · 3D / Motion · 2024
- 002 Soban Korean Eatery · Brand & Menu System · 2025
- 003 Out of Plane · Parametric / Installation · 2026

Out of Plane 클릭하면 케이스 스터디 페이지 보임. 5단계 process가 다 보여야 함.

## 나중에 hero 사진 교체할 때

`oop-installed.jpg` 자리에 더 좋은 사진이 생기면, 같은 파일명으로 덮어쓰기만 하면 돼.
